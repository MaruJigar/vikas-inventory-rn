import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { manufacturersApi } from '@/features/manufacturers/api';
import type { SelectOption } from '@/components';

/**
 * Manufacturers as dropdown options, for the distributor signup form.
 *
 * NOTE: `GET /manufacturers` sits behind `JwtAuthGuard`, so this 401s for a
 * signed-out applicant — the screen surfaces that as a load error. It works
 * once the backend exposes the list publicly; nothing else has to change.
 */
export function useManufacturerOptions() {
  const query = useQuery({
    queryKey: ['manufacturers', 'options'],
    queryFn: () => manufacturersApi.list(),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const options = useMemo<SelectOption[]>(
    () =>
      (query.data?.data ?? []).flatMap((mf) => {
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
