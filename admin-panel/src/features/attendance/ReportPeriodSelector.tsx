import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toKolkataDateString } from '@/lib/utils/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // Ensure this exists, or use native inputs
import { Input } from '@/components/ui/input';

export type ReportPeriod = 'day' | 'week' | 'month' | 'custom';

interface Props {
  period: ReportPeriod;
  onPeriodChange: (p: ReportPeriod) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (start: Date, end: Date) => void;
}

export function ReportPeriodSelector({ period, onPeriodChange, date, onDateChange, startDate, endDate, onDateRangeChange }: Props) {
  
  const moveDate = (amount: number) => {
    const d = new Date(date);
    if (period === 'day') d.setDate(d.getDate() + amount);
    if (period === 'week') d.setDate(d.getDate() + (amount * 7));
    if (period === 'month') d.setMonth(d.getMonth() + amount);
    onDateChange(d);
  };

  const formatDisplay = () => {
    if (period === 'day') {
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    }
    if (period === 'month') {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    }
    if (period === 'week') {
      // Find monday of the week
      const d = new Date(date);
      const day = d.getDay() || 7; 
      d.setDate(d.getDate() - day + 1);
      const endD = new Date(d);
      endD.setDate(d.getDate() + 6);
      const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
      return `${fmt.format(d)} - ${fmt.format(endD)}`;
    }
    return '';
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-md border shadow-sm">
      <div className="flex bg-slate-100 p-1 rounded-md">
        {(['day', 'week', 'month', 'custom'] as ReportPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors capitalize ${period === p ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {period !== 'custom' ? (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => moveDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[140px] text-center">{formatDisplay()}</span>
          <Button variant="outline" size="icon" onClick={() => moveDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
           <Input 
             type="date" 
             value={startDate ? toKolkataDateString(startDate) : ''} 
             onChange={(e) => onDateRangeChange?.(new Date(e.target.value), endDate || new Date())} 
             className="w-auto"
           />
           <span className="text-slate-500">to</span>
           <Input 
             type="date" 
             value={endDate ? toKolkataDateString(endDate) : ''} 
             onChange={(e) => onDateRangeChange?.(startDate || new Date(), new Date(e.target.value))} 
             className="w-auto"
           />
        </div>
      )}
    </div>
  );
}
