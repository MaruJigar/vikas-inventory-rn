import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, ImageCarousel } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrls } from '@/lib/media';
import { useIsWide } from '@/lib/useIsWide';
import {
  availableUnits,
  distributorUnitPrice,
  formatINR,
  manufacturerName,
  toNum,
} from '@/features/products/pricing';
import type { HomeScreenProps } from '@/navigation/types';

/** A label/value row; skipped entirely when there's nothing to show. */
function DetailRow({
  label,
  value,
  divider = true,
}: {
  label: string;
  value?: string | null;
  divider?: boolean;
}) {
  if (!value) return null;
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/**
 * Read-only view of every field the list carries for a product. The list
 * endpoint already returns the full record and there is no `GET /products/:id`,
 * so the product travels as a route param instead of being re-fetched.
 */
export function ProductDetailScreen({
  route,
}: HomeScreenProps<'ProductDetail'>) {
  const { t } = useTranslation();
  const { product } = route.params;
  const isWide = useIsWide();

  const mrp = toNum(product.mrp);
  const price = distributorUnitPrice(product);
  const discounted = price < mrp;
  const distributorPct = toNum(product.distributor_discount_percent);
  const specialPct = toNum(product.special_discount_percent);
  const gstPct = toNum(product.gst_percent);
  const stock = availableUnits(product);
  const imageUrls = resolveMediaUrls(product.product_image_url);
  const manufacturer = manufacturerName(product);
  const imageSize = isWide ? 320 : 220;

  return (
    <Screen edges={[]}>
      <View style={styles.imageWrap}>
        {imageUrls.length > 0 ? (
          <ImageCarousel urls={imageUrls} size={imageSize} />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { width: imageSize, height: imageSize },
            ]}
          >
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
          </View>
        )}
      </View>

      <Text style={[typography.h1, styles.name]}>{product.name}</Text>
      {manufacturer ? (
        <Text style={styles.muted}>{manufacturer}</Text>
      ) : null}

      <Card style={styles.card}>
        <View style={styles.priceGroup}>
          <Text style={styles.price}>{formatINR(price)}</Text>
          {discounted ? <Text style={styles.mrp}>{formatINR(mrp)}</Text> : null}
        </View>
        <Text style={styles.muted}>{t('products.details.priceNote')}</Text>

        <View style={styles.rows}>
          <DetailRow label={t('products.details.mrp')} value={formatINR(mrp)} />
          {distributorPct > 0 ? (
            <DetailRow
              label={t('products.details.distributorDiscount')}
              value={`${distributorPct}%`}
            />
          ) : null}
          {specialPct > 0 ? (
            <DetailRow
              label={t('products.details.specialDiscount')}
              value={`${specialPct}%`}
            />
          ) : null}
          <DetailRow
            label={t('products.details.gst')}
            value={`${gstPct}%`}
            divider={false}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('products.details.sectionInfo')}
        </Text>
        <View style={styles.rows}>
          <DetailRow
            label={t('products.details.category')}
            value={product.category?.name}
          />
          <DetailRow label={t('products.details.sku')} value={product.sku} />
          <DetailRow
            label={t('products.details.stock')}
            value={
              stock != null
                ? t('products.inStock', { count: stock })
                : product.unit
            }
          />
          <DetailRow
            label={t('products.details.source')}
            value={
              product.product_source === 'DISTRIBUTOR_CREATED'
                ? t('products.details.sourceDistributor')
                : t('products.details.sourceManufacturer')
            }
          />
          <DetailRow
            label={t('products.details.status')}
            value={
              product.is_active
                ? t('products.details.active')
                : t('products.details.inactive')
            }
            divider={false}
          />
        </View>
      </Card>

      {product.description ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t('products.details.description')}
          </Text>
          <Text style={styles.description}>{product.description}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageWrap: { alignItems: 'center', marginTop: spacing.md },
  imagePlaceholder: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginTop: spacing.lg },
  muted: { ...typography.caption, color: colors.textMuted },
  card: { marginTop: spacing.lg, gap: spacing.xs },
  sectionTitle: { ...typography.title, marginBottom: spacing.xs },
  priceGroup: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  price: { ...typography.h1, color: colors.text },
  mrp: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  rows: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { ...typography.body, color: colors.textMuted, flexShrink: 1 },
  rowValue: { ...typography.body, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  description: { ...typography.body, color: colors.text },
});
