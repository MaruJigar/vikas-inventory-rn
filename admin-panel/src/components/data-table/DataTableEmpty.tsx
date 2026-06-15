import { Inbox } from 'lucide-react';

interface DataTableEmptyProps {
  message?: string;
  subMessage?: string;
}

export function DataTableEmpty({
  message = 'No records found',
  subMessage = 'Try adjusting your filters or search query.',
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
        <Inbox className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900">{message}</h3>
      <p className="mt-1 text-sm text-slate-500">{subMessage}</p>
    </div>
  );
}
