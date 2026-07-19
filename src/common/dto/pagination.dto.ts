import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page',
    default: 10,
  })
  limit?: number;

  @ApiPropertyOptional({ example: 'beverage', description: 'Search term' })
  search?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Field to sort by',
  })
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
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
