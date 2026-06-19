import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum POStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'suggested_reorder_quantity' })
  suggestedQuantity!: number;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.PENDING })
  status!: POStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}