import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    // Format to YYYY-MM-DD
    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];
    onChange(startStr, endStr);
  };

  return (
    <div className="flex items-end gap-4 p-4 border rounded-md bg-white shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input 
          type="date" 
          id="startDate" 
          value={startDate} 
          onChange={(e) => onChange(e.target.value, endDate)} 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input 
          type="date" 
          id="endDate" 
          value={endDate} 
          onChange={(e) => onChange(startDate, e.target.value)} 
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPreset(7)}>Last 7 Days</Button>
        <Button variant="outline" onClick={() => setPreset(30)}>Last 30 Days</Button>
      </div>
    </div>
  );
}
