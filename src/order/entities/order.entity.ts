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
import { BillStatus } from '../../common/enums/bill-status.enum';
import { Business } from '../../business/entities/business.entity';
import { Table } from '../../table/entities/table.entity';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
@Index('idx_orders_business_created', ['businessId', 'createdAt'])
@Index('idx_orders_business_status', ['businessId', 'billStatus'])
@Index('idx_orders_business_status_created', [
  'businessId',
  'billStatus',
  'createdAt',
])
@Index('idx_orders_table', ['tableId'])
@Index('idx_orders_orderId', ['orderId'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  tableId: number;

  @ManyToOne(() => Table, { nullable: true })
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Column({ type: 'json', nullable: true })
  products: { productId: number; quantity: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalBill: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  profit: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.UNPAID })
  billStatus: BillStatus;

  @Column({ nullable: true })
  businessId: number;

  @ManyToOne(() => Business, { nullable: true })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column({ nullable: true })
  waiterId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'waiterId' })
  waiter: User;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
