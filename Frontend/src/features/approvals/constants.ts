import type { TFunction } from 'i18next';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import type { ApprovalRequest, ApprovalStatus } from '@/features/approvals/types';

/** Statuses in workflow order — used for the filter chips. */
export const APPROVAL_STATUSES: ApprovalStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
];

export function approvalStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return colors.success;
    case 'REJECTED':
      return colors.danger;
    default:
      return colors.warning; // PENDING_APPROVAL
  }
}

export function approvalStatusLabel(t: TFunction, status: string): string {
  return t(`approvals.status.${status}`, { defaultValue: status });
}

export function approvalTypeLabel(t: TFunction, type: string): string {
  return t(`approvals.type.${type}`, { defaultValue: type });
}

/** Icon per request type (shop vs person). */
export function approvalTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  return type === 'SHOP_APPROVAL' ? 'storefront-outline' : 'person-outline';
}

/** The human subject of a request — the shop or person being approved. */
export function approvalSubject(req: ApprovalRequest): string | undefined {
  return (
    req.shop_name ??
    req.salesman_name ??
    req.distributor_name ??
    req.manufacturer_name ??
    undefined
  );
}

export function isPending(req: ApprovalRequest): boolean {
  return req.status === 'PENDING_APPROVAL';
}
