'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";

export default function InventoryHubPage() {
  return (
    <RoleGuard roles={['MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/analytics" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory Reports</h1>
              <p className="text-sm text-gray-500 mt-1">
                Select a specific report to view.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/analytics/inventory/inventory-valuation" className="group">
              <div className="p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Inventory Valuation</h2>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                  View current stock levels, reserved quantities, and overall stock value.
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
