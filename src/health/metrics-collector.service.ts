import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HealthService } from './health.service';

@Injectable()
export class MetricsCollector implements OnModuleInit {
  private readonly logger = new Logger(MetricsCollector.name);

  constructor(private readonly healthService: HealthService) {}

  onModuleInit() {
    this.logger.log(
      'MetricsCollector initialized - collecting metrics every 5 minutes',
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleMetricsCollection() {
    try {
      await this.healthService.collectMetrics();
      this.logger.debug('Metrics collected successfully');
    } catch (error) {
      this.logger.error('Failed to collect metrics', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleMetricsCleanup() {
    try {
      await this.healthService.cleanupOldMetrics(7);
      this.logger.log('Old metrics cleaned up');
    } catch (error) {
      this.logger.error('Failed to cleanup old metrics', error);
    }
  }
}
