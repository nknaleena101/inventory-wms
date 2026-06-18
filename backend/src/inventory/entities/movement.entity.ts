import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum MovementType {
  RECEIVING = 'RECEIVING',
  SHIPPING = 'SHIPPING',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

@Entity('inventory_movements')
@Index(['productId', 'binId', 'status']) 
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Notice the ! operator added here

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'bin_id', nullable: true })
  binId!: string; 
  
  @Column()
  quantity!: number; 
  
  @Column({ type: 'enum', enum: MovementType })
  type!: MovementType;
  
  @Column({ default: 'COMPLETED' })
  status!: string;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.movements)
  @JoinColumn({ name: 'product_id' }) 
  product!: Product;
}