'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateRangePicker } from '@/features/analytics/components/DateRangePicker';
import { SalesTable } from '@/features/analytics/components/SalesTable';
import { InventoryTable } from '@/features/analytics/components/InventoryTable';
import { analyticsService } from '@/services/analytics.service';
import { SalesReportItem, InventoryReportItem } from '@/types/api/analytics.types';
import { useAuthStore } from '@/store/useAuthStore';
import { hasRole } from '@/lib/auth/guards';
import { PERMISSIONS } from '@/config/permissions';

export default function AnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  
  // Initialize with last 30 days
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReportItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (!user || !hasRole(user.role, PERMISSIONS.ANALYTICS_VIEW)) return;

    const fetchReports = async () => {
      setLoading(true);
      try {
        if (activeTab === 'sales') {
          const res = await analyticsService.getSalesReport({ startDate, endDate });
          setSalesData(res.data || []);
        } else if (activeTab === 'inventory') {
          const res = await analyticsService.getInventoryReport(); // Inventory is current state, no dates
          setInventoryData(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeTab, startDate, endDate, user]);

  return (
    <RoleGuard roles={['MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Detailed reporting for your inventory, sales, and taxes.
            </p>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }} 
            />
          </div>

          <Tabs defaultValue="sales" onValueChange={(val) => setActiveTab(val)}>
            <TabsList>
              <TabsTrigger value="sales">Sales Report</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Valuation</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading report data...</div>
              ) : (
                <>
                  <TabsContent value="sales">
                    <SalesTable data={salesData} />
                  </TabsContent>
                  <TabsContent value="inventory">
                    <div className="mb-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      Note: Inventory Valuation is based on current real-time stock levels, so date filters do not apply here.
                    </div>
                    <InventoryTable data={inventoryData} />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
