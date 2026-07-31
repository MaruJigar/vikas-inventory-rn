import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrl } from '@/lib/media';
import { usePOCartStore } from '@/store/usePOCartStore';
import { formatINR, manufacturerName, toNum } from '@/features/products/pricing';
import type { Product } from '@/types/product';

/** Product row for the purchase-order catalog. Bound to the PO cart store and
 * priced at MRP (the backend computes the order gross from MRP × qty). */
export function POProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const qty = usePOCartStore((s) => s.items[product.id]?.qty ?? 0);
  const add = usePOCartStore((s) => s.add);
  const increment = usePOCartStore((s) => s.increment);
  const decrement = usePOCartStore((s) => s.decrement);

  const mrp = toNum(product.mrp);
  const imageUrl = resolveMediaUrl(product.product_image_url);
  const manufacturer = manufacturerName(product);

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
        <Text style={[typography.title, styles.titleText]} numberOfLines={2}>
          {product.name}
        </Text>
        {manufacturer ? (
          <Text style={styles.muted} numberOfLines={1}>
            {manufacturer}
          </Text>
        ) : null}

        <Text style={styles.price}>{formatINR(mrp)}</Text>

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
  body: { flex: 1, gap: spacing.xs },
  titleText: { flex: 1 },
  muted: { ...typography.caption, color: colors.textMuted },
  price: { ...typography.title, color: colors.text },
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
