import {
  Controller, Post, Get, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from './dto/update-order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('SALESMAN')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, dto);
  }

  @Get()
  getOrders(@Request() req) {
    return this.orderService.getOrders(req.user.userId, req.user.role);
  }

  @Get(':id')
  getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user.userId, req.user.role, id);
  }

  @Patch(':id')
  @Roles('SALESMAN')
  updateOrder(@Request() req, @Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.updateOrder(req.user.userId, id, dto);
  }

  @Patch(':id/cancel')
  @Roles('SALESMAN', 'DISTRIBUTOR_ADMIN')
  cancelOrder(@Request() req, @Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.orderService.cancelOrder(req.user.userId, req.user.role, id, dto);
  }

  @Get(':id/revisions')
  getRevisions(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderRevisions(req.user.userId, req.user.role, id);
  }


}
