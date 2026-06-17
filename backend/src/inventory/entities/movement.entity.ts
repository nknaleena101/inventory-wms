import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum MovementType {
  RECEIVING = 'RECEIVING',
  SHIPPING = 'SHIPPING',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

@Entity('inventory_movements')
@Index(['productId', 'binId', 'status']) // Multi-column index for blazing fast lookups
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'bin_id', nullable: true })
  binId: string; // The specific warehouse shelf location

  @Column()
  quantity: number; // e.g., +50 (Received) or -5 (Shipped)

  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Column({ default: 'COMPLETED' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.movements)
  product: Product;
}