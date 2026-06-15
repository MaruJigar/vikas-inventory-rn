import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from './dto/update-order.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Order } from './order.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('SALESMAN')
  @ApiOperation({ summary: 'Create Order' })
  @ApiBearerAuth('bearer')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Orders' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Order)
  getOrders(@Request() req, @Query() query: ListQueryDto) {
    return this.orderService.getOrders(req.user.userId, req.user.role, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Order By Id' })
  @ApiBearerAuth('bearer')
  getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user.userId, req.user.role, id);
  }

  @Patch(':id')
  @Roles('SALESMAN')
  @ApiOperation({ summary: 'Update Order' })
  @ApiBearerAuth('bearer')
  updateOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(req.user.userId, id, dto);
  }

  @Patch(':id/cancel')
  @Roles('SALESMAN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Cancel Order' })
  @ApiBearerAuth('bearer')
  cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.orderService.cancelOrder(
      req.user.userId,
      req.user.role,
      id,
      dto,
    );
  }

  @Get(':id/revisions')
  @ApiOperation({ summary: 'Get Revisions' })
  @ApiBearerAuth('bearer')
  getRevisions(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderRevisions(
      req.user.userId,
      req.user.role,
      id,
    );
  }
}
