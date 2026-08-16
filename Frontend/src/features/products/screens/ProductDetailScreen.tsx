import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Screen, Card, ImageCarousel, Button, QuantityStepper } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrls } from '@/lib/media';
import { useIsWide } from '@/lib/useIsWide';
import { notify } from '@/lib/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useVisitStore } from '@/store/useVisitStore';
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
 * Every field the list carries for a product, plus add-to-cart while a shop
 * visit is running. The list endpoint already returns the full record and there
 * is no `GET /products/:id`, so the product travels as a route param instead of
 * being re-fetched — which also means the cart is the single source of truth
 * for quantity here, not the route param.
 */
export function ProductDetailScreen({
  route,
  navigation,
}: HomeScreenProps<'ProductDetail'>) {
  const { t } = useTranslation();
  const { product } = route.params;
  const isWide = useIsWide();

  // Add-to-cart mirrors ProductCard exactly: only during an active shop visit,
  // and only the distributor's view caps quantity at on-hand stock (a salesman
  // may order beyond it — the backend raises a backorder).
  const isDistributor = useAuthStore((s) => s.user?.role) === 'DISTRIBUTOR_ADMIN';
  const activeVisit = useVisitStore((s) => s.activeVisit);
  const canAdd = !!activeVisit;
  const cartQty = useCartStore((s) => s.items[product.id]?.qty ?? 0);
  const addToCart = useCartStore((s) => s.add);
  const setCartQty = useCartStore((s) => s.setQty);

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

  // null = don't cap (salesman flow). `stock` above stays unconditional — the
  // info row shows what's on hand either way.
  const stockCap = isDistributor ? stock : null;
  const outOfStock = stockCap != null && stockCap < 1;

  // Without a visit there's nothing to add to, so the controls can't show. Say
  // so rather than rendering an empty strip — the list screen carries the same
  // hint, and silently omitting it here reads as a broken screen.
  const addBar = !canAdd ? (
    <View style={[styles.actionBar, styles.hintBar]}>
      <Ionicons
        name="information-circle-outline"
        size={16}
        color={colors.textMuted}
      />
      <Text style={styles.hintText}>{t('products.visitToAdd')}</Text>
    </View>
  ) : (
    <View style={styles.actionBar}>
      {cartQty === 0 ? (
        <Button
          label={outOfStock ? t('products.outOfStock') : t('products.addToCart')}
          icon="add"
          disabled={outOfStock}
          onPress={() => addToCart(product)}
        />
      ) : (
        <View style={styles.actionBarRow}>
          <QuantityStepper
            qty={cartQty}
            max={stockCap ?? undefined}
            onChange={(next) => setCartQty(product, next)}
            onExceedMax={(m) => notify(t('products.maxStock', { count: m }))}
          />
          <Button
            label={t('products.viewCart')}
            variant="secondary"
            style={styles.flex1}
            onPress={() => navigation.navigate('Cart')}
          />
        </View>
      )}
    </View>
  );

  return (
    <Screen edges={[]} floatingAction={addBar}>
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
            label={t('products.details.hsn')}
            value={product.hsn_code}
          />
          <DetailRow
            label={t('products.details.stock')}
            value={
              stock != null
                ? t('products.inStock', { count: stock })
                : product.unit
            }
          />
          {/* No active/inactive row: the lists only ever show active products
           * (see `useProducts`), so the status would always read "Active". */}
          <DetailRow
            label={t('products.details.source')}
            value={
              product.product_source === 'DISTRIBUTOR_CREATED'
                ? t('products.details.sourceDistributor')
                : t('products.details.sourceManufacturer')
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
  // Pinned over the content, so the add control stays reachable however far
  // down the page you've scrolled.
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionBarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hintBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hintText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  flex1: { flex: 1 },
});
