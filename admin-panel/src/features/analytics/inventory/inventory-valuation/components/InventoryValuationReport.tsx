import React, { useState, useEffect } from 'react';
import { InventoryValuationTable } from './InventoryValuationTable';
import { inventoryValuationApi } from '../api';
import { InventoryReportItem } from '../types';

export function InventoryValuationReport() {
  const [data, setData] = useState<InventoryReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await inventoryValuationApi.getInventoryValuation();
        setData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch inventory valuation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-2 text-sm text-gray-500 bg-gray-50 p-4 border rounded-md shadow-sm">
        Note: Inventory Valuation is based on current real-time stock levels, so date filters do not apply here.
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading report data...</div>
      ) : (
        <InventoryValuationTable data={data} />
      )}
    </div>
  );
}
