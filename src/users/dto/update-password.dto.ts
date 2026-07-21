import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldPass@123', description: 'Current password' })
  oldPassword: string;

  @ApiProperty({ example: 'NewPass@123', description: 'New password (min 6 chars)' })
  newPassword: string;
}
