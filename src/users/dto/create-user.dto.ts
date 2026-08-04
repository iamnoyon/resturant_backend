import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ahsan Habib', description: 'Full name of the user' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'cashier@restaurant.com',
    description: 'Unique email address',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '01712345678', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Cashier@123',
    description: 'Login password (min 6 chars). Auto-generated if not provided.',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 'cashier',
    description: 'User role',
    enum: ['admin', 'cashier', 'waiter'],
  })
  @IsString()
  @IsIn(['admin', 'cashier', 'waiter'])
  role: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Business ID (auto-set by system)',
  })
  @IsOptional()
  businessId?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
