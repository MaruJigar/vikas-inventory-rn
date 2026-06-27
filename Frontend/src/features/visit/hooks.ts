import { useMutation } from '@tanstack/react-query';

import { visitApi } from '@/features/visit/api';
import type {
  CheckInPayload,
  EndVisitPayload,
  NoOrderVisitPayload,
  StartVisitPayload,
} from '@/types/visit';

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
