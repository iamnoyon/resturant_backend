import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeQueryDto {
  @ApiProperty({
    description: 'Start date (ISO format YYYY-MM-DD)',
    example: '2026-07-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO format YYYY-MM-DD)',
    example: '2026-07-31',
  })
  @IsDateString()
  endDate: string;
}

export class RecentOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Number of recent orders to return',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
