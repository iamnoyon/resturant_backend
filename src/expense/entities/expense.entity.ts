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

@Entity('expenses')
@Index('idx_expenses_business_created', ['businessId', 'createdAt'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expenseName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  expenseValue: number;

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
