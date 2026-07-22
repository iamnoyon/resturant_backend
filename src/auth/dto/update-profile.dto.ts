import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ahsan Habib', description: 'Full name' })
  name?: string;

  @ApiPropertyOptional({
    example: 'user@restaurant.com',
    description: 'Email address',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
  })
  profileImageUrl?: string;
}
