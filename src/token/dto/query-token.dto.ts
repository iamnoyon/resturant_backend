import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TokenStatus } from '../../common/enums/token-status.enum';

export class QueryTokenDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 57, description: 'Filter by order ID' })
  @IsOptional()
  orderId?: number;

  @ApiPropertyOptional({
    example: 'cooking',
    description: 'Filter by token status',
    enum: TokenStatus,
  })
  @IsOptional()
  @IsEnum(TokenStatus)
  status?: TokenStatus;
}
