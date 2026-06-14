import { Controller, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FulfillmentService } from './fulfillment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { PartialDispatchDto } from './dto/partial-dispatch.dto';
import { PartialDeliverDto } from './dto/partial-deliver.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Patch(':id/confirm')
  @Roles('DISTRIBUTOR_ADMIN')
  confirm(@Request() req, @Param('id') id: string, @Body() dto: FulfillOrderDto) {
    return this.fulfillmentService.confirmOrder(req.user.userId, id, dto);
  }

  @Patch(':id/processing')
  @Roles('DISTRIBUTOR_ADMIN')
  processing(@Request() req, @Param('id') id: string, @Body() dto: FulfillOrderDto) {
    return this.fulfillmentService.processingOrder(req.user.userId, id, dto);
  }

  @Patch(':id/packed')
  @Roles('DISTRIBUTOR_ADMIN')
  packed(@Request() req, @Param('id') id: string, @Body() dto: FulfillOrderDto) {
    return this.fulfillmentService.packedOrder(req.user.userId, id, dto);
  }

  @Patch(':id/dispatch')
  @Roles('DISTRIBUTOR_ADMIN')
  dispatch(@Request() req, @Param('id') id: string, @Body() dto: FulfillOrderDto) {
    return this.fulfillmentService.dispatchOrder(req.user.userId, id, dto);
  }

  @Patch(':id/deliver')
  @Roles('DISTRIBUTOR_ADMIN')
  deliver(@Request() req, @Param('id') id: string, @Body() dto: FulfillOrderDto) {
    return this.fulfillmentService.deliverOrder(req.user.userId, id, dto);
  }

  @Patch(':id/partial-dispatch')
  @Roles('DISTRIBUTOR_ADMIN')
  partialDispatch(@Request() req, @Param('id') id: string, @Body() dto: PartialDispatchDto) {
    return this.fulfillmentService.partialDispatchOrder(req.user.userId, id, dto);
  }

  @Patch(':id/partial-deliver')
  @Roles('DISTRIBUTOR_ADMIN')
  partialDeliver(@Request() req, @Param('id') id: string, @Body() dto: PartialDeliverDto) {
    return this.fulfillmentService.partialDeliverOrder(req.user.userId, id, dto);
  }
}
