import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

// Explicit type definitions matching our database output structure
interface StockRow {
  sku: string;
  name: string;
  binLocation: string;
  currentStock: number;
  reorderPoint: number;
}

type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'HEALTHY';

const getStatus = (stock: number, reorder: number): StockStatus => {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= reorder) return 'LOW_STOCK';
  return 'HEALTHY';
};

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; className: string; icon: React.ElementType; pulse?: boolean }
> = {
  OUT_OF_STOCK: {
    label: 'Out of stock',
    className: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30',
    icon: XCircle,
    pulse: true,
  },
  LOW_STOCK: {
    label: 'Low stock',
    className: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30',
    icon: AlertTriangle,
  },
  HEALTHY: {
    label: 'Healthy',
    className: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
    icon: CheckCircle2,
  },
};

const columnHelper = createColumnHelper<StockRow>();

export const StockTable: React.FC<{ data: StockRow[] }> = ({ data }) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'index',
        header: '#',
        cell: (info) => (
          <span className="font-mono text-xs text-slate-600">
            {String(info.row.index + 1).padStart(2, '0')}
          </span>
        ),
      }),
      columnHelper.accessor('sku', {
        header: 'SKU',
        cell: (info) => <span className="font-mono text-sm text-slate-300">{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Product',
        cell: (info) => <span className="font-medium text-slate-100">{info.getValue()}</span>,
      }),
      columnHelper.accessor('binLocation', {
        header: 'Bin',
        cell: (info) => (
          <span className="inline-block rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400">
            {info.getValue()}
          </span>
        ),
      }),
      // columnHelper.accessor('currentStock', {
      //   header: 'Qty',
      //   cell: (info) => (
      //     <span className="font-mono text-sm font-semibold tabular-nums text-slate-200">
      //       {info.getValue()}
      //     </span>
      //   ),
      // }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        // Tailor status alerts based on system bounds dynamically
        cell: (info) => {
          const { currentStock, reorderPoint } = info.row.original;
          const status = getStatus(currentStock, reorderPoint);
          const { label, className, icon: Icon, pulse } = STATUS_CONFIG[status];
          return (
            <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${className}`}>
              <Icon size={12} className={pulse ? 'motion-safe:animate-pulse' : ''} />
              {label}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-mono text-sm text-slate-500">No inventory records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-950/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="whitespace-nowrap px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-slate-800/30">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};