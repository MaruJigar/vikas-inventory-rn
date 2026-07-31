'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft } from "lucide-react";
import { InventoryValuationReport } from "@/features/analytics/inventory/inventory-valuation/components/InventoryValuationReport";

export default function InventoryValuationPage() {
  return (
    <RoleGuard roles={['MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/analytics/inventory" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory Valuation</h1>
              <p className="text-sm text-gray-500 mt-1">
                Current stock levels, reserved quantities, and overall stock value.
              </p>
            </div>
          </div>

          <InventoryValuationReport />
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
