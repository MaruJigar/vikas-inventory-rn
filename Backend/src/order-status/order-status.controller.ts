import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderStatusService } from './order-status.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ActiveOrderStatusDto } from './dto/active-order-status.dto';
import { OrderStatus } from './order-status.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@ApiTags('Order Statuses')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new order status' })
  @ApiResponse({ status: 201, description: 'Created', type: OrderStatus })
  async create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return await this.orderStatusService.create(createOrderStatusDto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all order statuses' })
  @ApiResponse({ status: 200, description: 'Success', type: [OrderStatus] })
  async findAll() {
    return await this.orderStatusService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get all active order statuses',
    description:
      'Accessible to all user roles. Returns active order statuses ordered by sequence ASC with id, name, sequence, can_cancel_order, is_cancel_status, and is_dispatch_status flags.',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [ActiveOrderStatusDto],
  })
  async findActiveStatuses() {
    return await this.orderStatusService.findActiveStatuses();
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single order status by id' })
  @ApiResponse({ status: 200, description: 'Success', type: OrderStatus })
  async findOne(@Param('id') id: string) {
    return await this.orderStatusService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update an order status' })
  @ApiResponse({ status: 200, description: 'Updated', type: OrderStatus })
  async update(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return await this.orderStatusService.update(id, updateOrderStatusDto);
  }

  @Get(':id/next')
  @ApiOperation({ summary: 'Get the next active order status based on sequence' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getNextStatus(@Param('id') id: string) {
    return await this.orderStatusService.getNextStatus(id);
  }
}
