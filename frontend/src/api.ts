export interface StockRow {
  id: string;
  sku: string;
  name: string;
  binLocation: string;
  currentStock: number;
  reorderPoint: number;
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export const fetchStockLevels = async (): Promise<StockRow[]> => {
  const response = await fetch('http://localhost:3000/inventory/stock-levels');
  if (!response.ok) {
    throw new Error('Network error failed to fetch stock metrics.');
  }
  return response.json();
};