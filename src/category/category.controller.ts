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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @RequirePermissions('category:create')
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.categoryService.create(createCategoryDto, currentUser);
  }

  @Get()
  @RequirePermissions('category:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.categoryService.findAll(query, currentUser);
  }

  @Get('dropdown')
  @RequirePermissions('category:read')
  dropdown(@CurrentUser() currentUser: any) {
    return this.categoryService.dropdown(currentUser);
  }

  @Get(':id')
  @RequirePermissions('category:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.categoryService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('category:update')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.categoryService.update(+id, updateCategoryDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('category:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.categoryService.remove(+id, currentUser);
  }
}
