'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { regionService } from '@/services/region.service';
import { Label } from '@/components/ui/label';

interface LocationSelectorProps {
  stateValue: string;
  cityValue: string;
  onStateChange: (stateName: string) => void;
  onCityChange: (cityName: string) => void;
  disabled?: boolean;
}

export function LocationSelector({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  disabled = false,
}: LocationSelectorProps) {
  const { data: states = [], isLoading: isStatesLoading } = useQuery({
    queryKey: ['states'],
    queryFn: regionService.getStates,
    staleTime: Infinity,
  });

  // Find the selected state id by name for fetching cities
  const selectedState = states.find((s) => s.name === stateValue);

  const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
    queryKey: ['cities', selectedState?.id],
    queryFn: () => regionService.getCities(selectedState!.id),
    enabled: !!selectedState?.id,
    staleTime: Infinity,
  });

  // Reset city when state changes
  useEffect(() => {
    if (!stateValue) {
      onCityChange('');
    }
  }, [stateValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStateChange(e.target.value);
    onCityChange(''); // Reset city
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCityChange(e.target.value);
  };

  const selectClass =
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="state">State</Label>
        <select
          id="state"
          value={stateValue}
          onChange={handleStateChange}
          disabled={disabled || isStatesLoading}
          className={selectClass}
        >
          <option value="">
            {isStatesLoading ? 'Loading states...' : 'Select state'}
          </option>
          {states.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="city">City</Label>
        <select
          id="city"
          value={cityValue}
          onChange={handleCityChange}
          disabled={disabled || !selectedState || isCitiesLoading}
          className={selectClass}
        >
          <option value="">
            {!selectedState
              ? 'Select state first'
              : isCitiesLoading
              ? 'Loading cities...'
              : 'Select city'}
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}