import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen, Button, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import { resolveMediaUrl } from '@/lib/media';
import { useShop, useDeleteShop } from '@/features/shops/hooks';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ShopsScreenProps, MainTabParamList } from '@/navigation/types';

/** Tone for the verification-status pill. */
function statusTone(status: string): 'ok' | 'warn' | 'muted' {
  const s = status.toUpperCase();
  if (s.includes('VERIF') || s === 'APPROVED' || s === 'ACTIVE') return 'ok';
  if (s.includes('PEND')) return 'warn';
  return 'muted';
}

function IconChip({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </View>
  );
}

/** An info row: icon · (label above value) · optional trailing action. */
function InfoRow({
  icon,
  label,
  value,
  actionIcon,
  onPress,
  divider = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  divider?: boolean;
}) {
  const body = (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <IconChip icon={icon} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text
          style={[styles.rowValue, onPress && styles.rowValueLink]}
          numberOfLines={onPress ? 1 : undefined}
        >
          {value}
        </Text>
      </View>
      {onPress && actionIcon ? (
        <Ionicons name={actionIcon} size={18} color={colors.primary} />
      ) : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.rowPressed : undefined)}
    >
      {body}
    </Pressable>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}
function GroupLabel({ children }: { children: string }) {
  return <Text style={styles.groupLabel}>{children}</Text>;
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
      <Screen edges={[]}>
        <EmptyState
          title={t('shops.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const confirmDelete = () =>
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

  const viewOrders = () =>
    navigation
      .getParent<BottomTabNavigationProp<MainTabParamList>>()
      ?.navigate('Orders', {
        screen: 'OrdersList',
        params: { shopId: id, filterLabel: shop.name },
      });

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : t('shops.detail.never');
  const photo = resolveMediaUrl(shop.verification_photo_url);
  const location = [shop.city_name, shop.state_name].filter(Boolean).join(', ');
  const tone = statusTone(shop.verification_status);

  return (
    <Screen edges={['bottom']}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} />
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroMain}>
          <Text style={styles.name}>{shop.name}</Text>
          <View
            style={[
              styles.pill,
              tone === 'ok' && styles.pillOk,
              tone === 'warn' && styles.pillWarn,
            ]}
          >
            <View
              style={[
                styles.pillDot,
                tone === 'ok' && styles.dotOk,
                tone === 'warn' && styles.dotWarn,
              ]}
            />
            <Text
              style={[
                styles.pillText,
                tone === 'ok' && styles.pillTextOk,
                tone === 'warn' && styles.pillTextWarn,
              ]}
            >
              {shop.verification_status}
            </Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.ordersChip, pressed && styles.rowPressed]}
          onPress={viewOrders}
          accessibilityRole="button"
          accessibilityLabel={t('shops.detail.viewOrders')}
        >
          <Ionicons name="receipt-outline" size={16} color={colors.primary} />
          <Text style={styles.ordersChipText}>{t('shops.detail.viewOrders')}</Text>
        </Pressable>
      </View>

      <GroupLabel>{t('shops.detail.contactSection')}</GroupLabel>
      <Group>
        {shop.owner_name ? (
          <InfoRow
            icon="person-outline"
            label={t('shops.detail.owner')}
            value={shop.owner_name}
          />
        ) : null}
        <InfoRow
          icon="call-outline"
          label={t('shops.detail.phone')}
          value={shop.phone}
          actionIcon="call"
          onPress={() => void Linking.openURL(`tel:${shop.phone}`)}
        />
        {shop.gst_number ? (
          <InfoRow
            icon="document-text-outline"
            label={t('shops.detail.gst')}
            value={shop.gst_number}
            divider={false}
          />
        ) : null}
      </Group>

      <GroupLabel>{t('shops.detail.locationSection')}</GroupLabel>
      <Group>
        <InfoRow
          icon="home-outline"
          label={t('shops.detail.address')}
          value={shop.address}
        />
        <InfoRow
          icon="map-outline"
          label={t('shops.detail.location')}
          value={location || '—'}
          divider={!!shop.maps_link}
        />
        {shop.maps_link ? (
          <InfoRow
            icon="navigate-outline"
            label={t('shops.detail.maps')}
            value={t('shops.detail.openMaps')}
            actionIcon="open-outline"
            onPress={() => void Linking.openURL(shop.maps_link as string)}
            divider={false}
          />
        ) : null}
      </Group>

      <GroupLabel>{t('shops.detail.activitySection')}</GroupLabel>
      <Group>
        <InfoRow
          icon="walk-outline"
          label={t('shops.detail.lastVisit')}
          value={fmt(shop.last_visit_at)}
        />
        <InfoRow
          icon="cart-outline"
          label={t('shops.detail.lastOrder')}
          value={fmt(shop.last_order_at)}
          divider={false}
        />
      </Group>

      <View style={styles.actionRow}>
        <Button
          label={t('shops.edit.edit')}
          icon="create-outline"
          onPress={() => navigation.navigate('EditShop', { id })}
          style={styles.flex1}
        />
        <Button
          label={t('shops.detail.delete')}
          variant="danger"
          icon="trash-outline"
          loading={deleteShop.isPending}
          onPress={confirmDelete}
          style={styles.flex1}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    height: 172,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  heroMain: { flex: 1, gap: spacing.sm },
  name: { ...typography.h1 },
  ordersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginTop: spacing.xs,
  },
  ordersChipText: { ...typography.label, color: colors.primary },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  pillOk: { backgroundColor: 'rgba(21,128,61,0.10)' },
  pillWarn: { backgroundColor: 'rgba(180,83,9,0.12)' },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
  },
  dotOk: { backgroundColor: colors.success },
  dotWarn: { backgroundColor: colors.warning },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.2 },
  pillTextOk: { color: colors.success },
  pillTextWarn: { color: colors.warning },

  groupLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  group: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  rowPressed: { opacity: 0.6 },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.4 },
  rowValue: { ...typography.body },
  rowValueLink: { color: colors.primary, fontWeight: '600' },
  chip: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  flex1: { flex: 1 },
});
