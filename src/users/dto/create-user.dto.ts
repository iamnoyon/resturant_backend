import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ahsan Habib', description: 'Full name of the user' })
  name: string;

  @ApiProperty({
    example: 'cashier@restaurant.com',
    description: 'Unique email address',
  })
  email: string;

  @ApiPropertyOptional({ example: '01712345678', description: 'Phone number' })
  phone?: string;

  @ApiProperty({
    example: 'Cashier@123',
    description: 'Login password (min 6 chars)',
  })
  password: string;

  @ApiProperty({
    example: 'cashier',
    description: 'User role',
    enum: ['admin', 'cashier'],
  })
  role: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Business ID (auto-set by system)',
  })
  businessId?: number;
}
