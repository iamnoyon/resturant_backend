import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  CANCEL = 'cancel',
  FAIL = 'fail',
}

@Entity('payments')
@Index('idx_payments_business_status', ['businessId', 'status'])
@Index('idx_payments_created', ['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: number;

  @Column()
  packageId: number;

  @Column({ unique: true })
  transactionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'BDT' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'json', nullable: true })
  gatewayData: any;

  @Column({ nullable: true })
  adminId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
