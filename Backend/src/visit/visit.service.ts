import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShopVisit } from './shop-visit.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Shop } from '../shop/shop.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { Order } from '../order/order.entity';
import { StartVisitDto } from './dto/start-visit.dto';
import { EndVisitDto } from './dto/end-visit.dto';
import { NoOrderVisitDto } from './dto/no-order-visit.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';

@Injectable()
export class VisitService {
  constructor(
    @InjectRepository(ShopVisit) private visitRepo: Repository<ShopVisit>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    @InjectRepository(WorkingDay) private wdRepo: Repository<WorkingDay>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Manufacturer) private mfrRepo: Repository<Manufacturer>,
    @InjectRepository(ManufacturerDistributor) private mfrDistRepo: Repository<ManufacturerDistributor>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway
  ) {}

  async startVisit(userId: string, dto: StartVisitDto) {
    const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
    if (!salesman) throw new ForbiddenException('Only salesmen can start visits');

    if (salesman.approval_status !== 'APPROVED') {
      throw new ForbiddenException('Salesman is not approved');
    }

    const activeWd = await this.wdRepo.findOne({ where: { salesman_id: salesman.id, status: 'ACTIVE' } });
    if (!activeWd) throw new ForbiddenException('Cannot start visit without active check-in');

    const shop = await this.shopRepo.findOne({ where: { id: dto.shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.distributor_id !== salesman.distributor_id) {
      throw new ForbiddenException('Shop does not belong to your distributor');
    }

    if (dto.idempotencyKey) {
      const existing = await this.visitRepo.findOne({ where: { idempotency_key: dto.idempotencyKey } });
      if (existing) return existing;
    }

    // Timestamp validation: offline timestamps must not be in the future
    if (dto.startedAt) {
      const ts = new Date(dto.startedAt);
      if (isNaN(ts.getTime())) throw new BadRequestException('Invalid startedAt timestamp');
      if (ts > new Date()) throw new BadRequestException('startedAt cannot be in the future');
    }

    let point: any = null;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      point = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    const visit = this.visitRepo.create({
      salesman_id: salesman.id,
      distributor_id: salesman.distributor_id,
      shop_id: shop.id,
      working_day_id: activeWd.id,
      visit_type: dto.visitType || 'AD_HOC',
      status: 'ACTIVE',
      started_at: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      start_location: point,
      is_offline_created: dto.isOfflineCreated || false,
      idempotency_key: dto.idempotencyKey,
    });

    const saved = await this.visitRepo.save(visit);

    await this.auditLogService.logAction('VISIT_STARTED', 'SHOP_VISIT', saved.id, userId, { shop_id: shop.id });

    const dist = await this.distRepo.findOne({ where: { id: salesman.distributor_id } });
    if (dist) {
      this.socketGateway.broadcastToRoom(`distributor:${dist.id}`, 'VISIT_STARTED', {
        visitId: saved.id,
        salesmanId: salesman.id,
        shopId: shop.id,
        timestamp: saved.started_at,
      });
    }

    return saved;
  }

  async endVisit(userId: string, dto: EndVisitDto) {
    const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
    if (!salesman) throw new ForbiddenException('Only salesmen can end visits');

    const visit = await this.visitRepo.findOne({ where: { id: dto.visitId } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.salesman_id !== salesman.id) throw new ForbiddenException('Cannot end visit you do not own');
    if (visit.status === 'CLOSED') throw new BadRequestException('Visit is already closed');

    // Rule: Order must exist OR no-order reason must be provided
    // Since this is endVisit without a reason, we must check for an order
    const orderCount = await this.orderRepo.count({ where: { visit_id: visit.id } });
    if (orderCount === 0 && !visit.no_order_reason) {
      throw new BadRequestException('Cannot close visit without an order or a no-order reason');
    }

    let point: any = null;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      point = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    // Timestamp validation for endVisit
    if (dto.endedAt) {
      const ts = new Date(dto.endedAt);
      if (isNaN(ts.getTime())) throw new BadRequestException('Invalid endedAt timestamp');
      if (ts > new Date()) throw new BadRequestException('endedAt cannot be in the future');
      if (ts < visit.started_at) throw new BadRequestException('endedAt cannot be before visit started_at');
    }

    visit.status = 'CLOSED';
    visit.ended_at = dto.endedAt ? new Date(dto.endedAt) : new Date();
    if (point) visit.end_location = point;

    const saved = await this.visitRepo.save(visit);

    await this.auditLogService.logAction('VISIT_ENDED', 'SHOP_VISIT', saved.id, userId, { order_count: orderCount });

    this.socketGateway.broadcastToRoom(`distributor:${visit.distributor_id}`, 'VISIT_ENDED', {
      visitId: saved.id,
      timestamp: saved.ended_at,
    });

    return saved;
  }

  async noOrderVisit(userId: string, dto: NoOrderVisitDto) {
    const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
    if (!salesman) throw new ForbiddenException('Only salesmen can update visits');

    const visit = await this.visitRepo.findOne({ where: { id: dto.visitId } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.salesman_id !== salesman.id) throw new ForbiddenException('Cannot update visit you do not own');
    if (visit.status === 'CLOSED') throw new BadRequestException('Visit is already closed');

    let point: any = null;
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      point = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    // Timestamp validation for noOrderVisit
    if (dto.endedAt) {
      const ts = new Date(dto.endedAt);
      if (isNaN(ts.getTime())) throw new BadRequestException('Invalid endedAt timestamp');
      if (ts > new Date()) throw new BadRequestException('endedAt cannot be in the future');
      if (ts < visit.started_at) throw new BadRequestException('endedAt cannot be before visit started_at');
    }

    visit.no_order_reason = dto.reason;
    visit.no_order_note = dto.note || '';
    visit.status = 'CLOSED';
    visit.ended_at = dto.endedAt ? new Date(dto.endedAt) : new Date();
    if (point) visit.end_location = point;

    const saved = await this.visitRepo.save(visit);

    await this.auditLogService.logAction('VISIT_ENDED', 'SHOP_VISIT', saved.id, userId, { reason: dto.reason });

    this.socketGateway.broadcastToRoom(`distributor:${visit.distributor_id}`, 'VISIT_ENDED', {
      visitId: saved.id,
      reason: dto.reason,
      timestamp: saved.ended_at,
    });

    return saved;
  }

  async getVisits(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return this.visitRepo.find({ order: { created_at: 'DESC' } });
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor not found');
      return this.visitRepo.find({ where: { distributor_id: dist.id }, order: { created_at: 'DESC' } });
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      
      const linkages = await this.mfrDistRepo.find({ where: { manufacturer_id: mfr.id } });
      const distIds = linkages.map(l => l.distributor_id);
      
      if (distIds.length === 0) return [];
      
      const qb = this.visitRepo.createQueryBuilder('visit');
      qb.where('visit.distributor_id IN (:...distIds)', { distIds });
      qb.orderBy('visit.created_at', 'DESC');
      return qb.getMany();
    } else if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!salesman) throw new ForbiddenException('Salesman not found');
      return this.visitRepo.find({ where: { salesman_id: salesman.id }, order: { created_at: 'DESC' } });
    }
    throw new ForbiddenException('Unauthorized role');
  }

  async getVisitById(userId: string, role: string, id: string) {
    const visit = await this.visitRepo.findOne({ where: { id } });
    if (!visit) throw new NotFoundException('Visit not found');

    if (role === 'SUPER_ADMIN') {
      return visit;
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist || dist.id !== visit.distributor_id) throw new ForbiddenException('Not your visit');
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      
      const isLinked = await this.mfrDistRepo.findOne({
        where: { manufacturer_id: mfr.id, distributor_id: visit.distributor_id }
      });
      if (!isLinked) throw new ForbiddenException('Not in your ecosystem');
    } else if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!salesman || salesman.id !== visit.salesman_id) throw new ForbiddenException('Not your visit');
    }

    return visit;
  }
}
