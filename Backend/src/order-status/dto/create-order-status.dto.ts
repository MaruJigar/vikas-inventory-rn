import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateOrderStatusDto {
  @ApiProperty({ description: 'Name of the order status' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sequence number for ordering statuses (must be > 0)' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  sequence: number;

  @ApiProperty({ description: 'Whether an order can be cancelled in this status' })
  @IsBoolean()
  @IsNotEmpty()
  can_cancel_order: boolean;

  @ApiProperty({ description: 'Whether this status is active' })
  @IsBoolean()
  @IsNotEmpty()
  isactive: boolean;

  @ApiProperty({ description: 'Whether this is a cancellation status' })
  @IsBoolean()
  @IsNotEmpty()
  is_cancel_status: boolean;

  @ApiProperty({ description: 'Whether this is a dispatch status' })
  @IsBoolean()
  @IsNotEmpty()
  is_dispatch_status: boolean;
}
