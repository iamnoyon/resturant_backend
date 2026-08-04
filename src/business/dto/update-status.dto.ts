import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

export class UpdateStatusDto {
  @ApiPropertyOptional({
    example: 'active',
    description: 'Subscription status',
    enum: ['active', 'inactive'],
  })
  subscription?: SubscriptionStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Package ID to activate subscription and calculate dates',
  })
  packageId?: number;
}
