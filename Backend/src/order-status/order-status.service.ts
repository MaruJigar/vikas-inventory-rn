import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { OrderStatus } from './order-status.entity';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
  ) {}

  async create(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const existingStatus = await this.orderStatusRepository.findOne({
      where: { name: createOrderStatusDto.name },
    });

    if (existingStatus) {
      throw new ConflictException(`Status with name '${createOrderStatusDto.name}' already exists`);
    }

    const orderStatus = this.orderStatusRepository.create(createOrderStatusDto);
    return await this.orderStatusRepository.save(orderStatus);
  }

  async findAll(): Promise<OrderStatus[]> {
    return await this.orderStatusRepository.find({
      order: {
        sequence: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Order status with ID '${id}' not found`);
    }
    return status;
  }

  async update(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const status = await this.findOne(id);

    if (updateOrderStatusDto.name && updateOrderStatusDto.name !== status.name) {
      const existingStatus = await this.orderStatusRepository.findOne({
        where: { name: updateOrderStatusDto.name },
      });
      if (existingStatus) {
        throw new ConflictException(`Status with name '${updateOrderStatusDto.name}' already exists`);
      }
    }

    Object.assign(status, updateOrderStatusDto);
    return await this.orderStatusRepository.save(status);
  }

  async getNextStatus(id: string): Promise<{ id: string; name: string; can_cancel_order: boolean }> {
    const currentStatus = await this.findOne(id);

    const nextStatus = await this.orderStatusRepository.findOne({
      where: {
        sequence: MoreThan(currentStatus.sequence),
        isactive: true,
      },
      order: {
        sequence: 'ASC',
      },
    });

    if (!nextStatus) {
      throw new NotFoundException('No active next status found');
    }

    return {
      id: nextStatus.id,
      name: nextStatus.name,
      can_cancel_order: nextStatus.can_cancel_order,
    };
  }

  async getInitialStatus(): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({
      where: { isactive: true, is_cancel_status: false },
      order: { sequence: 'ASC' },
    });
    if (!status) {
      throw new NotFoundException('No initial status found');
    }
    return status;
  }

  async getCancelStatus(): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({
      where: { isactive: true, is_cancel_status: true },
    });
    if (!status) {
      throw new NotFoundException('No cancel status found');
    }
    return status;
  }

  async getFinalDeliveredStatus(): Promise<OrderStatus> {
    const status = await this.orderStatusRepository.findOne({
      where: { isactive: true, is_cancel_status: false },
      order: { sequence: 'DESC' },
    });
    if (!status) {
      throw new NotFoundException('No final delivered status found');
    }
    return status;
  }

  async getPreDispatchStatuses(): Promise<string[]> {
    const dispatchStatus = await this.orderStatusRepository.findOne({
      where: { isactive: true, is_dispatch_status: true },
    });

    if (!dispatchStatus) {
      // If no dispatch status is defined, treat all active non-cancel statuses as pre-dispatch, 
      // or none. Assuming all statuses before a dispatch status are pre-dispatch. 
      // We will throw error to ensure proper setup.
      throw new NotFoundException('No dispatch status found in the system');
    }

    const preDispatchStatuses = await this.orderStatusRepository.find({
      where: {
        isactive: true,
      },
      order: { sequence: 'ASC' },
    });

    return preDispatchStatuses
      .filter((status) => status.sequence < dispatchStatus.sequence)
      .map((status) => status.id);
  }
}
