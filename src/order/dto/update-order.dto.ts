import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BillStatus } from '../../common/enums/bill-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 2, description: 'Table ID reference' })
  tableId?: number;

  @ApiPropertyOptional({
    example: [1, 4],
    description: 'Array of product IDs',
    type: [Number],
  })
  productIds?: number[];

  @ApiPropertyOptional({ example: 600.0, description: 'Total bill amount' })
  totalBill?: number;

  @ApiPropertyOptional({ example: 30.0, description: 'Discount amount' })
  discount?: number;

  @ApiPropertyOptional({
    example: 570.0,
    description: 'Sub-total after discount',
  })
  subTotal?: number;

  @ApiPropertyOptional({
    example: 'paid',
    description: 'Bill payment status',
    enum: ['unpaid', 'paid'],
  })
  @IsOptional()
  @IsEnum(BillStatus)
  billStatus?: BillStatus;
}
