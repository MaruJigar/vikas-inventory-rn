import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Button, Card, Input } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import {
  useInventorySettings,
  useUpdateInventorySettings,
} from '@/features/inventory/hooks';

/**
 * The org-level low-stock threshold (`GET`/`PATCH /inventory/settings`).
 *
 * It is stored on the distributor record, not per product, so one value drives
 * every row's `stock_status` — and until it is set, the backend marks NOTHING
 * as low stock and reports a low-stock count of 0. That's why this sits at the
 * top of the list rather than buried in a settings screen.
 */
export function LowStockSettingsCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useInventorySettings();
  const save = useUpdateInventorySettings();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  const current = data?.low_stock_threshold ?? null;

  const startEditing = () => {
    setValue(current == null ? '' : String(current));
    setEditing(true);
  };

  const submit = () => {
    const n = Number(value.trim());
    // The backend validates IsInt + Min(1), so reject the same range here
    // rather than surfacing a 400.
    if (!Number.isInteger(n) || n < 1) {
      notify(t('inventory.lowStock.invalid'));
      return;
    }
    save.mutate(
      { low_stock_threshold: n },
      {
        onSuccess: () => setEditing(false),
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('inventory.lowStock.saveError')),
      },
    );
  };

  const clear = () =>
    confirmAction({
      title: t('inventory.lowStock.clearConfirm'),
      message: t('inventory.lowStock.clearMessage'),
      confirmLabel: t('inventory.lowStock.clear'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: () =>
        // `null` is the only way to unset it — the backend stores
        // `dto.low_stock_threshold || null`, and 0 fails validation first.
        save.mutate(
          { low_stock_threshold: null },
          {
            onSuccess: () => setEditing(false),
            onError: (e) =>
              notify(
                getApiErrorMessage(e, t) || t('inventory.lowStock.saveError'),
              ),
          },
        ),
    });

  if (isLoading) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="trending-down-outline" size={20} color={colors.warning} />
        <View style={styles.headerText}>
          <Text style={typography.title}>{t('inventory.lowStock.title')}</Text>
          <Text style={styles.muted}>
            {current == null
              ? t('inventory.lowStock.unset')
              : t('inventory.lowStock.current', { value: current })}
          </Text>
        </View>
      </View>

      {editing ? (
        <View style={styles.form}>
          <Input
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder={t('inventory.lowStock.placeholder')}
            autoFocus
          />
          <View style={styles.actions}>
            <Button
              label={t('inventory.lowStock.save')}
              loading={save.isPending}
              onPress={submit}
              style={styles.action}
            />
            <Button
              label={t('common.cancel')}
              variant="secondary"
              onPress={() => setEditing(false)}
              style={styles.action}
            />
          </View>
          {current != null ? (
            <Button
              label={t('inventory.lowStock.clear')}
              variant="secondary"
              onPress={clear}
            />
          ) : null}
        </View>
      ) : (
        <Button
          label={
            current == null
              ? t('inventory.lowStock.set')
              : t('inventory.lowStock.change')
          }
          variant="secondary"
          onPress={startEditing}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  muted: { ...typography.caption },
  form: { gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
