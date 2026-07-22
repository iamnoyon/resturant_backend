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
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
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

  @Post()
  @RequirePermissions('business:create')
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.create(createBusinessDto, currentUser);
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

  @Patch(':id')
  @RequirePermissions('business:update')
  update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.update(+id, updateBusinessDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('business:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.remove(+id, currentUser);
  }
}
