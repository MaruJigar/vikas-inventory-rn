import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrl } from '@/lib/media';
import { useCartStore } from '@/store/useCartStore';
import { distributorUnitPrice, formatINR, toNum } from '@/features/products/pricing';
import type { Product } from '@/types/product';

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const qty = useCartStore((s) => s.items[product.id]?.qty ?? 0);
  const add = useCartStore((s) => s.add);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

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
          {product.unit ? (
            <Text style={styles.unit}>/ {product.unit}</Text>
          ) : null}
        </View>

        {qty === 0 ? (
          <Pressable
            style={styles.addBtn}
            onPress={() => add(product)}
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
              style={styles.stepBtn}
              onPress={() => increment(product.id)}
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
