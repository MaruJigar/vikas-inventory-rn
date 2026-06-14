import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { LocationLog } from './location-log.entity';
import { LatestLocation } from './latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { BatchLocationDto } from './dto/batch-location.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(LocationLog) private locLogRepo: Repository<LocationLog>,
    @InjectRepository(LatestLocation) private latestLocRepo: Repository<LatestLocation>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(WorkingDay) private wdRepo: Repository<WorkingDay>,
    @InjectRepository(Manufacturer) private mfrRepo: Repository<Manufacturer>,
    @InjectRepository(ManufacturerDistributor) private mfrDistRepo: Repository<ManufacturerDistributor>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway
  ) {}

  async uploadLocation(userId: string, dto: CreateLocationDto) {
    const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
    if (!salesman) throw new ForbiddenException('Only salesmen can upload locations');

    const activeWd = await this.wdRepo.findOne({ where: { salesman_id: salesman.id, status: 'ACTIVE' } });
    if (!activeWd) throw new ForbiddenException('Location tracking requires an active check-in');

    const point = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };

    const capturedAt = new Date(dto.captured_at);
    
    // Optional Idempotency check for single uploads
    if (dto.idempotency_key) {
       const existing = await this.locLogRepo.findOne({ where: { sync_status: dto.idempotency_key } });
       if (existing) return existing;
    }

    const locLog = this.locLogRepo.create({
      salesman_id: salesman.id,
      distributor_id: salesman.distributor_id,
      working_day_id: activeWd.id,
      event_type: dto.event_type || 'PERIODIC',
      location: point,
      accuracy: dto.accuracy,
      captured_at: capturedAt,
      device_id: dto.device_id,
      sync_status: dto.idempotency_key || 'SYNCED',
    });

    const savedLog = await this.locLogRepo.save(locLog);

    await this.updateLatestLocation(salesman.id, salesman.distributor_id, activeWd.id, point, (dto.accuracy || 0), capturedAt);
    
    // Emit socket
    const dist = await this.distRepo.findOne({ where: { id: salesman.distributor_id } });
    if (dist) {
      this.socketGateway.broadcastToRoom(`DISTRIBUTOR_ADMIN:${dist.user_id}`, 'LOCATION_UPDATED', {
        salesmanId: salesman.id,
        location: point,
        accuracy: dto.accuracy,
        timestamp: capturedAt.toISOString(),
        isTrackingActive: true,
      });
    }

    return savedLog;
  }

  async batchUploadLocations(userId: string, dto: BatchLocationDto) {
    const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
    if (!salesman) throw new ForbiddenException('Only salesmen can upload locations');

    const activeWd = await this.wdRepo.findOne({ where: { salesman_id: salesman.id, status: 'ACTIVE' } });
    if (!activeWd) throw new ForbiddenException('Location tracking requires an active check-in');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedLogs: any[] = [];
    let latestPoint: any = null;
    let maxDate = new Date(0);
    let latestAccuracy: any = null;

    try {
      // Sort by captured_at ascending
      const sorted = dto.locations.sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());

      for (const loc of sorted) {
        // Idempotency check inside batch loop
        let exists = false;
        if (loc.idempotency_key) {
           const existing = await queryRunner.manager.findOne(LocationLog, { where: { sync_status: loc.idempotency_key } });
           if (existing) exists = true;
        }

        if (!exists) {
           const point = {
             type: 'Point',
             coordinates: [loc.longitude, loc.latitude],
           };
           const capturedAt = new Date(loc.captured_at);

           const locLog = queryRunner.manager.create(LocationLog, {
             salesman_id: salesman.id,
             distributor_id: salesman.distributor_id,
             working_day_id: activeWd.id,
             event_type: loc.event_type || 'PERIODIC',
             location: point,
             accuracy: loc.accuracy,
             captured_at: capturedAt,
             device_id: loc.device_id,
             sync_status: loc.idempotency_key || 'SYNCED',
           });
           
           savedLogs.push(locLog);

           if (capturedAt.getTime() > maxDate.getTime()) {
             maxDate = capturedAt;
             latestPoint = point;
             latestAccuracy = loc.accuracy;
           }
        }
      }

      if (savedLogs.length > 0) {
        await queryRunner.manager.save(savedLogs);
      }

      if (latestPoint) {
         let latest = await queryRunner.manager.findOne(LatestLocation, { where: { salesman_id: salesman.id } });
         if (!latest) {
           latest = queryRunner.manager.create(LatestLocation, { salesman_id: salesman.id });
         }
         // Only update if newer
         if (!latest.last_updated_at || maxDate.getTime() > latest.last_updated_at.getTime()) {
           latest.distributor_id = salesman.distributor_id;
           latest.working_day_id = activeWd.id;
           latest.location = latestPoint;
           latest.accuracy = latestAccuracy;
           latest.is_tracking_active = true;
           latest.last_updated_at = maxDate;
           await queryRunner.manager.save(latest);
         }
      }

      await this.auditLogService.logAction('LOCATION_BATCH_SYNC', 'LOCATION_LOG', salesman.id, userId, { 
         count: savedLogs.length, 
         salesman_id: salesman.id 
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (latestPoint) {
      const dist = await this.distRepo.findOne({ where: { id: salesman.distributor_id } });
      if (dist) {
        this.socketGateway.broadcastToRoom(`DISTRIBUTOR_ADMIN:${dist.user_id}`, 'LOCATION_UPDATED', {
          salesmanId: salesman.id,
          location: latestPoint,
          accuracy: latestAccuracy,
          timestamp: maxDate.toISOString(),
          isTrackingActive: true,
        });
      }
    }

    return { synced_count: savedLogs.length };
  }

  private async updateLatestLocation(salesmanId: string, distId: string, wdId: string, point: any, accuracy: number, capturedAt: Date) {
    let latest = await this.latestLocRepo.findOne({ where: { salesman_id: salesmanId } });
    if (!latest) {
      latest = this.latestLocRepo.create({ salesman_id: salesmanId });
    }
    
    if (!latest.last_updated_at || capturedAt.getTime() > latest.last_updated_at.getTime()) {
      latest.distributor_id = distId;
      latest.working_day_id = wdId;
      latest.location = point;
      latest.accuracy = accuracy;
      latest.is_tracking_active = true;
      latest.last_updated_at = capturedAt;
      await this.latestLocRepo.save(latest);
    }
  }

  async getLiveLocation(userId: string, userRole: string, salesmanId: string) {
     const salesman = await this.salesmanRepo.findOne({ where: { id: salesmanId } });
     if (!salesman) throw new BadRequestException('Salesman not found');

     if (userRole === 'DISTRIBUTOR_ADMIN') {
        const dist = await this.distRepo.findOne({ where: { user_id: userId } });
        if (!dist || dist.id !== salesman.distributor_id) {
           throw new ForbiddenException('Cannot access location of this salesman');
        }
     } else if (userRole === 'MANUFACTURER_ADMIN') {
        const manufacturer = await this.mfrRepo.findOne({ where: { user_id: userId } });
        if (!manufacturer) throw new ForbiddenException('Manufacturer profile not found');

        const isLinked = await this.mfrDistRepo.findOne({
          where: {
            manufacturer_id: manufacturer.id,
            distributor_id: salesman.distributor_id
          }
        });

        if (!isLinked) {
          throw new ForbiddenException('Cannot access location of salesmen outside your distributor ecosystem');
        }
     }

     return this.latestLocRepo.findOne({ where: { salesman_id: salesmanId } });
  }

  async getLocationHistory(userId: string, userRole: string, salesmanId: string) {
     const salesman = await this.salesmanRepo.findOne({ where: { id: salesmanId } });
     if (!salesman) throw new BadRequestException('Salesman not found');

     if (userRole === 'DISTRIBUTOR_ADMIN') {
        const dist = await this.distRepo.findOne({ where: { user_id: userId } });
        if (!dist || dist.id !== salesman.distributor_id) {
           throw new ForbiddenException('Cannot access location history of this salesman');
        }
     } else if (userRole === 'MANUFACTURER_ADMIN') {
        const manufacturer = await this.mfrRepo.findOne({ where: { user_id: userId } });
        if (!manufacturer) throw new ForbiddenException('Manufacturer profile not found');

        const isLinked = await this.mfrDistRepo.findOne({
          where: {
            manufacturer_id: manufacturer.id,
            distributor_id: salesman.distributor_id
          }
        });

        if (!isLinked) {
          throw new ForbiddenException('Cannot access location history of salesmen outside your distributor ecosystem');
        }
     }

     // Simplest version: get today's working day logs
     // More complex: pass date filters. We'll return the last 500 for the blueprint.
     return this.locLogRepo.find({
       where: { salesman_id: salesmanId },
       order: { captured_at: 'DESC' },
       take: 500
     });
  }
}
