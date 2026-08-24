import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HealthHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for history range (ISO string or YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for history range (ISO string or YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Aggregation interval in minutes',
    example: 5,
    default: 5,
    minimum: 1,
    maximum: 1440,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  interval?: number = 5;

  @ApiPropertyOptional({
    description: 'Maximum number of data points to return',
    example: 100,
    default: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}
