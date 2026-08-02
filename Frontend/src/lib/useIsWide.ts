import { useWindowDimensions } from 'react-native';

/**
 * Width at which there's room to sit controls beside content rather than
 * stacking them. Phones (portrait ~360–430) fall below; tablets and desktop
 * browsers sit above.
 */
export const WIDE_BREAKPOINT = 600;

/** True on tablet/desktop widths — drives row-vs-stacked card layouts. */
export function useIsWide(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}
