import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { InventoryMovement, MovementType } from '../inventory/entities/movement.entity';

@Injectable()
export class SeedService {
  constructor(private dataSource: DataSource) {}

  async runSeed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Clean the database safely to prevent duplicates on re-runs
      await queryRunner.manager.query('TRUNCATE TABLE inventory_movements CASCADE;');
      await queryRunner.manager.query('TRUNCATE TABLE products CASCADE;');

      // 2. Insert Core Products
      const productsData = [
        { sku: 'APP-M1-X16', name: 'MacBook Pro M1 16GB', reorderPoint: 15 },
        { sku: 'LOG-MX-MSE', name: 'Logitech MX Master 3S', reorderPoint: 40 },
        { sku: 'DKY-ONE-KB', name: 'Ducky One 3 Mechanical Keyboard', reorderPoint: 10 },
        { sku: 'SM-S908-256', name: 'Samsung Galaxy S22 Ultra 256GB', reorderPoint: 8 },
        { sku: 'APP-AIR-PDS', name: 'Apple AirPods Pro (Gen 2)', reorderPoint: 25 },
      ];

      const savedProducts: Product[] = [];
      for (const prod of productsData) {
        const product = new Product();
        product.sku = prod.sku;
        product.name = prod.name;
        product.reorderPoint = prod.reorderPoint;
        const saved = await queryRunner.manager.save(product);
        savedProducts.push(saved);
      }

      // Mock Warehouse Bins
      const binA = 'BIN-A-101'; // Main aisle
      const binB = 'BIN-B-202'; // Bulk storage
      const binC = 'BIN-C-303'; // Shipping prep area

      // 3. Insert Historical Ledger Movements (Simulating Real Operations)
      const movements: Partial<InventoryMovement>[] = [
        // --- Product 1: MacBook Pro (Healthy Stock) ---
        { productId: savedProducts[0].id, binId: binA, quantity: 50, type: MovementType.RECEIVING }, // Initial intake
        { productId: savedProducts[0].id, binId: binA, quantity: -10, type: MovementType.SHIPPING }, // Customer order
        { productId: savedProducts[0].id, binId: binA, quantity: -5, type: MovementType.SHIPPING },  // Customer order
        // Total = 35 (Reorder Point = 15) -> Healthy

        // --- Product 2: Logitech Mouse (CRITICAL: Low Stock) ---
        { productId: savedProducts[1].id, binId: binB, quantity: 100, type: MovementType.RECEIVING },
        { productId: savedProducts[1].id, binId: binB, quantity: -40, type: MovementType.SHIPPING },
        { productId: savedProducts[1].id, binId: binB, quantity: -25, type: MovementType.SHIPPING },
        // Total = 35 (Reorder Point = 40) -> Low Stock Trigger!

        // --- Product 3: Ducky Keyboard (CRITICAL: Out of Stock) ---
        { productId: savedProducts[2].id, binId: binA, quantity: 20, type: MovementType.RECEIVING },
        { productId: savedProducts[2].id, binId: binA, quantity: -15, type: MovementType.SHIPPING },
        { productId: savedProducts[2].id, binId: binA, quantity: -5, type: MovementType.SHIPPING },
        // Total = 0 (Reorder Point = 10) -> Out of Stock!

        // --- Product 4: Samsung Galaxy (Internal Transfers) ---
        { productId: savedProducts[3].id, binId: binB, quantity: 30, type: MovementType.RECEIVING },
        { productId: savedProducts[3].id, binId: binB, quantity: -10, type: MovementType.INTERNAL_TRANSFER }, // Left Bin B
        { productId: savedProducts[3].id, binId: binC, quantity: 10, type: MovementType.INTERNAL_TRANSFER },  // Entered Bin C
        { productId: savedProducts[3].id, binId: binC, quantity: -2, type: MovementType.SHIPPING },
        // Total = 28 (Reorder Point = 8) -> Healthy
      ];

      for (const move of movements) {
        const movement = new InventoryMovement();
        Object.assign(movement, move);
        await queryRunner.manager.save(movement);
      }

      await queryRunner.commitTransaction();
      return { message: 'Database seeded successfully with explicit ledger logs!' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}