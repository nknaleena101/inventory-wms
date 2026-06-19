import React, { useEffect, useState, useMemo } from 'react';
import { StockTable } from './StockTable';
import { fetchStockLevels, type StockRow } from '../../api';
import { Package, RefreshCw } from 'lucide-react';

const GAUGE_TRACK = '#1e293b'; // slate-800

interface GaugeRingProps {
  percent: number;
  color: string;
  textColor: string;
}

// Small dial readout used on the KPI cards — echoes a physical gauge
const GaugeRing: React.FC<GaugeRingProps> = ({ percent, color, textColor }) => {
  const angle = Math.min(100, Math.max(0, percent)) * 3.6;
  return (
    <div
      className="relative h-12 w-12 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${color} ${angle}deg, ${GAUGE_TRACK} ${angle}deg)` }}
    >
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-slate-900">
        <span className={`font-mono text-[10px] font-semibold tabular-nums ${textColor}`}>
          {percent}%
        </span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [stockData, setStockData] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchStockLevels()
      .then((data) => {
        setStockData(data);
        setError(null);
        setLastSynced(new Date());
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

  const lowPct = metrics.totalSKUs ? Math.round((metrics.lowStock / metrics.totalSKUs) * 100) : 0;
  const outPct = metrics.totalSKUs ? Math.round((metrics.outOfStock / metrics.totalSKUs) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 font-mono text-sm text-slate-400">
          <RefreshCw size={16} className="motion-safe:animate-spin" />
          Initializing ledger sync…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="max-w-sm rounded-lg border border-red-900/50 bg-red-950/30 p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-red-400">Sync failed</p>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-md border border-red-800/60 bg-red-900/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 [background-image:radial-gradient(circle_at_15%_-10%,rgba(245,158,11,0.08),transparent_55%)]">
      {/* Console header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Live
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Warehouse Ledger</h1>
            <p className="text-sm text-slate-500">Control center for stock levels &amp; replenishment alerts</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? 'motion-safe:animate-spin' : ''} />
              Sync
            </button>
            {lastSynced && (
              <span className="font-mono text-[11px] text-slate-600">
                Last sync {lastSynced.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* KPI rail */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-5">
            <span className="absolute inset-y-0 left-0 w-1 bg-blue-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Tracked SKUs</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-white">{metrics.totalSKUs}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-500/20">
                <Package size={20} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-5">
            <span className="absolute inset-y-0 left-0 w-1 bg-amber-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Low Stock</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-white">{metrics.lowStock}</p>
              </div>
              <GaugeRing percent={lowPct} color="#fbbf24" textColor="text-amber-300" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900 p-5">
            <span className="absolute inset-y-0 left-0 w-1 bg-red-400/70" />
            <div className="flex items-center justify-between pl-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Out of Stock</p>
                <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-red-400">{metrics.outOfStock}</p>
              </div>
              <GaugeRing percent={outPct} color="#f87171" textColor="text-red-300" />
            </div>
          </div>
        </div>

        {/* Ledger table */}
        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Inventory Manifest</h2>
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-400">
              {stockData.length} {stockData.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <StockTable data={stockData} />
        </section>
      </main>
    </div>
  );
};