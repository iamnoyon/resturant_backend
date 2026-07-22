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
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@ApiTags('Tables')
@ApiBearerAuth()
@Controller('tables')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @RequirePermissions('table:create')
  create(
    @Body() createTableDto: CreateTableDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.tableService.create(createTableDto, currentUser);
  }

  @Get()
  @RequirePermissions('table:read')
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() currentUser: any) {
    return this.tableService.findAll(query, currentUser);
  }

  @Get('dropdown')
  @RequirePermissions('table:read')
  dropdown(@CurrentUser() currentUser: any) {
    return this.tableService.dropdown(currentUser);
  }

  @Get(':id')
  @RequirePermissions('table:read')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.tableService.findOne(+id, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('table:update')
  update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.tableService.update(+id, updateTableDto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('table:delete')
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    return this.tableService.remove(+id, currentUser);
  }
}
