import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { manufacturersApi } from '@/features/manufacturers/api';
import type { SelectOption } from '@/components';

/**
 * Manufacturers as dropdown options for the distributor signup form, from the
 * public `/manufacturers/lookup` route (the guarded list 401s when signed out).
 * Already sorted by name server-side, so no client ordering.
 */
export function useManufacturerOptions() {
  const query = useQuery({
    queryKey: ['manufacturers', 'lookup'],
    queryFn: () => manufacturersApi.lookup(),
    staleTime: 60 * 60 * 1000,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (query.data ?? []).flatMap((mf) => {
        const label = mf.company_name ?? mf.business_name ?? mf.name;
        return mf.id && label ? [{ label, value: mf.id }] : [];
      }),
    [query.data],
  );

  return { options, isLoading: query.isLoading, isError: query.isError };
}

/**
 * An id→name map for manufacturers, cached for an hour. Orders only carry
 * `manufacturer_id`, so this resolves the display name for distributor→
 * manufacturer purchase orders. Returns `.get(id)` → company name (or undefined).
 */
export function useManufacturerNames() {
  const { data } = useQuery({
    queryKey: ['manufacturers', 'all'],
    queryFn: () => manufacturersApi.list(),
    staleTime: 60 * 60 * 1000,
  });

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const mf of data?.data ?? []) {
      const name = mf.company_name ?? mf.business_name ?? mf.name;
      if (mf.id && name) map.set(mf.id, name);
    }
    return map;
  }, [data]);
}
