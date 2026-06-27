import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Card, Button, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import { useShop, useDeleteShop } from '@/features/shops/hooks';
import type { ShopsScreenProps } from '@/navigation/types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ShopDetailScreen({
  route,
  navigation,
}: ShopsScreenProps<'ShopDetail'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { data: shop, isLoading, isError, refetch } = useShop(id);
  const deleteShop = useDeleteShop();

  if (isLoading) return <Spinner />;
  if (isError || !shop) {
    return (
      <Screen>
        <EmptyState
          title={t('shops.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const confirmDelete = () => {
    confirmAction({
      title: t('shops.detail.deleteConfirmTitle'),
      message: t('shops.detail.deleteConfirmMessage'),
      confirmLabel: t('shops.detail.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
      onConfirm: () =>
        deleteShop.mutate(id, {
          onSuccess: () => navigation.goBack(),
          onError: (err) =>
            notify(getApiErrorMessage(err, t) || t('shops.detail.deleteError')),
        }),
    });
  };

  const dash = '—';
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : t('shops.detail.never');

  return (
    <Screen>
      <Text style={[typography.h1, styles.title]}>{shop.name}</Text>

      {shop.verification_photo_url ? (
        <Image
          source={{ uri: shop.verification_photo_url }}
          style={styles.photo}
        />
      ) : null}

      <Card style={styles.card}>
        <Row label={t('shops.detail.owner')} value={shop.owner_name || dash} />
        <Row label={t('shops.detail.phone')} value={shop.phone} />
        <Row label={t('shops.detail.address')} value={shop.address} />
        <Row label={t('shops.detail.city')} value={shop.city || dash} />
        <Row label={t('shops.detail.state')} value={shop.state || dash} />
        <Row label={t('shops.detail.gst')} value={shop.gst_number || dash} />
        <Row
          label={t('shops.detail.status')}
          value={shop.verification_status}
        />
        <Row
          label={t('shops.detail.lastVisit')}
          value={fmt(shop.last_visit_at)}
        />
        <Row
          label={t('shops.detail.lastOrder')}
          value={fmt(shop.last_order_at)}
        />
      </Card>

      <Button
        label={t('shops.detail.delete')}
        variant="danger"
        loading={deleteShop.isPending}
        onPress={confirmDelete}
        style={styles.delete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  card: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  rowLabel: { ...typography.label },
  rowValue: { ...typography.body, flexShrink: 1, textAlign: 'right' },
  delete: { marginTop: spacing.xl },
});
