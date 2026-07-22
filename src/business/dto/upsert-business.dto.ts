import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
