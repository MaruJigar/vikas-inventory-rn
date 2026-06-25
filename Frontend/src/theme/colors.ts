export const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export type ColorKey = keyof typeof colors;
