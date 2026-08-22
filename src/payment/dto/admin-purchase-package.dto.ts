import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AdminPurchasePackageDto {
  @ApiProperty({
    example: 1,
    description: 'Package ID to purchase',
  })
  @IsInt()
  @IsPositive()
  packageId: number;

  @ApiProperty({
    example: 7,
    description: 'Target user (business owner) ID',
  })
  @IsInt()
  @IsPositive()
  adminId: number;
}