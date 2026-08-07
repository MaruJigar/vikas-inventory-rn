import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Input, Select } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useAdjustStock } from '@/features/inventory/hooks';
import {
  MOVEMENT_TYPES,
  isOutwardMovement,
  movementLabel,
  signedDelta,
} from '@/features/inventory/constants';
import type { InventoryItem, MovementType } from '@/types/inventory';

interface AdjustStockFormProps {
  productId: string;
  /**
   * Current available quantity, when known (i.e. the product already has an
   * inventory row). Enables the resulting-stock preview and the "can't remove
   * more than you hold" guard.
   */
  currentQty?: number | null;
  /** Called with the row the backend returns, so the caller can refresh. */
  onSuccess?: (item: InventoryItem) => void;
  onCancel?: () => void;
}

/**
 * The manual stock-adjustment form, shared by the inventory detail screen (an
 * existing row) and the standalone adjust screen (opening stock for a product
 * with no row yet).
 *
 * The user always enters a POSITIVE quantity; the movement type decides the
 * sign of the delta sent to the backend.
 */
export function AdjustStockForm({
  productId,
  currentQty,
  onSuccess,
  onCancel,
}: AdjustStockFormProps) {
  const { t } = useTranslation();
  const adjust = useAdjustStock();

  const hasCurrent = typeof currentQty === 'number';
  const [type, setType] = useState<MovementType>(
    hasCurrent ? 'STOCK_ADDED' : 'OPENING_STOCK',
  );
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();

  const options = useMemo(
    () =>
      MOVEMENT_TYPES.map((value) => ({
        value,
        label: movementLabel(t, value),
      })),
    [t],
  );

  const outward = isOutwardMovement(type);
  const parsed = Math.floor(Number(qty));
  const validQty = Number.isFinite(parsed) && parsed > 0;
  const resulting =
    hasCurrent && validQty ? currentQty + signedDelta(type, parsed) : null;

  const onSubmit = () => {
    if (!validQty) {
      setError(t('inventory.adjust.invalidQty'));
      return;
    }
    if (outward && hasCurrent && parsed > currentQty) {
      setError(t('inventory.adjust.tooMany', { max: currentQty }));
      return;
    }
    setError(undefined);
    adjust.mutate(
      {
        product_id: productId,
        movement_type: type,
        quantity_change: signedDelta(type, parsed),
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: (item) => {
          setQty('');
          setReason('');
          onSuccess?.(item);
        },
        // A 403 here means the product belongs to a manufacturer, not to this
        // distributor — worth saying plainly rather than showing "Forbidden".
        onError: (err) => notify(adjustErrorMessage(err, t)),
      },
    );
  };

  return (
    <View style={styles.wrap}>
      <Select
        label={t('inventory.adjust.type')}
        value={type}
        options={options}
        onChange={(v) => {
          setType(v as MovementType);
          setError(undefined);
        }}
      />

      <Input
        label={
          outward
            ? t('inventory.adjust.qtyRemove')
            : t('inventory.adjust.qtyAdd')
        }
        value={qty}
        onChangeText={(v) => {
          setQty(v);
          setError(undefined);
        }}
        keyboardType="number-pad"
        placeholder="0"
        error={error}
      />

      {resulting !== null ? (
        <Text style={styles.preview}>
          {t('inventory.adjust.preview', {
            from: currentQty,
            to: resulting,
          })}
        </Text>
      ) : null}

      <Input
        label={t('inventory.adjust.reason')}
        value={reason}
        onChangeText={setReason}
        placeholder={t('inventory.adjust.reasonPlaceholder')}
        multiline
        numberOfLines={3}
      />

      <View style={styles.actions}>
        {onCancel ? (
          <Button
            label={t('common.cancel')}
            variant="secondary"
            style={styles.flex1}
            onPress={onCancel}
          />
        ) : null}
        <Button
          label={t('inventory.adjust.submit')}
          style={styles.flex1}
          loading={adjust.isPending}
          disabled={!qty.trim()}
          onPress={onSubmit}
        />
      </View>
    </View>
  );
}

/** 403 from `/inventory/adjust` always means "not your product". */
function adjustErrorMessage(err: unknown, t: ReturnType<typeof useTranslation>['t']): string {
  const isForbidden =
    typeof err === 'object' &&
    err !== null &&
    (err as { response?: { status?: number } }).response?.status === 403;
  return isForbidden
    ? t('inventory.adjust.notOwnProduct')
    : getApiErrorMessage(err, t);
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  preview: {
    ...typography.caption,
    color: colors.text,
    marginTop: -spacing.xs,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  flex1: { flex: 1 },
});
