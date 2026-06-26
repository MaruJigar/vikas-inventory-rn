import { TextStyle } from 'react-native';

import { colors } from '@/theme/colors';

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text } as TextStyle,
  h2: { fontSize: 22, fontWeight: '700', color: colors.text } as TextStyle,
  title: { fontSize: 17, fontWeight: '600', color: colors.text } as TextStyle,
  body: { fontSize: 15, fontWeight: '400', color: colors.text } as TextStyle,
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted } as TextStyle,
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted } as TextStyle,
} as const;
