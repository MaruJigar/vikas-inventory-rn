import { useMutation, useQuery } from '@tanstack/react-query';

import { visitApi } from '@/features/visit/api';
import { shopsApi } from '@/features/shops/api';
import { useVisitStore } from '@/store/useVisitStore';
import type {
  CheckInPayload,
  EndVisitPayload,
  NoOrderVisitPayload,
  StartVisitPayload,
} from '@/types/visit';

/**
 * Sync the local visit cache with the backend's source of truth — needed
 * because logout clears the cache, but the backend's ACTIVE working day / visit
 * persist. Without this, a re-login shows "Check In" while the server still has
 * an open check-in (→ 403 on a second check-in).
 */
export function useVisitSession(enabled: boolean) {
  const setWorkingDay = useVisitStore((s) => s.setWorkingDay);
  const setActiveVisit = useVisitStore((s) => s.setActiveVisit);
  const reset = useVisitStore((s) => s.reset);

  return useQuery({
    queryKey: ['visit', 'session'],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const days = await visitApi.history();
      const activeWd = days.find((d) => d.status === 'ACTIVE') ?? null;

      if (!activeWd) {
        reset();
        return { checkedIn: false };
      }

      setWorkingDay({ id: activeWd.id, checkedInAt: activeWd.check_in_at });

      const visit = await visitApi.activeVisit();
      if (visit) {
        let shopName = '';
        try {
          shopName = (await shopsApi.getById(visit.shop_id)).name;
        } catch {
          // Banner still works without the name.
        }
        setActiveVisit({
          visitId: visit.id,
          shopId: visit.shop_id,
          shopName,
        });
      } else {
        setActiveVisit(null);
      }

      return { checkedIn: true };
    },
  });
}

export function useCheckIn() {
  return useMutation({
    mutationFn: (payload: CheckInPayload) => visitApi.checkIn(payload),
  });
}

export function useCheckOut() {
  return useMutation({
    mutationFn: (payload: CheckInPayload) => visitApi.checkOut(payload),
  });
}

export function useStartVisit() {
  return useMutation({
    mutationFn: (payload: StartVisitPayload) => visitApi.startVisit(payload),
  });
}

export function useEndVisit() {
  return useMutation({
    mutationFn: (payload: EndVisitPayload) => visitApi.endVisit(payload),
  });
}

export function useNoOrderVisit() {
  return useMutation({
    mutationFn: (payload: NoOrderVisitPayload) => visitApi.noOrderVisit(payload),
  });
}
