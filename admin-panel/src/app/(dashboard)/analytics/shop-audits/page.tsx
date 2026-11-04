'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { analyticsService } from '@/services/analytics.service';
import { ArrowLeft, Store, AlertTriangle, CheckCircle, RefreshCw, MapPin, Hash, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportExportButton } from '@/components/reporting/ReportExportButton';
import { formatDate } from '@/lib/utils';

export default function ShopAuditsPage() {
  const [tab, setTab] = useState<'duplicates' | 'verification'>('duplicates');
  const [dupData, setDupData] = useState<any>(null);
  const [verData, setVerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'duplicates') {
        const res = await analyticsService.getDuplicateAudit();
        setDupData(res?.data || res);
      } else {
        const res = await analyticsService.getVerificationAudit();
        setVerData(res?.data || res);
      }
    } catch (err) {
      console.error('Failed to fetch audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  return (
    <RoleGuard allowedRoles={PERMISSIONS.MANUFACTURERS_VIEW}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-amber-600" />
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Shop Duplicate & Verification Audit
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Report 1.4: GST number matches, GPS proximity clusters, and visiting-card photo verification audit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              {tab === 'duplicates' ? (
                <ReportExportButton
                  data={dupData?.gstClusters || []}
                  columns={[
                    { header: 'GST Number', accessor: (r: any) => r.gstNumber },
                    { header: 'Duplicate Count', accessor: (r: any) => r.duplicateCount },
                    { header: 'Shops in Cluster', accessor: (r: any) => r.shops?.map((s: any) => s.name).join('; ') || '' },
                  ]}
                  filename={'shop-duplicate-gst-clusters-' + new Date().toISOString().split('T')[0]}
                  disabled={loading || !dupData?.gstClusters?.length}
                  label="Export GST Duplicates CSV"
                />
              ) : (
                <ReportExportButton
                  data={verData?.shops || []}
                  columns={[
                    { header: 'Shop Name', accessor: (r: any) => r.name },
                    { header: 'Owner Name', accessor: (r: any) => r.ownerName },
                    { header: 'Phone', accessor: (r: any) => r.phone },
                    { header: 'Has Visiting Card Photo', accessor: (r: any) => r.hasPhoto ? 'YES' : 'NO' },
                    { header: 'Has GPS', accessor: (r: any) => r.hasGps ? 'YES' : 'NO' },
                    { header: 'Latitude', accessor: (r: any) => r.latitude || '' },
                    { header: 'Longitude', accessor: (r: any) => r.longitude || '' },
                    { header: 'Created At (IST)', accessor: (r: any) => formatDate(r.createdAt) },
                  ]}
                  filename={'shop-verification-audit-' + new Date().toISOString().split('T')[0]}
                  disabled={loading || !verData?.shops?.length}
                  label="Export KYC Audit CSV"
                />
              )}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTab('duplicates')}
              className={`py-2.5 px-5 text-sm font-medium border-b-2 transition-colors ${
                tab === 'duplicates'
                  ? 'border-amber-600 text-amber-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Duplicate Clusters (GST & GPS)
            </button>
            <button
              onClick={() => setTab('verification')}
              className={`py-2.5 px-5 text-sm font-medium border-b-2 transition-colors ${
                tab === 'verification'
                  ? 'border-amber-600 text-amber-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Photo & KYC Verification Audit
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 bg-white border rounded-lg">
              Running audit analysis...
            </div>
          ) : tab === 'duplicates' ? (
            <div className="space-y-6">
              {/* Duplicate Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">GST Duplicate Clusters</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {dupData?.summary?.gstDuplicateClusters || 0}
                  </div>
                  <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" /> Identical tax IDs across shops
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">GPS Proximity Clusters</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {dupData?.summary?.gpsProximityClusters || 0}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Within 100 meters of another shop
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">Total Flagged Shops</div>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    {dupData?.summary?.totalFlaggedShops || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Requires supervisor review</div>
                </div>
              </div>

              {/* GST Clusters Table */}
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> GST Duplicate Clusters
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-700 text-xs font-medium">
                      <tr>
                        <th className="p-3">GST Number</th>
                        <th className="p-3">Cluster Count</th>
                        <th className="p-3">Shops in Cluster</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!dupData?.gstClusters || dupData.gstClusters.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-400">
                            Zero GST duplicates found. Clean database!
                          </td>
                        </tr>
                      ) : (
                        dupData.gstClusters.map((c: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3 font-mono font-semibold text-xs text-slate-800">{c.gstNumber}</td>
                            <td className="p-3 font-semibold text-rose-600">{c.duplicateCount} shops</td>
                            <td className="p-3 text-xs text-gray-600">
                              {c.shops?.map((s: any) => `${s.name} (${s.ownerName})`).join(' · ')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GPS Clusters Table */}
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> GPS Radius Proximity Clusters (≤ 100m)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-700 text-xs font-medium">
                      <tr>
                        <th className="p-3">Reference Shop</th>
                        <th className="p-3">Conflicting Nearby Shop</th>
                        <th className="p-3">Distance (Meters)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!dupData?.gpsClusters || dupData.gpsClusters.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-400">
                            Zero geographic clusters detected within 100 meters.
                          </td>
                        </tr>
                      ) : (
                        dupData.gpsClusters.map((g: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{g.shop1Name}</td>
                            <td className="p-3 text-gray-700">{g.shop2Name}</td>
                            <td className="p-3 font-mono text-xs font-semibold text-rose-600">{g.distanceMeters}m</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">Total Shops Audited</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {verData?.summary?.totalShops || 0}
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">With Visiting Card</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {verData?.summary?.withPhoto || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {verData?.summary?.photoCompliancePercentage || 0}% compliance
                  </div>
                </div>

                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">Missing Photo</div>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    {verData?.summary?.missingPhoto || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Unverified visiting cards</div>
                </div>

                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <div className="text-xs text-gray-500 font-medium uppercase">GPS Verified</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {verData?.summary?.withGps || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Coordinates locked</div>
                </div>
              </div>

              {/* Verification Audit Table */}
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Shop Verification List
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-700 text-xs font-medium">
                      <tr>
                        <th className="p-3">Shop Name</th>
                        <th className="p-3">Owner</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Visiting Card Photo</th>
                        <th className="p-3">GPS Captured</th>
                        <th className="p-3">Created On (IST)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!verData?.shops || verData.shops.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            No shops registered yet.
                          </td>
                        </tr>
                      ) : (
                        verData.shops.map((s: any) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{s.name}</td>
                            <td className="p-3 text-gray-600">{s.ownerName}</td>
                            <td className="p-3 text-xs font-mono text-gray-500">{s.phone}</td>
                            <td className="p-3">
                              {s.hasPhoto ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Uploaded
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Missing
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {s.hasGps ? (
                                <span className="text-xs text-blue-600 font-mono">
                                  {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(s.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </RoleGuard>
  );
}

