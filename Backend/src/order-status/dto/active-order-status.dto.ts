import { ApiProperty } from '@nestjs/swagger';

export class ActiveOrderStatusDto {
  @ApiProperty({ description: 'Unique identifier of the order status' })
  id: string;

  @ApiProperty({ description: 'Name of the order status' })
  name: string;

  @ApiProperty({ description: 'Sequence number for ordering statuses (ascending)' })
  sequence: number;

  @ApiProperty({ description: 'Whether an order can be cancelled in this status' })
  can_cancel_order: boolean;

  @ApiProperty({ description: 'Whether this is a cancellation status' })
  is_cancel_status: boolean;

  @ApiProperty({ description: 'Whether this is a dispatch status' })
  is_dispatch_status: boolean;
}
