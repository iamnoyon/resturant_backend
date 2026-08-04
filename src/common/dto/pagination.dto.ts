import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'beverage', description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by category ID' })
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
