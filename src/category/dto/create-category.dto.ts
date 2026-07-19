import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Beverages', description: 'Category name' })
  categoryName: string;

  @ApiPropertyOptional({
    example: 'Hot and cold drinks',
    description: 'Short note about category',
  })
  shortNote?: string;
}
