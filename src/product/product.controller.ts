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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @RequirePermissions('product:create')
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.create(createProductDto, currentUser);
  }

  @Get()
  @RequirePermissions('product:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.productService.findAll(query, currentUser);
  }

  @Get('dropdown')
  @RequirePermissions('product:read')
  dropdown(@CurrentUser() currentUser: any) {
    return this.productService.dropdown(currentUser);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get all active products of a category' })
  @RequirePermissions('product:read')
  findByCategory(
    @Query('categoryId') categoryId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.findByCategory(+categoryId, currentUser);
  }

  @Get(':id')
  @RequirePermissions('product:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.productService.findOne(+id, currentUser);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiBody({
    schema: { properties: { stock: { type: 'number', example: 50 } } },
  })
  @RequirePermissions('product:update-stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stock: number },
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.updateStock(id, body.stock, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('product:update')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.update(+id, updateProductDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('product:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.productService.remove(+id, currentUser);
  }
}
