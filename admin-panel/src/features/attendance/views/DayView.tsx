import { DailyAttendanceResponse, DailySalesmanReport } from '@/types/api/attendance.types';
import { DataTable } from '@/components/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { AttendanceStatusBadge } from '../status-badges';
import { formatDuration, formatKolkataTime } from '@/lib/utils/date';
import { MapPin } from 'lucide-react';

interface Props {
  data?: DailyAttendanceResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DayView({ data, isLoading, isError, error, onPageChange, onLimitChange }: Props) {
  
  const columns: ColumnDef<DailySalesmanReport>[] = [
    {
      accessorKey: 'salesman.full_name',
      header: 'Salesman',
      cell: ({ row }) => <span className="font-medium">{row.original.salesman.full_name}</span>
    },
    {
      accessorKey: 'status',
      header: 'Attendance',
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />
    },
    {
      id: 'check_in',
      header: 'Check-In',
      cell: ({ row }) => {
        const atnd = row.original.attendance;
        if (!atnd) return <span className="text-slate-400">—</span>;
        return <span>{formatKolkataTime(atnd.check_in_at)}</span>;
      }
    },
    {
      id: 'check_out',
      header: 'Check-Out',
      cell: ({ row }) => {
        const atnd = row.original.attendance;
        if (!atnd || !atnd.check_out_at) return <span className="text-slate-400">—</span>;
        return <span>{formatKolkataTime(atnd.check_out_at)}</span>;
      }
    },
    {
      accessorKey: 'visits.count',
      header: 'Visits',
      cell: ({ row }) => <span className="font-semibold">{row.original.visits.count}</span>
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => {
        const atnd = row.original.attendance;
        if (!atnd) return <span className="text-slate-400">—</span>;
        return <span>{formatDuration(atnd.duration_minutes)}</span>;
      }
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const atnd = row.original.attendance;
        if (!atnd || !atnd.check_in_location) return <span className="text-slate-400">—</span>;
        return (
           <div className="flex items-center text-slate-600 text-sm">
             <MapPin className="w-3 h-3 mr-1" />
             {atnd.check_in_location.latitude.toFixed(4)}, {atnd.check_in_location.longitude.toFixed(4)}
           </div>
        );
      }
    }
  ];

  return (
    <div className="bg-white rounded-md border shadow-sm">
      <DataTable
        columns={columns}
        data={data as any} 
        isLoading={isLoading}
        isError={isError}
        error={error}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
