import { AlertCircle } from 'lucide-react';

interface DataTableErrorProps {
  error?: Error | null;
}

export function DataTableError({ error }: DataTableErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 animate-in fade-in-50">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-red-800">
          Failed to load data
        </h3>
        <p className="mt-2 text-sm text-red-700 max-w-md">
          {error?.message || 'An unknown error occurred while fetching the table data. Please try again or contact support if the issue persists.'}
        </p>
      </div>
    </div>
  );
}
