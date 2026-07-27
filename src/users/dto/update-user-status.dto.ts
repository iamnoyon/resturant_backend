import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: 'active',
    description: 'User account status',
    enum: ['active', 'inactive', 'suspended'],
  })
  status: string;
}
