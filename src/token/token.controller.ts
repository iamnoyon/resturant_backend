import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { QueryTokenDto } from './dto/query-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tokens')
@ApiBearerAuth()
@Controller('tokens')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @RequirePermissions('token:read')
  findAll(@Query() query: QueryTokenDto, @CurrentUser() currentUser: any) {
    return this.tokenService.findAll(query, currentUser);
  }

  @Get('order/:orderId')
  @RequirePermissions('token:read')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.tokenService.findByOrder(+orderId, currentUser);
  }
}
