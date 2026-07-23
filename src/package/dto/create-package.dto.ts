import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

export class CreatePackageDto {
  @ApiProperty({
    example: 'Basic Plan',
    description: 'Package name',
  })
  packageName: string;

  @ApiProperty({
    example: 1,
    description: 'Number of months',
  })
  numberOfMonth: number;

  @ApiProperty({
    example: 999.99,
    description: 'Package price',
  })
  price: number;

  @ApiPropertyOptional({
    example: 'Best for small restaurants',
    description: 'Short description',
  })
  shortNote?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Package status',
    enum: ['active', 'inactive'],
  })
  status?: SubscriptionStatus;
}
