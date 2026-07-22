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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @RequirePermissions('expense:create')
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.expenseService.create(createExpenseDto, currentUser);
  }

  @Get()
  @RequirePermissions('expense:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.expenseService.findAll(query, currentUser);
  }

  @Get(':id')
  @RequirePermissions('expense:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.expenseService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('expense:update')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.expenseService.update(+id, updateExpenseDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('expense:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.expenseService.remove(+id, currentUser);
  }
}
