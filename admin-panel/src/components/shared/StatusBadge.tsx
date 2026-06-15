import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'neutral' | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-50 text-green-700 ring-green-600/20',
  warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
};

/**
 * Reusable status badge for entity approval_status, is_active, verification_status, etc.
 */
export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

/** Quick helper to derive variant from boolean active state */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge
      label={isActive ? 'Active' : 'Inactive'}
      variant={isActive ? 'success' : 'neutral'}
    />
  );
}

/** Quick helper to derive variant from approval status string */
export function ApprovalStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, StatusVariant> = {
    APPROVED: 'success',
    PENDING_APPROVAL: 'warning',
    REJECTED: 'error',
    ACTIVE: 'success',
    INACTIVE: 'neutral',
  };
  return (
    <StatusBadge
      label={status.replace(/_/g, ' ')}
      variant={variantMap[status] ?? 'neutral'}
    />
  );
}
