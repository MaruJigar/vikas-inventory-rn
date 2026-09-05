'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { BarChart, Boxes, ArrowRight } from "lucide-react";

export default function AnalyticsHubPage() {
  return (
    <RoleGuard roles={['MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Hub</h1>
            <p className="text-sm text-gray-500 mt-1">
              Select a domain below to view related reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/analytics/sales" className="group">
              <div className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BarChart className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Sales Reports</h2>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                  Analyze your revenue, product performance, and sales trends.
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  View Reports <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/analytics/inventory" className="group">
              <div className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Inventory Reports</h2>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                  Track stock levels, valuations, and backordered products.
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                  View Reports <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
