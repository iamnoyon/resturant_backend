import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Cappuccino', description: 'Product name' })
  productName: string;

  @ApiProperty({ example: 1, description: 'Category ID reference' })
  categoryId: number;

  @ApiPropertyOptional({
    example: 'Italian-style coffee with steamed milk foam',
    description: 'Product description',
  })
  description?: string;

  @ApiProperty({ example: 80.0, description: 'Cost price of the product' })
  costPrice: number;

  @ApiProperty({ example: 150.0, description: 'Selling price of the product' })
  soldPrice: number;

  @ApiPropertyOptional({ example: 50, description: 'Stock quantity', default: 0 })
  stock?: number;
}
