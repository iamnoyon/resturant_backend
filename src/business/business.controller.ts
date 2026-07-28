import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { UpsertBusinessDto } from './dto/upsert-business.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

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

  @Get('/list')
  findBusinessList(
    @Query() query: PaginationQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.findBusinessList(query, currentUser);
  }

  @Get()
  @RequirePermissions('business:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.businessService.findAll(query, currentUser);
  }

  @Get('/list/:id')
  findByID(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.findByID(+id, currentUser);
  }

  @Patch('/list/:id')
  updateByID(
    @Param('id') id: string,
    @Body() status: UpdateStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.updateById(+id, status, currentUser);
  }

  @Get(':id')
  @RequirePermissions('business:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.findOne(+id, currentUser);
  }
}
