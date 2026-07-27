import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BillStatus } from '../../common/enums/bill-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 2, description: 'Table ID reference' })
  @IsOptional()
  @IsNumber()
  tableId?: number;

  @ApiPropertyOptional({
    example: [{ productId: 1, quantity: 2 }],
    description: 'Array of products with quantities',
  })
  @IsOptional()
  @IsArray()
  products?: { productId: number; quantity: number }[];

  @ApiPropertyOptional({ example: 600.0, description: 'Total bill amount' })
  @IsOptional()
  @IsNumber()
  totalBill?: number;

  @ApiPropertyOptional({ example: 30.0, description: 'Discount amount' })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({
    example: 570.0,
    description: 'Sub-total after discount',
  })
  @IsOptional()
  @IsNumber()
  subTotal?: number;

  @ApiPropertyOptional({
    example: 'paid',
    description: 'Bill payment status',
    enum: ['unpaid', 'paid'],
  })
  @IsOptional()
  @IsEnum(BillStatus)
  billStatus?: BillStatus;

  @ApiPropertyOptional({ example: 3, description: 'Waiter ID reference' })
  @IsOptional()
  @IsNumber()
  waiterId?: number;
}
