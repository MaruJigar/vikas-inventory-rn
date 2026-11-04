import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ReportingPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

interface ReportDateFilterProps {
  period?: ReportingPeriod;
  startDate?: string;
  endDate?: string;
  onPeriodChange?: (period: ReportingPeriod) => void;
  onDateChange?: (start: string, end: string) => void;
  /** Legacy onChange support */
  onChange?: (start: string, end: string) => void;
}

export function ReportDateFilter({
  period = 'monthly',
  startDate = '',
  endDate = '',
  onPeriodChange,
  onDateChange,
  onChange,
}: ReportDateFilterProps) {
  const periods: { label: string; value: ReportingPeriod }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Custom', value: 'custom' },
  ];

  const handlePeriodClick = (p: ReportingPeriod) => {
    if (onPeriodChange) {
      onPeriodChange(p);
    }
    if (p !== 'custom') {
      const now = new Date();
      let start = new Date();
      const endStr = now.toISOString().split('T')[0];

      if (p === 'daily') {
        start = new Date(now);
      } else if (p === 'weekly') {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
      } else if (p === 'monthly') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (p === 'quarterly') {
        const m = now.getMonth();
        const qm = m >= 3 && m <= 5 ? 3 : m >= 6 && m <= 8 ? 6 : m >= 9 && m <= 11 ? 9 : 0;
        start = new Date(now.getFullYear(), qm, 1);
      } else if (p === 'yearly') {
        const fyYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        start = new Date(fyYear, 3, 1);
      }

      const startStr = start.toISOString().split('T')[0];
      if (onDateChange) onDateChange(startStr, endStr);
      if (onChange) onChange(startStr, endStr);
    }
  };

  const handleStartChange = (val: string) => {
    if (onDateChange) onDateChange(val, endDate);
    if (onChange) onChange(val, endDate);
    if (onPeriodChange && period !== 'custom') onPeriodChange('custom');
  };

  const handleEndChange = (val: string) => {
    if (onDateChange) onDateChange(startDate, val);
    if (onChange) onChange(startDate, val);
    if (onPeriodChange && period !== 'custom') onPeriodChange('custom');
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Period:</span>
        {periods.map((p) => {
          const isSelected = period === p.value;
          return (
            <Button
              key={p.value}
              type="button"
              size="sm"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => handlePeriodClick(p.value)}
              className={isSelected ? 'bg-slate-900 text-white' : ''}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-4 pt-2 border-t border-gray-100">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs text-gray-500">
            Start Date
          </Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-40 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate" className="text-xs text-gray-500">
            End Date
          </Label>
          <Input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => handleEndChange(e.target.value)}
            className="w-40 text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground self-center mt-4">
          Financial Year convention: Apr 1 – Mar 31 (IST)
        </div>
      </div>
    </div>
  );
}
