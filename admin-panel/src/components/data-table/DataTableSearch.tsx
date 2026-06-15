import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // We'll need to create this

interface DataTableSearchProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function DataTableSearch({
  initialValue = '',
  onSearch,
  placeholder = 'Search...',
}: DataTableSearchProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 500);

  // Sync internal state if URL changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Trigger search on debounce
  useEffect(() => {
    // Only trigger if the value actually changed from the initial/current URL state
    if (debouncedValue !== initialValue) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, initialValue]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-9 w-[250px] lg:w-[300px]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
