import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('server_metrics')
@Index('idx_server_metrics_timestamp', ['timestamp'])
export class ServerMetrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', default: 0 })
  cpuUsage: number;

  @Column({ type: 'float', default: 0 })
  memoryUsage: number;

  @Column({ type: 'bigint', default: 0 })
  heapUsed: number;

  @Column({ type: 'bigint', default: 0 })
  heapTotal: number;

  @Column({ type: 'bigint', default: 0 })
  rssMemory: number;

  @Column({ type: 'int', default: 0 })
  activeRequests: number;

  @Column({ type: 'int', default: 0 })
  requestCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  @Column({ type: 'float', default: 0 })
  avgResponseTime: number;

  @Column({ type: 'bigint', default: 0 })
  uptime: number;

  @Column({ type: 'int', default: 0 })
  connectedClients: number;

  @CreateDateColumn()
  timestamp: Date;
}
