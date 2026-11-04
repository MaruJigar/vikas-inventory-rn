'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateCsv, downloadCsv, CsvColumn } from '@/lib/export/csv-export.util';

interface ReportExportButtonProps<T> {
  data: T[] | (() => Promise<T[]> | T[]);
  columns: CsvColumn<T>[];
  filename: string;
  disabled?: boolean;
  label?: string;
}

export function ReportExportButton<T>({
  data,
  columns,
  filename,
  disabled = false,
  label = 'Export CSV',
}: ReportExportButtonProps<T>) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const rows = typeof data === 'function' ? await data() : data;
      if (!rows || rows.length === 0) {
        alert('No data available to export.');
        return;
      }
      const csv = generateCsv(rows, columns);
      downloadCsv(csv, filename);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to generate export. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || loading}
      onClick={handleExport}
      className="text-xs font-medium border-gray-300 hover:bg-gray-50"
    >
      <Download className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
      {loading ? 'Exporting...' : label}
    </Button>
  );
}

