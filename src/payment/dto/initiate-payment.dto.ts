import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({
    example: 1,
    description: 'Package ID to purchase',
  })
  packageId: number;
}
