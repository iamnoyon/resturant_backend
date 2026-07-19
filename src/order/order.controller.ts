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
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { BillStatus } from '../common/enums/bill-status.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.create(createOrderDto, currentUser);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.orderService.findAll(query, currentUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.orderService.findOne(+id, currentUser);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.update(+id, updateOrderDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.orderService.remove(+id, currentUser);
  }

  @Patch(':id/bill-status')
  updateBillStatus(
    @Param('id') id: string,
    @Body('billStatus') billStatus: BillStatus,
    @CurrentUser() currentUser: any,
  ) {
    return this.orderService.updateBillStatus(+id, billStatus, currentUser);
  }
}
