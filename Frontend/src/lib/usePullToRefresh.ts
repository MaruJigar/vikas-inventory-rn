import { useCallback, useState } from 'react';

/**
 * Drives a FlatList RefreshControl from an explicit pull gesture only.
 *
 * Binding `refreshing` directly to react-query's `isRefetching` also shows the
 * spinner for background refetches (e.g. a list invalidated after an update, or
 * a refetch-on-focus) — which leaves a top loader lingering when the user never
 * pulled. This flag is true only for the duration of a user-initiated refresh.
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
