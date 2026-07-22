import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('user:read')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('users/:id')
  @RequirePermissions('user:read')
  getUserPermissions(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.permissionsService.getUserPermissions(+id, currentUser);
  }

  @Put('users/:id')
  @RequirePermissions('user:update')
  updateUserPermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.permissionsService.updateUserPermissions(
      +id,
      dto.permissions,
      currentUser,
    );
  }
}
