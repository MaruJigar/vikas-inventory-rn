import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarRange, X } from 'lucide-react';

interface AnalyticsDateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export function AnalyticsDateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: AnalyticsDateFilterProps) {
  const hasFilter = !!startDate || !!endDate;

  return (
    <div className="flex items-end gap-4 bg-white border rounded-lg p-4 shadow-sm">
      <CalendarRange className="h-5 w-5 text-slate-400 mb-2 shrink-0" />
      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-1">
          <Label htmlFor="analytics-start-date" className="text-xs font-medium text-slate-600">
            Start Date
          </Label>
          <Input
            id="analytics-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-40 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="analytics-end-date" className="text-xs font-medium text-slate-600">
            End Date
          </Label>
          <Input
            id="analytics-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-40 text-sm"
          />
        </div>
        {hasFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="mb-0.5 text-slate-500 hover:text-slate-800"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
      {!hasFilter && (
        <p className="text-xs text-slate-400 mb-2">All time data (no date filter applied)</p>
      )}
    </div>
  );
}
