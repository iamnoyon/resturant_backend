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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { BillStatus } from '../common/enums/bill-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RequirePermissions('order:create')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.create(createOrderDto, currentUser);
  }

  @Get()
  @RequirePermissions('order:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.orderService.findAll(query, currentUser);
  }

  @Get(':id')
  @RequirePermissions('order:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.orderService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('order:update')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.update(+id, updateOrderDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('order:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.orderService.remove(+id, currentUser);
  }

  @Patch(':id/bill-status')
  @RequirePermissions('order:update-bill-status')
  updateBillStatus(
    @Param('id') id: string,
    @Body('billStatus') billStatus: BillStatus,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.updateBillStatus(+id, billStatus, currentUser);
  }
}
