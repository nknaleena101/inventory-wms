import React, { useEffect, useState, useMemo } from 'react';
import { StockTable } from './StockTable';
import { fetchStockLevels, type StockRow } from '../../api';
import { AlertTriangle, CheckCircle, Package, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stockData, setStockData] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchStockLevels()
      .then((data) => {
        setStockData(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics in real-time based on current grid contents
  const metrics = useMemo(() => {
    const totals = { totalSKUs: stockData.length, lowStock: 0, outOfStock: 0 };
    stockData.forEach((item) => {
      if (item.status === 'OUT_OF_STOCK') totals.outOfStock++;
      if (item.status === 'LOW_STOCK') totals.lowStock++;
    });
    return totals;
  }, [stockData]);

  if (loading) return <div className="p-8 text-gray-500 font-medium">Loading inventory matrices...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Upper Context Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Warehouse Ledger Control Center</h1>
          <p className="text-sm text-gray-500">Real-time product routing balances & replenishment alerts.</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          <RefreshCw size={16} /> Sync Ledger
        </button>
      </div>

      {/* Analytical KPI Block cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tracked SKUs</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalSKUs}</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Triggers</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.lowStock}</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24} className="animate-pulse" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Depleted Items (0 Qty)</p>
            <p className="text-2xl font-bold text-gray-900 text-red-600">{metrics.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Main Core Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Stock Ledger Analysis Matrix</h2>
        <StockTable data={stockData} />
      </div>
    </div>
  );
};