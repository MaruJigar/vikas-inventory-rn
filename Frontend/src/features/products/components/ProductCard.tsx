import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrl } from '@/lib/media';
import { notify } from '@/lib/dialog';
import { useCartStore } from '@/store/useCartStore';
import {
  availableUnits,
  distributorUnitPrice,
  formatINR,
  toNum,
} from '@/features/products/pricing';
import type { Product } from '@/types/product';

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
  const qty = useCartStore((s) => s.items[product.id]?.qty ?? 0);
  const add = useCartStore((s) => s.add);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

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
  const imageUrl = resolveMediaUrl(product.product_image_url);
  const manufacturer =
    product.manufacturer?.business_name ??
    product.manufacturer?.name ??
    product.external_manufacturer_name ??
    undefined;

  return (
    <Card style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
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

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatINR(price)}</Text>
          {discounted ? (
            <Text style={styles.mrp}>{formatINR(mrp)}</Text>
          ) : null}
          {enforceStock && product.unit && stock == null ? (
            <Text style={styles.unit}>/ {product.unit}</Text>
          ) : null}
        </View>

        {stock != null ? (
          <Text style={[styles.stock, stock < 1 && styles.stockOut]}>
            {stock < 1
              ? t('products.outOfStock')
              : t('products.inStock', { count: stock })}
          </Text>
        ) : null}

        {!addable ? null : qty === 0 ? (
          <Pressable
            style={styles.addBtn}
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel={t('products.addToCart')}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addLabel}>{t('products.add')}</Text>
          </Pressable>
        ) : (
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => decrement(product.id)}
              accessibilityLabel={t('products.decrease')}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable
              style={[styles.stepBtn, atStockLimit && styles.stepBtnDisabled]}
              onPress={handleIncrement}
              accessibilityLabel={t('products.increase')}
            >
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titleText: { flex: 1 },
  manageRow: { flexDirection: 'row', gap: spacing.md },
  stock: { ...typography.caption, color: colors.textMuted },
  stockOut: { color: colors.danger },
  stepBtnDisabled: { opacity: 0.4 },
  body: { flex: 1, gap: spacing.xs },
  muted: { ...typography.caption, color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
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
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  addLabel: { ...typography.label, color: '#FFFFFF' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { ...typography.title, minWidth: 20, textAlign: 'center' },
});
