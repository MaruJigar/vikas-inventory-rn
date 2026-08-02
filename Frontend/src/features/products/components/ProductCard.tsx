import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Card, ImageCarousel, QuantityStepper } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrls } from '@/lib/media';
import { useIsWide } from '@/lib/useIsWide';
import { notify } from '@/lib/dialog';
import { useCartStore } from '@/store/useCartStore';
import {
  availableUnits,
  distributorUnitPrice,
  formatINR,
  manufacturerName,
  toNum,
} from '@/features/products/pricing';
import type { Product } from '@/types/product';

/** Thumbnail edge; also the carousel's page width. */
const IMAGE_SIZE = 96;

export function ProductCard({
  product,
  addable = true,
  enforceStock = true,
  onEdit,
  onDelete,
}: {
  product: Product;
  /** Show the add-to-cart / quantity controls (only during an active visit). */
  addable?: boolean;
  /**
   * Show available-stock and cap quantity to it. Used by the distributor
   * managing their catalog; the salesman ordering flow turns this off (they can
   * order beyond on-hand stock — backorders are handled server-side).
   */
  enforceStock?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const isWide = useIsWide();
  const qty = useCartStore((s) => s.items[product.id]?.qty ?? 0);
  const add = useCartStore((s) => s.add);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const setQty = useCartStore((s) => s.setQty);

  // null = don't track/limit stock (salesman flow) → no stock label, no cap.
  const stock = enforceStock ? availableUnits(product) : null;
  const atStockLimit = stock != null && qty >= stock;

  const handleAdd = () => {
    if (stock != null && stock < 1) return notify(t('products.outOfStock'));
    add(product);
  };
  const handleIncrement = () => {
    if (atStockLimit) return notify(t('products.maxStock', { count: stock }));
    increment(product.id);
  };

  const mrp = toNum(product.mrp);
  const price = distributorUnitPrice(product);
  const discounted = price < mrp;
  const imageUrls = resolveMediaUrls(product.product_image_url);
  const manufacturer = manufacturerName(product);

  // Tablet/desktop widths have room to sit the control beside the price; on a
  // phone it goes full-width under the card body instead.
  const inlineControl = isWide;

  const control = !addable ? null : qty === 0 ? (
    <Pressable
      style={[styles.addBtn, !inlineControl && styles.addBtnFull]}
      onPress={handleAdd}
      accessibilityRole="button"
      accessibilityLabel={t('products.addToCart')}
    >
      <Ionicons name="add" size={18} color="#FFFFFF" />
      <Text style={styles.addLabel}>{t('products.add')}</Text>
    </Pressable>
  ) : (
    <QuantityStepper
      qty={qty}
      max={stock ?? undefined}
      fullWidth={!inlineControl}
      onChange={(next) => setQty(product, next)}
      onExceedMax={(m) => notify(t('products.maxStock', { count: m }))}
    />
  );

  return (
    <Card style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrls.length > 0 ? (
          <ImageCarousel urls={imageUrls} size={IMAGE_SIZE} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[typography.title, styles.titleText]} numberOfLines={2}>
            {product.name}
          </Text>
          {onEdit || onDelete ? (
            <View style={styles.manageRow}>
              {onEdit ? (
                <Pressable onPress={onEdit} hitSlop={8} accessibilityLabel={t('common.submit')}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </Pressable>
              ) : null}
              {onDelete ? (
                <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel={t('common.cancel')}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
        {manufacturer ? (
          <Text style={styles.muted} numberOfLines={1}>
            {manufacturer}
          </Text>
        ) : null}

        {/* Price and the add control share one row: price left, action right. */}
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>{formatINR(price)}</Text>
            {discounted ? (
              <Text style={styles.mrp}>{formatINR(mrp)}</Text>
            ) : null}
            {product.unit ? (
              <Text style={styles.unit}>/ {product.unit}</Text>
            ) : null}
          </View>

          {inlineControl ? control : null}
        </View>

        {stock != null ? (
          <Text style={[styles.stock, stock < 1 && styles.stockOut]}>
            {stock < 1
              ? t('products.outOfStock')
              : t('products.inStock', { count: stock })}
          </Text>
        ) : null}

        {!inlineControl && control ? (
          <View style={styles.controlBar}>{control}</View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  imageWrap: { width: IMAGE_SIZE },
  imagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titleText: { flex: 1 },
  manageRow: { flexDirection: 'row', gap: spacing.md },
  stock: { ...typography.caption, color: colors.textMuted },
  stockOut: { color: colors.danger },
  body: { flex: 1, gap: spacing.xs },
  muted: { ...typography.caption, color: colors.textMuted },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  // Price + struck-through MRP + unit stay baseline-aligned to each other.
  priceGroup: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: { ...typography.title, color: colors.text },
  mrp: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  unit: { ...typography.caption, color: colors.textMuted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    flexShrink: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  addBtnFull: { flex: 1 },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addLabel: { ...typography.label, color: '#FFFFFF' },
});
