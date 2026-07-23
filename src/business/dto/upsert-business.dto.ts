import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

export class UpsertBusinessDto {
  @ApiPropertyOptional({
    example: 'Spice Garden Restaurant',
    description: 'Business/restaurant name',
  })
  businessName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Business logo URL',
  })
  businessLogo?: string;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'Division name' })
  division?: string;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'District name' })
  district?: string;

  @ApiPropertyOptional({
    example: 'Gulshan',
    description: 'Thana/upazila name',
  })
  thana?: string;

  @ApiPropertyOptional({
    example: 'Road 12, House 5',
    description: 'Area/address detail',
  })
  area?: string;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Subscription status',
    enum: ['active', 'inactive'],
  })
  subscription?: SubscriptionStatus;

  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Subscription start date',
  })
  subStartDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Subscription end date',
  })
  subEndDate?: string;
}
