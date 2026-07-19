import { ApiProperty } from '@nestjs/swagger';
import { BillStatus } from '../../common/enums/bill-status.enum';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Table ID reference' })
  tableId: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of product IDs',
    type: [Number],
  })
  productIds: number[];

  @ApiProperty({
    example: 500.0,
    description: 'Total bill amount before discount',
  })
  totalBill: number;

  @ApiProperty({ example: 50.0, description: 'Discount amount' })
  discount: number;

  @ApiProperty({ example: 450.0, description: 'Sub-total after discount' })
  subTotal: number;

  @ApiProperty({
    example: 'unpaid',
    description: 'Bill payment status',
    enum: ['unpaid', 'paid'],
  })
  billStatus: BillStatus;
}
