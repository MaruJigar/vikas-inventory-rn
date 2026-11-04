'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BarChart,
  Boxes,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Server,
  UserCheck,
  RotateCcw,
  Store,
  CalendarDays,
} from "lucide-react";

export default function AnalyticsHubPage() {
  const { user } = useAuthStore();
  const role = user?.role;

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reporting & Analytics Hub</h1>
            <p className="text-sm text-gray-500 mt-1">
              Access executive summaries, performance leaderboards, audits, and operational reports.
            </p>
          </div>

          {/* Super Admin Section */}
          {role === 'SUPER_ADMIN' && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                Platform & System Reports (Super Admin)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Link href="/audit-logs" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">1.1 System Audit & Security Log</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Tamper-evident logs of logins, mutations, and actor actions with CSV export.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/global-sales" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">1.2 Global Sales & GMV Summary</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Cross-platform revenue, gross vs net GMV, tax & discount breakdowns by period.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/platform-growth" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">1.3 Platform Growth & Onboarding</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Growth metrics for manufacturers, distributors (internal/external), and salesmen.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-blue-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/shop-audits" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">1.4 Shop Duplicate & Verification Audit</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      GST/GPS duplicate detection clusters and shop visiting-card photo verification audits.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-amber-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/background-jobs" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <Server className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">1.5 Background Job Performance</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Real-time database worker job metrics, failure latency, retry counts, and status breakdowns.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-rose-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Manufacturer Admin & Cross Reports */}
          {(role === 'MANUFACTURER_ADMIN' || role === 'SUPER_ADMIN') && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                Manufacturer Admin Reports
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Link href="/analytics/sales/sales-summary" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BarChart className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">2.1 Primary Sales & Invoicing</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Primary manufacturer invoiced sales with Indian financial quarters/yearly date filtering.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-blue-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/inventory/inventory-valuation" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">2.2 Manufacturer Inventory & Alerts</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Live inventory snapshot, reserved stock, valuation, and threshold low-stock alerts.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-purple-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/orders/analytics" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">2.3 Distributor Performance Leaderboard</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Ranked performance of distributors, sales volume, cancelled orders, and order velocity.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/orders/backorders" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">2.5 Backorders & Unfulfilled Demand</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Unfulfilled distributor demand, product bottlenecks, and allocation tracking.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-red-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Distributor Admin Section */}
          {(role === 'DISTRIBUTOR_ADMIN' || role === 'SUPER_ADMIN') && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                Distributor Admin Reports
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Link href="/analytics/sales/sales-summary" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BarChart className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">3.1 Secondary Sales & Retail Order Book</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Scoped retail shop sales, product volumes, discounts, and fulfillment metrics.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-blue-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics/inventory/inventory-valuation" className="group">
                  <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">3.2 Distributor Stock Ledger & Valuation</h3>
                    </div>
                    <p className="text-sm text-gray-500 flex-1">
                      Distributor warehouse available and reserved stock valuation by SKU.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-semibold text-purple-600">
                      Open Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Field Operations & Attendance */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Field Operations & DSR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Link href="/working-days" className="group">
                <div className="p-5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">4.1 & 4.2 Attendance & Daily Route Sheet</h3>
                  </div>
                  <p className="text-sm text-gray-500 flex-1">
                    Salesman check-in, check-out logs, kilometers traveled, and daily route performance.
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-amber-600">
                    Open Records <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
