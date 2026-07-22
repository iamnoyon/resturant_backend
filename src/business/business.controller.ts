import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { UpsertBusinessDto } from './dto/upsert-business.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('business')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Put()
  @RequirePermissions('business:update')
  upsert(
    @Body() upsertBusinessDto: UpsertBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.upsert(upsertBusinessDto, currentUser);
  }

  @Get('my')
  @RequirePermissions('business:read')
  getMyBusiness(@CurrentUser() currentUser: any) {
    return this.businessService.findByAdminId(currentUser.id);
  }

  @Get()
  @RequirePermissions('business:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.businessService.findAll(query, currentUser);
  }

  @Get(':id')
  @RequirePermissions('business:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.findOne(+id, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('business:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.remove(+id, currentUser);
  }
}
