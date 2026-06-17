import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReplenishmentService {
  private readonly logger = new Logger(ReplenishmentService.name);

  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2
  ) {}

  // Runs automatically every single midnight to detect depleted stocks
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async evaluateStockLevels() {
    this.logger.log('Starting automated warehouse stock evaluation analysis...');

    // SQL Query to calculate the ledger sums and compare them against individual reorder rules
    const lowStockItems = await this.dataSource.manager
      .createQueryBuilder(Product, 'product')
      .leftJoin('product.movements', 'movement')
      .select('product.id', 'id')
      .addSelect('product.sku', 'sku')
      .addSelect('COALESCE(SUM(movement.quantity), 0)', 'currentStock')
      .groupBy('product.id')
      .having('COALESCE(SUM(movement.quantity), 0) <= product.reorder_point')
      .getRawMany();

    for (const item of lowStockItems) {
      this.logger.warn(`SKU: ${item.sku} is low on stock (${item.currentStock} units left). Launching Event triggers.`);
      
      // Emit internal asynchronous events to automatically order more items
      this.eventEmitter.emit('stock.low', { productId: item.id, currentStock: item.currentStock });
    }
  }
}