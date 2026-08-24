import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { HealthHistoryQueryDto } from './dto/health-query.dto';

@ApiTags('Health')
@ApiBearerAuth()
@Controller('health')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('current')
  @RequirePermissions('health:read')
  @ApiOperation({ summary: 'Get current server health status' })
  getCurrentHealth() {
    return this.healthService.getCurrentHealth();
  }

  @Get('history')
  @RequirePermissions('health:read')
  @ApiOperation({ summary: 'Get server health history for line charts' })
  getHealthHistory(@Query() query: HealthHistoryQueryDto) {
    return this.healthService.getHealthHistory(
      query.startDate,
      query.endDate,
      query.interval,
      query.limit,
    );
  }
}
