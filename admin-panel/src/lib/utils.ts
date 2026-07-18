import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    let dateStr = typeof dateString === 'string' ? dateString : dateString.toISOString();
    
    // Enforce UTC parsing if the date string from the database is missing timezone info
    if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dateStr)) {
      dateStr = dateStr.replace(' ', 'T') + 'Z';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';

    // Format: DD MMM YYYY, hh:mm A (e.g., 17 Jul 2026, 09:45 AM)
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
    
    // Ensure AM/PM is uppercase if locale outputs lowercase
    return formatted.toUpperCase().replace(/(AM|PM)$/i, (match) => match.toUpperCase());
  } catch (error) {
    return '-';
  }
}
