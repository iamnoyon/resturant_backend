import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  DateRangeQueryDto,
  RecentOrdersQueryDto,
} from './dto/dashboard-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions('dashboard:read')
  @ApiOperation({
    summary: 'Get dashboard summary statistics for a date range',
  })
  getSummary(
    @Query() query: DateRangeQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.dashboardService.getSummary(
      currentUser,
      query.startDate,
      query.endDate,
    );
  }

  @Get('charts')
  @RequirePermissions('dashboard:read')
  @ApiOperation({
    summary: 'Get daily revenue, orders, and expenses for charts',
  })
  getCharts(
    @Query() query: DateRangeQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.dashboardService.getCharts(
      currentUser,
      query.startDate,
      query.endDate,
    );
  }

  @Get('recent-orders')
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Get most recent orders' })
  getRecentOrders(
    @Query() query: RecentOrdersQueryDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.dashboardService.getRecentOrders(currentUser, query.limit);
  }

  @Get('admin/overview')
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Superadmin platform-wide overview' })
  getAdminOverview(@CurrentUser() currentUser: any) {
    return this.dashboardService.getAdminOverview(currentUser);
  }

  @Get('admin/charts')
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Superadmin monthly revenue and business creation for a year' })
  getAdminCharts(
    @Query('year') year: string,
    @CurrentUser() currentUser: any,
  ) {
    const parsedYear = +year;
    const finalYear = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
    return this.dashboardService.getAdminCharts(currentUser, finalYear);
  }
}
