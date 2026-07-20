import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BillStatus } from '../../common/enums/bill-status.enum';
import { Business } from '../../business/entities/business.entity';
import { Table } from '../../table/entities/table.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderId: string;

  @Column()
  tableId: number;

  @ManyToOne(() => Table)
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

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.UNPAID })
  billStatus: BillStatus;

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
