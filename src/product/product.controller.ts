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
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.create(createProductDto, currentUser);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.productService.findAll(query, currentUser);
  }

  @Get('dropdown')
  dropdown(@CurrentUser() currentUser: any) {
    return this.productService.dropdown(currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.productService.findOne(+id, currentUser);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiBody({ schema: { properties: { stock: { type: 'number', example: 50 } } } })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { stock: number },
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.updateStock(id, body.stock, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.productService.update(+id, updateProductDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.productService.remove(+id, currentUser);
  }
}
