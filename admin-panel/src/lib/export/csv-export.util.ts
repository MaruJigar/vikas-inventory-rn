/**
 * Safely escape a CSV cell value.
 * Handles commas, quotes, newlines, and formula injection protection (=, +, -, @).
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // CSV Formula Injection mitigation:
  // Prefix dangerous characters (=, +, -, @, \t, \r) with a single apostrophe
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If contains commas, double quotes, or newlines, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => unknown;
}

/**
 * Converts an array of objects to a UTF-8 CSV string with BOM for Excel compatibility.
 */
export function generateCsv<T>(data: T[], columns: CsvColumn<T>[]): string {
  const headers = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvCell(col.accessor(row))).join(',')
  );

  // UTF-8 BOM (\uFEFF) ensures Excel properly decodes Unicode characters
  return '\uFEFF' + [headers, ...rows].join('\r\n');
}

/**
 * Triggers a browser download of CSV data.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

