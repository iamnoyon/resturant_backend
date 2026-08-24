import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { MetricsCollector } from './metrics-collector.service';
import { ServerMetrics } from './entities/server-metrics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerMetrics]),
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController],
  providers: [HealthService, MetricsCollector],
  exports: [HealthService],
})
export class HealthModule {}
