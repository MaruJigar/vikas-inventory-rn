import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Salesman } from './salesman.entity';
import { User } from '../user/user.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SalesmanService {
  constructor(
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Distributor) private distributorRepo: Repository<Distributor>,
    @InjectRepository(ApprovalRequest) private approvalRepo: Repository<ApprovalRequest>,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterSalesmanDto) {
    const existingUser = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existingUser) {
      throw new BadRequestException('User with this phone number already exists');
    }

    const distributor = await this.distributorRepo.findOne({ where: { id: dto.distributor_id } });
    if (!distributor) {
      throw new BadRequestException('Invalid distributor ID');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const password_hash = await bcrypt.hash(dto.password, 10);
      
      const user = queryRunner.manager.create(User, {
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        password_hash,
        role: 'SALESMAN',
        approval_status: 'PENDING_APPROVAL',
        is_active: true
      });
      const savedUser = await queryRunner.manager.save(user);

      const salesman = queryRunner.manager.create(Salesman, {
        user_id: savedUser.id,
        distributor_id: distributor.id,
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        approval_status: 'PENDING_APPROVAL',
        is_active: false
      });
      const savedSalesman = await queryRunner.manager.save(salesman);

      const approval = queryRunner.manager.create(ApprovalRequest, {
        request_type: 'SALESMAN_APPROVAL',
        requester_user_id: savedUser.id,
        distributor_id: distributor.id,
        salesman_id: savedSalesman.id,
        status: 'PENDING_APPROVAL'
      });
      await queryRunner.manager.save(approval);

      await queryRunner.commitTransaction();

      const { password_hash: _, ...userWithoutPassword } = savedUser;
      return { user: userWithoutPassword, salesman: savedSalesman };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getSalesmen(userRole: string, userId: string) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'MANUFACTURER_ADMIN') {
      return this.salesmanRepo.find();
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const distributor = await this.distributorRepo.findOne({ where: { user_id: userId } });
      if (!distributor) return [];
      return this.salesmanRepo.find({ where: { distributor_id: distributor.id } });
    }
    throw new ForbiddenException('Unauthorized to view salesmen');
  }

  async getSalesmanById(id: string, userRole: string, userId: string) {
    const salesman = await this.salesmanRepo.findOne({ where: { id } });
    if (!salesman) throw new NotFoundException('Salesman not found');

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const distributor = await this.distributorRepo.findOne({ where: { user_id: userId } });
      if (!distributor || distributor.id !== salesman.distributor_id) {
        throw new ForbiddenException('Unauthorized to view this salesman');
      }
    } else if (userRole === 'SALESMAN') {
      if (salesman.user_id !== userId) {
        throw new ForbiddenException('Unauthorized to view this salesman');
      }
    }
    
    return salesman;
  }

  async updateSalesman(id: string, dto: UpdateSalesmanDto, userRole: string, userId: string) {
    const salesman = await this.getSalesmanById(id, userRole, userId);
    
    if (userRole === 'SALESMAN' && salesman.user_id !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    Object.assign(salesman, dto);
    await this.salesmanRepo.save(salesman);

    if (dto.full_name || dto.phone || dto.email) {
      const user = await this.userRepo.findOne({ where: { id: salesman.user_id } });
      if (user) {
        if (dto.full_name) user.full_name = dto.full_name;
        if (dto.phone) user.phone = dto.phone;
        if (dto.email) user.email = dto.email;
        await this.userRepo.save(user);
      }
    }

    return salesman;
  }
}
