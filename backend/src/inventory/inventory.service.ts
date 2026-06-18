import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryMovement, MovementType } from './entities/movement.entity';
import { Product } from '../products/entities/product.entity';
import { StockStatusDto } from './dto/stock-status.dto';

@Injectable()
export class InventoryService {
  constructor(private dataSource: DataSource) {}

  // Executes an atomic stock transaction
  async transferStock(productId: string, fromBinId: string, toBinId: string, qty: number) {
    if (qty <= 0) throw new BadRequestException('Quantity must be greater than 0');

    // Establish isolated database transaction run
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Deduct stock from the origin bin
      const decrementLog = new InventoryMovement();
      decrementLog.productId = productId;
      decrementLog.binId = fromBinId;
      decrementLog.quantity = -qty; // Negative entry
      decrementLog.type = MovementType.INTERNAL_TRANSFER;
      await queryRunner.manager.save(decrementLog);

      // 2. Add stock to the destination bin
      const incrementLog = new InventoryMovement();
      incrementLog.productId = productId;
      incrementLog.binId = toBinId;
      incrementLog.quantity = qty; // Positive entry
      incrementLog.type = MovementType.INTERNAL_TRANSFER;
      await queryRunner.manager.save(incrementLog);

      // If both steps succeed, permanently commit to ledger records
      await queryRunner.commitTransaction();
      return { success: true, message: 'Stock transfer logged successfully.' };
    } catch (err) {
      // If anything fails, revert everything back to keep data pristine
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Transaction failed. Stock mapping reverted.');
    } finally {
      await queryRunner.release();
    }
  }
  async getAggregatedStockLevels(): Promise<StockStatusDto[]> {
    // Run a high-performance raw aggregation across the ledger indexes
    const rawResults = await this.dataSource.manager
      .createQueryBuilder(Product, 'product')
      .leftJoin('product.movements', 'movement')
      .select([
        'product.id AS id',
        'product.sku AS sku',
        'product.name AS name',
        'product.reorder_point AS "reorderPoint"',
        'COALESCE(SUM(movement.quantity), 0)::INTEGER AS "currentStock"',
        // Grabs the last known bin location for simplicity in our dashboard grid
        'MAX(movement.bin_id) AS "binLocation"'
      ])
      .groupBy('product.id')
      .orderBy('product.sku', 'ASC')
      .getRawMany();

    // Map raw DB figures into business-rule domain objects
    return rawResults.map((row) => {
      let status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'HEALTHY';
      
      if (row.currentStock <= 0) {
        status = 'OUT_OF_STOCK';
      } else if (row.currentStock <= row.reorderPoint) {
        status = 'LOW_STOCK';
      }

      return {
        id: row.id,
        sku: row.sku,
        name: row.name,
        binLocation: row.binLocation || 'UNASSIGNED',
        currentStock: row.currentStock,
        reorderPoint: row.reorderPoint,
        status,
      };
    });
  }
}