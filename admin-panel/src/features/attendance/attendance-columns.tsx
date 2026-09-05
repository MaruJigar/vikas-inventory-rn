import { ColumnDef } from '@tanstack/react-table';
import { WorkingDayDto } from '@/types/api/working-day.types';
import { formatDate } from '@/lib/utils';
import { UserRole } from '@/store/useAuthStore';
import { MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns'; // Actually, we should use our shared formatDate for all dates, but for time only we can use date-fns if we want, or just format properly. We'll use formatting for full timestamps.

interface AttendanceColumnsProps {
  userRole: UserRole | undefined;
}

const formatTimeOnly = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};

const renderLocationLink = (location: any) => {
  if (!location || !location.coordinates || location.coordinates.length < 2) {
    return <span className="text-slate-400">No Location</span>;
  }
  const [lng, lat] = location.coordinates;
  return (
    <a 
      href={`https://www.google.com/maps?q=${lat},${lng}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center text-blue-600 hover:text-blue-800"
    >
      <MapPin className="h-4 w-4 mr-1" />
      View Map
      <ExternalLink className="h-3 w-3 ml-1" />
    </a>
  );
};

export const getAttendanceColumns = ({ userRole }: AttendanceColumnsProps): ColumnDef<WorkingDayDto>[] => {
  const columns: ColumnDef<WorkingDayDto>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="font-medium text-slate-900 whitespace-nowrap">
          {formatDate(row.original.check_in_at)}
        </div>
      ),
    },
    {
      accessorKey: 'salesman',
      header: 'Salesman',
      cell: ({ row }) => (
        <div className="text-slate-600">{row.original.salesman?.full_name || 'N/A'}</div>
      ),
    },
  ];

  if (userRole === 'SUPER_ADMIN' || userRole === 'MANUFACTURER_ADMIN') {
    columns.push({
      accessorKey: 'distributor',
      header: 'Distributor',
      cell: ({ row }) => (
        <div className="text-slate-600">{row.original.distributor?.business_name || 'N/A'}</div>
      ),
    });
  }

  columns.push(
    {
      accessorKey: 'check_in',
      header: 'Check In',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-slate-800 font-medium">{formatTimeOnly(row.original.check_in_at)}</span>
          {renderLocationLink(row.original.check_in_location)}
        </div>
      ),
    },
    {
      accessorKey: 'check_out',
      header: 'Check Out',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-slate-800 font-medium">{formatTimeOnly(row.original.check_out_at)}</span>
          {renderLocationLink(row.original.check_out_location)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
            status === 'MISSED' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {status}
          </span>
        );
      },
    }
  );

  return columns;
};
