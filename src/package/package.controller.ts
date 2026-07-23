import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Packages')
@ApiBearerAuth()
@Controller('packages')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @RequirePermissions('package:create')
  create(@Body() dto: CreatePackageDto) {
    return this.packageService.create(dto);
  }

  @Get()
  @RequirePermissions('package:read')
  findAll() {
    return this.packageService.findAll();
  }

  @Get(':id')
  @RequirePermissions('package:read')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('package:update')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packageService.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions('package:delete')
  remove(@Param('id') id: string) {
    return this.packageService.remove(+id);
  }
}
