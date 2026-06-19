import { Controller, Get,Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockStatusDto } from './dto/stock-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private eventEmitter: EventEmitter2 // Inject emitter
  ) {}

  @Get('stock-levels')
  async getStockLevels(): Promise<StockStatusDto[]> {
    return this.inventoryService.getAggregatedStockLevels();
  }
  // Temporary route to instantly test our automation engine pipelines manually
  @Post('trigger-test-replenish')
  async testTrigger() {
    // 1. Fetch current stock configurations
    const currentStockList = await this.inventoryService.getAggregatedStockLevels();
    
    let triggeredCount = 0;
    for (const item of currentStockList) {
      if (item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK') {
        // Broadcast event manually
        this.eventEmitter.emit('stock.low', { productId: item.id, currentStock: item.currentStock });
        triggeredCount++;
      }
    }
    return { success: true, message: `Dispatched stock.low events for ${triggeredCount} matching depleted profiles.` };
  }
}