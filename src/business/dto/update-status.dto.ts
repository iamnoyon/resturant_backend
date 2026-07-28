import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    example: 'active',
    description: 'Subscription status',
    enum: ['active', 'inactive'],
  })
  subscription: SubscriptionStatus;
}
