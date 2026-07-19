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
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.create(createBusinessDto, currentUser);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.businessService.findAll(query, currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.businessService.update(+id, updateBusinessDto, currentUser);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.businessService.remove(+id, currentUser);
  }
}
