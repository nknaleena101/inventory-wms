import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockStatusDto } from './dto/stock-status.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock-levels')
  async getStockLevels(): Promise<StockStatusDto[]> {
    return this.inventoryService.getAggregatedStockLevels();
  }
}