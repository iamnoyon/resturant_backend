import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user:create')
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @RequirePermissions('user:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.usersService.findAll(query, currentUser);
  }

  @Get('waiters')
  @RequirePermissions('user:read')
  getWaiters(@CurrentUser() currentUser: any) {
    return this.usersService.getWaiters(currentUser);
  }

  @Get(':id')
  @RequirePermissions('user:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('user:update')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.update(+id, updateUserDto, currentUser);
  }

  @Patch(':id/status')
  @RequirePermissions('user:update')
  updateStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.usersService.updateStatus(+id, updateUserStatusDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('user:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.usersService.remove(+id, currentUser);
  }
}
