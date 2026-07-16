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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateOrderDto, CreateDistributorManufacturerOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { BackorderListQueryDto } from './dto/backorder-list-query.dto';
import { ResolveBackorderDto } from './dto/resolve-backorder.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Order } from './order.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  // ─── Create ─────────────────────────────────────────────────────────────
  // Architecture Decision: Only SALESMAN can create orders.
  // Orders require a salesman profile context (distributor_id, visit, shop).
  // SUPER_ADMIN does not have a salesman profile and cannot create orders.

  @Post()
  @Roles('SALESMAN')
  @ApiOperation({ summary: 'Create Order (SALESMAN only)' })
  @ApiBearerAuth('bearer')
  createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.userId, dto);
  }

  @Post('distributor-to-manufacturer')
  @Roles('DISTRIBUTOR_ADMIN')
  @ApiOperation({
    summary: 'Create Distributor Order (DISTRIBUTOR_ADMIN only)',
    description: 'Accepts a single payload of products and splits them into separate orders based on the manufacturer. Distributor self-products (manufacturer=null) are grouped into their own order. The provided bill discount is applied independently to each created order. Returns an array of created orders.',
  })
  @ApiBearerAuth('bearer')
  createDistributorManufacturerOrder(
    @Request() req,
    @Body() dto: CreateDistributorManufacturerOrderDto,
  ) {
    return this.orderService.createDistributorManufacturerOrder(req.user.userId, dto);
  }

  @Post('purchase-request/generate')
  @Roles('DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Generate Purchase Request (DISTRIBUTOR_ADMIN only)' })
  @ApiBearerAuth('bearer')
  generatePurchaseRequest(@Request() req) {
    return this.orderService.generatePurchaseRequest(req.user.userId);
  }

  // ─── List ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get Orders (paginated, filtered, searched)' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Order)
  getOrders(@Request() req, @Query() query: OrderListQueryDto) {
    return this.orderService.getOrders(req.user.userId, req.user.role, query);
  }

  // ─── Exports ─────────────────────────────────────────────────────────────

  @Get('export/csv')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({ summary: 'Export Orders as CSV' })
  @ApiBearerAuth('bearer')
  async exportCsv(
    @Request() req,
    @Query() query: OrderListQueryDto,
    @Res() res: Response,
  ) {
    const stream = await this.orderService.exportOrdersCsv(req.user.userId, req.user.role, query);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders_export.csv"',
    });
    stream.pipe(res);
  }

  @Get('export/xlsx')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({ summary: 'Export Orders as Excel (XLSX)' })
  @ApiBearerAuth('bearer')
  async exportXlsx(
    @Request() req,
    @Query() query: OrderListQueryDto,
    @Res() res: Response,
  ) {
    const stream = await this.orderService.exportOrdersXlsx(req.user.userId, req.user.role, query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="orders_export.xlsx"',
    });
    stream.pipe(res);
  }

  // ─── Backorders ──────────────────────────────────────────────────────────

  @Get('backorders')
  @ApiOperation({ summary: 'Get Backorders (paginated)' })
  @ApiBearerAuth('bearer')
  getBackorders(@Request() req, @Query() query: BackorderListQueryDto) {
    return this.orderService.getBackorders(req.user.userId, req.user.role, query);
  }

  @Get('backorders/:id')
  @ApiOperation({ summary: 'Get Backorder by ID' })
  @ApiBearerAuth('bearer')
  getBackorderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getBackorderById(req.user.userId, req.user.role, id);
  }

  @Patch('backorders/:id/resolve')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Resolve Backorder' })
  @ApiBearerAuth('bearer')
  resolveBackorder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ResolveBackorderDto,
  ) {
    return this.orderService.resolveBackorder(req.user.userId, req.user.role, id, dto);
  }

  // ─── Detail (with items) ─────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get Order By Id (includes line items)' })
  @ApiBearerAuth('bearer')
  getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user.userId, req.user.role, id);
  }

  // ─── Edit ────────────────────────────────────────────────────────────────
  // Architecture Decision: Only SALESMAN can edit orders.
  // Editing re-allocates inventory using the salesman's distributor context.

  @Patch(':id')
  @Roles('SALESMAN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({ summary: 'Edit Order (SALESMAN/DISTRIBUTOR_ADMIN/MANUFACTURER_ADMIN)' })
  @ApiBearerAuth('bearer')
  updateOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(req.user.userId, req.user.role, id, dto);
  }

  // ─── Cancel ──────────────────────────────────────────────────────────────

  @Patch(':id/cancel')
  @Roles('SUPER_ADMIN', 'SALESMAN', 'DISTRIBUTOR_ADMIN')
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

  // ─── Status Lifecycle ─────────────────────────────────────────────────────
  // Allowed transitions per role:
  //   SUPER_ADMIN       → any valid transition
  //   DISTRIBUTOR_ADMIN → any valid transition for own orders
  //   MANUFACTURER_ADMIN → any valid transition for ecosystem orders
  // SALESMAN uses cancel/edit — cannot drive status transitions.

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({
    summary: 'Update Order Status (lifecycle transition)',
    description:
      'CREATED → CONFIRMED → PROCESSING → PACKED → DISPATCHED → DELIVERED. ' +
      'CANCELLED is via the /cancel endpoint.',
  })
  @ApiBearerAuth('bearer')
  updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(
      req.user.userId,
      req.user.role,
      id,
      dto,
    );
  }

  // ─── Revisions (paginated) ────────────────────────────────────────────────

  @Get(':id/revisions')
  @ApiOperation({ summary: 'Get Order Revisions (paginated)' })
  @ApiBearerAuth('bearer')
  getRevisions(
    @Request() req,
    @Param('id') id: string,
    @Query() query: ListQueryDto,
  ) {
    return this.orderService.getOrderRevisions(
      req.user.userId,
      req.user.role,
      id,
      query,
    );
  }

  // ─── Status History (paginated) ──────────────────────────────────────────

  @Get(':id/status-history')
  @ApiOperation({ summary: 'Get Order Status History (paginated)' })
  @ApiBearerAuth('bearer')
  getStatusHistory(
    @Request() req,
    @Param('id') id: string,
    @Query() query: ListQueryDto,
  ) {
    return this.orderService.getOrderStatusHistory(
      req.user.userId,
      req.user.role,
      id,
      query,
    );
  }

  // ─── Fulfillment Logs (paginated) ────────────────────────────────────────

  @Get(':id/fulfillment-logs')
  @ApiOperation({ summary: 'Get Order Fulfillment Logs (paginated)' })
  @ApiBearerAuth('bearer')
  getFulfillmentLogs(
    @Request() req,
    @Param('id') id: string,
    @Query() query: ListQueryDto,
  ) {
    return this.orderService.getFulfillmentLogs(
      req.user.userId,
      req.user.role,
      id,
      query,
    );
  }
}
