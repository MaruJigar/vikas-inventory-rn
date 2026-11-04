'use client';

import React, { useState, useEffect } from 'react';
import { InventoryValuationTable } from './InventoryValuationTable';
import { inventoryValuationApi } from '../api';
import { InventoryReportItem } from '../types';
import { ReportExportButton } from '@/components/reporting/ReportExportButton';
import { RefreshCw, Boxes, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InventoryValuationReport() {
  const [data, setData] = useState<InventoryReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryValuationApi.getInventoryValuation();
      setData(res?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch inventory valuation:", err);
      setError(err?.message || "Failed to load inventory valuation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const totalValue = data.reduce((acc, row) => acc + (row.stockValue || 0), 0);
  const totalAvailable = data.reduce((acc, row) => acc + (row.availableQuantity || 0), 0);
  const totalReserved = data.reduce((acc, row) => acc + (row.reservedQuantity || 0), 0);

  const exportColumns = [
    { header: 'Product Name', accessor: (r: InventoryReportItem) => r.productName },
    { header: 'SKU', accessor: (r: InventoryReportItem) => r.sku || '' },
    { header: 'Category', accessor: (r: InventoryReportItem) => r.categoryName || '' },
    { header: 'Available Quantity', accessor: (r: InventoryReportItem) => r.availableQuantity },
    { header: 'Reserved Quantity', accessor: (r: InventoryReportItem) => r.reservedQuantity },
    { header: 'MRP (INR)', accessor: (r: InventoryReportItem) => r.mrp },
    { header: 'Total Stock Value (INR)', accessor: (r: InventoryReportItem) => r.stockValue },
  ];

  const exportFilename = `inventory-valuation-snapshot-${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Real-time warehouse stock snapshot. Historical ledger movement data is not stored in database.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ReportExportButton
            data={data}
            columns={exportColumns}
            filename={exportFilename}
            disabled={loading || data.length === 0}
          />
        </div>
      </div>

      {/* Snapshot KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Stock Valuation</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Based on active product MRP</div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available Units</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {totalAvailable.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">In stock and unreserved</div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reserved Units</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {totalReserved.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">Allocated to pending orders</div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white border rounded-lg shadow-sm">
          Loading inventory valuation snapshot...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-white border rounded-lg shadow-sm">
          {error}
        </div>
      ) : (
        <InventoryValuationTable data={data} />
      )}
    </div>
  );
}
