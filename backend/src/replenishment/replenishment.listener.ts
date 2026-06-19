import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PurchaseOrder, POStatus } from './entities/purchase-order.entity';

@Injectable()
export class ReplenishmentListener {
  private readonly logger = new Logger(ReplenishmentListener.name);

  constructor(private dataSource: DataSource) {}

  @OnEvent('stock.low')
  async handleLowStockEvent(payload: { productId: string; currentStock: number }) {
    this.logger.log(`Received stock.low event signal for product ID: ${payload.productId}`);

    const repo = this.dataSource.getRepository(PurchaseOrder);

    // Safety check: Prevent duplicate orders if a pending one already exists for this product
    const existingOrder = await repo.findOne({
      where: { productId: payload.productId, status: POStatus.PENDING },
    });

    if (existingOrder) {
      this.logger.log(`Pending Purchase Order already exists for product ${payload.productId}. Skipping duplication.`);
      return;
    }

    // Standard business rule calculation: Reorder a baseline batch of 50 units
    const newOrder = new PurchaseOrder();
    newOrder.productId = payload.productId;
    newOrder.suggestedQuantity = 50; 
    newOrder.status = POStatus.PENDING;

    await repo.save(newOrder);
    this.logger.log(`[AUTOMATION] Successfully generated Pending Purchase Order for Product ID: ${payload.productId}`);
  }
}