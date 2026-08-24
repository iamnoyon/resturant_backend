import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Business } from '../../business/entities/business.entity';

@Entity('tables')
@Index('idx_tables_business', ['businessId'])
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableName: string;

  @Column()
  totalSeat: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  businessId: number;

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
