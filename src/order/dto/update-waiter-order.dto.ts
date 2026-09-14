import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { WaiterOrderItemDto } from './create-waiter-order.dto';

export class UpdateWaiterOrderDto {
  @ApiProperty({
    example: [{ productId: 1, quantity: 2 }],
    description: 'Final array of products with quantities',
    type: [WaiterOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WaiterOrderItemDto)
  products: WaiterOrderItemDto[];
}
