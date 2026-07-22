import { IsArray, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPermissionsDto {
  @ApiProperty({
    description: 'List of permission names to assign to the user',
    example: ['category:read', 'product:read', 'order:create'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissions: string[];
}
