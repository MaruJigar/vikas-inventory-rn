import React, { useState, useEffect } from 'react';
import { SalesSummaryTable } from './SalesSummaryTable';
import { ReportDateFilter } from '@/features/analytics/shared/components/ReportDateFilter';
import { salesSummaryApi } from '../api';
import { SalesReportItem } from '../types';

export function SalesSummaryReport() {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [data, setData] = useState<SalesReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await salesSummaryApi.getSalesSummary({ startDate, endDate });
        setData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch sales summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <ReportDateFilter 
        startDate={startDate} 
        endDate={endDate} 
        onChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }} 
      />

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white border rounded-lg shadow-sm">Loading report data...</div>
      ) : (
        <SalesSummaryTable data={data} />
      )}
    </div>
  );
}
