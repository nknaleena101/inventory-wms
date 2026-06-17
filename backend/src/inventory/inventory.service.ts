import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryMovement, MovementType } from './entities/movement.entity';

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
}