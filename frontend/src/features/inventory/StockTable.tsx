import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

// Explicit type definitions matching our database output structure
interface StockRow {
  sku: string;
  name: string;
  binLocation: string;
  currentStock: number;
  reorderPoint: number;
}

const columnHelper = createColumnHelper<StockRow>();

export const StockTable: React.FC<{ data: StockRow[] }> = ({ data }) => {
  const columns = useMemo(() => [
    columnHelper.accessor('sku', { header: 'SKU Code' }),
    columnHelper.accessor('name', { header: 'Product Name' }),
    columnHelper.accessor('binLocation', { header: 'Warehouse Bin' }),
    columnHelper.accessor('currentStock', {
      header: 'Total Available',
      cell: (info) => {
        const stock = info.getValue();
        const reorder = info.row.original.reorderPoint;

        // Tailor status alerts based on system bounds dynamically
        if (stock <= 0) {
          return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">Out of Stock</span>;
        }
        if (stock <= reorder) {
          return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Low Stock Target</span>;
        }
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Healthy Stock</span>;
      },
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500 tracking-wider">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-6 py-3 font-semibold">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
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