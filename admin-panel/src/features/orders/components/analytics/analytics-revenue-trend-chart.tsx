'use client';

import { useMemo, useState } from 'react';
import { OrdersAnalyticsTrendItem } from '@/types/api/analytics.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface AnalyticsRevenueTrendChartProps {
  data: OrdersAnalyticsTrendItem[] | undefined;
  isLoading: boolean;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 40, left: 60 };

function formatCurrency(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function AnalyticsRevenueTrendChart({ data, isLoading }: AnalyticsRevenueTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
    const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const minRevenue = 0;

    const points = data.map((item, i) => ({
      x: PADDING.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: PADDING.top + innerH - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * innerH,
      item,
    }));

    const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

    // Y axis tick marks (4 ticks)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
      y: PADDING.top + innerH - pct * innerH,
      label: formatCurrency(minRevenue + pct * (maxRevenue - minRevenue)),
    }));

    // X axis labels — show max 7 evenly spaced
    const xStep = Math.max(1, Math.ceil(data.length / 7));
    const xLabels = points
      .filter((_, i) => i % xStep === 0 || i === data.length - 1)
      .map((p) => ({ x: p.x, label: formatDateLabel(p.item.date) }));

    return { points, polylineStr, yTicks, xLabels };
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Revenue Over Time</CardTitle>
        <TrendingUp className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ) : !chartData ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-slate-400">
            No trend data for selected period.
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="w-full"
              style={{ minWidth: 320 }}
              aria-label="Revenue trend over time"
            >
              {/* Y-axis grid lines + labels */}
              {chartData.yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={PADDING.left}
                    y1={tick.y}
                    x2={CHART_WIDTH - PADDING.right}
                    y2={tick.y}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    strokeDasharray={i === 0 ? '0' : '4 3'}
                  />
                  <text
                    x={PADDING.left - 6}
                    y={tick.y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fill="#94a3b8"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {chartData.xLabels.map((lbl, i) => (
                <text
                  key={i}
                  x={lbl.x}
                  y={CHART_HEIGHT - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94a3b8"
                >
                  {lbl.label}
                </text>
              ))}

              {/* Area fill under line */}
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <polygon
                points={`${PADDING.left},${CHART_HEIGHT - PADDING.bottom} ${chartData.polylineStr} ${CHART_WIDTH - PADDING.right},${CHART_HEIGHT - PADDING.bottom}`}
                fill="url(#revenueGradient)"
              />

              {/* Revenue line */}
              <polyline
                points={chartData.polylineStr}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data points + hover targets */}
              {chartData.points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 5 : 3.5}
                    fill={hoveredIndex === i ? '#6366f1' : '#fff'}
                    stroke="#6366f1"
                    strokeWidth={2}
                    style={{ transition: 'r 0.15s' }}
                  />
                  {/* Invisible larger hit target */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              ))}

              {/* Tooltip */}
              {hoveredIndex !== null && chartData.points[hoveredIndex] && (() => {
                const p = chartData.points[hoveredIndex];
                const ttW = 120;
                const ttH = 44;
                const ttX = Math.min(p.x - ttW / 2, CHART_WIDTH - PADDING.right - ttW);
                const ttY = Math.max(p.y - ttH - 10, PADDING.top);
                return (
                  <g>
                    <rect
                      x={ttX}
                      y={ttY}
                      width={ttW}
                      height={ttH}
                      rx={6}
                      fill="#1e293b"
                      opacity={0.92}
                    />
                    <text x={ttX + ttW / 2} y={ttY + 15} textAnchor="middle" fontSize={9} fill="#94a3b8">
                      {formatDateLabel(p.item.date)}
                    </text>
                    <text x={ttX + ttW / 2} y={ttY + 30} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="600">
                      {formatCurrency(p.item.revenue)}
                    </text>
                    <text x={ttX + ttW / 2} y={ttY + 42} textAnchor="middle" fontSize={9} fill="#94a3b8">
                      {p.item.orderCount} orders
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
