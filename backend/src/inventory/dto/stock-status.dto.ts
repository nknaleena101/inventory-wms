export class StockStatusDto {
  id: string;
  sku: string;
  name: string;
  binLocation: string;
  currentStock: number;
  reorderPoint: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}