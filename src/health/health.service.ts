import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as os from 'os';
import { ServerMetrics } from './entities/server-metrics.entity';

export interface HealthMetric {
  name: string;
  value: string | number;
}

export interface CurrentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
}

export interface HealthChartData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
  }[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  private activeRequests = 0;
  private responseTimes: number[] = [];

  constructor(
    @InjectRepository(ServerMetrics)
    private metricsRepository: Repository<ServerMetrics>,
  ) {}

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  addResponseTime(time: number) {
    this.totalResponseTime += time;
    this.responseTimes.push(time);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  incrementActiveRequests() {
    this.activeRequests++;
  }

  decrementActiveRequests() {
    this.activeRequests--;
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    return Math.round((1 - totalIdle / totalTick) * 100 * 100) / 100;
  }

  async collectMetrics(): Promise<ServerMetrics> {
    const memUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
          this.responseTimes.length
        : 0;

    const metrics = this.metricsRepository.create({
      cpuUsage,
      memoryUsage:
        Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100 * 100) / 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rssMemory: memUsage.rss,
      activeRequests: this.activeRequests,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: Math.floor(process.uptime()),
      connectedClients: this.activeRequests,
    });

    const saved = await this.metricsRepository.save(metrics);

    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
    this.responseTimes = [];

    return saved;
  }

  getCurrentHealth(): HealthMetric[] {
    const memUsage = process.memoryUsage();
    const cpuUsage = this.getCpuUsage();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (cpuUsage > 80 || memUsage.heapUsed / memUsage.heapTotal > 0.85) {
      status = 'unhealthy';
    } else if (cpuUsage > 60 || memUsage.heapUsed / memUsage.heapTotal > 0.7) {
      status = 'degraded';
    }

    return [
      { name: 'Health', value: status },
      { name: 'Uptime', value: this.formatUptime(Math.floor(process.uptime())) },
      { name: 'CPU Usage', value: cpuUsage },
      {
        name: 'Memory Usage',
        value:
          Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100 * 100) / 100,
      },
    ];
  }

  async getHealthHistory(
    startDate?: string,
    endDate?: string,
    _interval: number = 5,
    limit: number = 100,
  ): Promise<HealthChartData> {
    const qb = this.metricsRepository.createQueryBuilder('metrics');

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    qb.where('metrics.timestamp BETWEEN :start AND :end', { start, end });

    qb.orderBy('metrics.timestamp', 'ASC').take(limit);

    const metrics = await qb.getMany();

    if (metrics.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const labels = metrics.map((m) => {
      const date = new Date(m.timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    return {
      labels,
      datasets: [
        {
          name: 'CPU Usage (%)',
          data: metrics.map((m) => m.cpuUsage),
        },
        {
          name: 'Memory Usage (%)',
          data: metrics.map((m) => m.memoryUsage),
        },
        {
          name: 'Avg Response Time (ms)',
          data: metrics.map((m) => m.avgResponseTime),
        },
        {
          name: 'Request Count',
          data: metrics.map((m) => m.requestCount),
        },
        {
          name: 'Error Count',
          data: metrics.map((m) => m.errorCount),
        },
      ],
    };
  }

  async getMetricsRetentionHours(): Promise<number> {
    const count = await this.metricsRepository.count();
    return count;
  }

  async cleanupOldMetrics(daysToKeep: number = 7): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    await this.metricsRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoff', { cutoff })
      .execute();

    this.logger.log(`Cleaned up metrics older than ${daysToKeep} days`);
  }
}
