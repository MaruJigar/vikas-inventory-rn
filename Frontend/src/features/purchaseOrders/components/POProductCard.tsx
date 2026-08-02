import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { Card, ImageCarousel, QuantityStepper } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { resolveMediaUrls } from '@/lib/media';
import { useIsWide } from '@/lib/useIsWide';
import { usePOCartStore } from '@/store/usePOCartStore';
import { formatINR, manufacturerName, toNum } from '@/features/products/pricing';
import type { Product } from '@/types/product';

/** Thumbnail edge; also the carousel's page width. */
const IMAGE_SIZE = 96;

/** Product row for the purchase-order catalog. Bound to the PO cart store and
 * priced at MRP (the backend computes the order gross from MRP × qty). */
export function POProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const isWide = useIsWide();
  const qty = usePOCartStore((s) => s.items[product.id]?.qty ?? 0);
  const add = usePOCartStore((s) => s.add);
  const setQty = usePOCartStore((s) => s.setQty);

  const mrp = toNum(product.mrp);
  const imageUrls = resolveMediaUrls(product.product_image_url);
  const manufacturer = manufacturerName(product);

  // Phone: the control gets its own row under the body — compact "Add" pill on
  // the right, full-width stepper once added. Inline beside the price on wide
  // screens (matches ProductCard).
  const inlineControl = isWide;

  const control =
    qty === 0 ? (
      <Pressable
        style={({ pressed }) => [
          styles.addBtn,
          isWide && styles.addBtnWide,
          pressed && styles.addBtnPressed,
        ]}
        onPress={() => add(product)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t('products.addToCart')}
      >
        <Ionicons name="add" size={isWide ? 18 : 16} color="#FFFFFF" />
        <Text style={styles.addLabel}>{t('products.add')}</Text>
      </Pressable>
    ) : (
      <QuantityStepper
        qty={qty}
        fullWidth={!inlineControl}
        onChange={(next) => setQty(product, next)}
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
        <Text style={[typography.title, styles.titleText]} numberOfLines={2}>
          {product.name}
        </Text>
        {manufacturer ? (
          <Text style={styles.muted} numberOfLines={1}>
            {manufacturer}
          </Text>
        ) : null}

        {/* Price and the add control share one row: price left, action right. */}
        <View style={styles.priceRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>{formatINR(mrp)}</Text>
            {product.unit ? (
              <Text style={styles.unit}>/ {product.unit}</Text>
            ) : null}
          </View>

          {inlineControl ? control : null}
        </View>

        {!inlineControl ? (
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

  body: { flex: 1, gap: spacing.xs },
  titleText: { flex: 1 },
  muted: { ...typography.caption, color: colors.textMuted },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  // Price + unit stay baseline-aligned to each other.
  priceGroup: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: { ...typography.title, color: colors.text },
  unit: { ...typography.caption, color: colors.textMuted },
  // Sized to its label so the price keeps the rest of the row.
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    flexGrow: 0,
    flexShrink: 0,
    height: 34,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addBtnWide: { height: 40, minWidth: 104, paddingHorizontal: spacing.lg },
  addBtnPressed: { opacity: 0.85 },
  // Phone-only row under the body: pill right-aligned, stepper stretches.
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addLabel: { ...typography.label, color: '#FFFFFF' },
});
