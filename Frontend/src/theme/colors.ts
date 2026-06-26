/**
 * Classy monochrome palette — black & white with neutral greys.
 * Semantic colors (success/warning/danger) are kept restrained but visible,
 * since a purely black-and-white UI can't signal state otherwise.
 */
export const colors = {
  primary: '#111111', // near-black — buttons, active states, accents
  primaryDark: '#000000',
  background: '#FFFFFF',
  surface: '#F5F5F5', // light grey cards / inputs
  border: '#E5E5E5',
  text: '#111111',
  textMuted: '#737373', // neutral grey
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
} as const;

export type ColorKey = keyof typeof colors;
