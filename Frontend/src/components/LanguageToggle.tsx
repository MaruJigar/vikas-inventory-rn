import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { useLanguageStore } from '@/store/useLanguageStore';
import { SUPPORTED_LANGUAGES, AppLanguage } from '@/i18n';

const LABELS: Record<AppLanguage, string> = { en: 'EN', hi: 'हिं' };

/** Compact EN / हिं switch — drop into any screen header. */
export function LanguageToggle() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <View style={styles.row}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const active = lang === language;
        return (
          <Pressable
            key={lang}
            onPress={() => void setLanguage(lang)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {LABELS[lang]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    alignSelf: 'flex-end',
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  pillActive: { backgroundColor: colors.primary },
  label: { ...typography.label, color: colors.textMuted },
  labelActive: { color: '#FFFFFF' },
});
