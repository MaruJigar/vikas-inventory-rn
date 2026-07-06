import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderStatusService } from './order-status.service';
import { CreateOrderStatusDto } from './dto/create-order-status.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './order-status.entity';

@ApiTags('Order Statuses')
@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order status' })
  @ApiResponse({ status: 201, description: 'Created', type: OrderStatus })
  async create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return await this.orderStatusService.create(createOrderStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order statuses' })
  @ApiResponse({ status: 200, description: 'Success', type: [OrderStatus] })
  async findAll() {
    return await this.orderStatusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order status by id' })
  @ApiResponse({ status: 200, description: 'Success', type: OrderStatus })
  async findOne(@Param('id') id: string) {
    return await this.orderStatusService.findOne(id);
  }

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
