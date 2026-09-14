import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TokenStatus } from '../../common/enums/token-status.enum';

export class UpdateTokenStatusDto {
  @ApiProperty({
    example: TokenStatus.READY,
    description: 'New token status',
    enum: TokenStatus,
  })
  @IsEnum(TokenStatus)
  status: TokenStatus;
}
