import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { UpdateTokenStatusDto } from './dto/update-token-status.dto';
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
  findAll(@CurrentUser() currentUser: any) {
    return this.tokenService.findAll(currentUser);
  }

  @Get('order/:orderId')
  @RequirePermissions('token:read')
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.tokenService.findByOrder(orderId, currentUser);
  }

  @Patch(':id/status')
  @RequirePermissions('token:update')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTokenStatusDto: UpdateTokenStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.tokenService.updateStatus(
      +id,
      updateTokenStatusDto.status,
      currentUser,
    );
  }
}
