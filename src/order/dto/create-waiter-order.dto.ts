import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class WaiterOrderItemDto {
  @ApiProperty({ example: 1, description: 'Product ID reference' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateWaiterOrderDto {
  @ApiProperty({ example: 1, description: 'Table ID reference' })
  @IsNumber()
  tableId: number;

  @ApiProperty({
    example: [{ productId: 1, quantity: 2 }],
    description: 'Array of products with quantities',
    type: [WaiterOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WaiterOrderItemDto)
  products: WaiterOrderItemDto[];
}
