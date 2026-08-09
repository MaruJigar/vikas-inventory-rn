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
  onOpenDetails,
  onEdit,
  onDelete,
}: {
  product: Product;
  /** Open the read-only full-detail view. */
  onOpenDetails?: () => void;
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

  // On a phone the control gets its own row under the details, right-aligned —
  // the "Add" pill, or the stepper once the product is in the cart. Both size
  // to their content. Tablet/desktop sits it alongside the details instead,
  // where there's room.
  const outOfStock = stock != null && stock < 1;
  const inlineControl = isWide;

  const control = !addable ? null : qty === 0 ? (
    <Pressable
      style={({ pressed }) => [
        styles.addBtn,
        isWide && styles.addBtnWide,
        outOfStock && styles.addBtnDisabled,
        pressed && styles.addBtnPressed,
      ]}
      onPress={handleAdd}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ disabled: outOfStock }}
      accessibilityLabel={t('products.addToCart')}
    >
      <Ionicons name="add" size={isWide ? 18 : 16} color="#FFFFFF" />
      <Text style={styles.addLabel}>{t('products.add')}</Text>
    </Pressable>
  ) : (
    <QuantityStepper
      qty={qty}
      max={stock ?? undefined}
      onChange={(next) => setQty(product, next)}
      onExceedMax={(m) => notify(t('products.maxStock', { count: m }))}
    />
  );

  // Everything that opens the product details. The quantity control is
  // deliberately NOT in here — it's rendered as a sibling of the Pressable
  // below. A TextInput nested inside a Pressable loses the tap to it on
  // Android (focus is handled natively, outside the JS responder system), so
  // tapping the number to type a quantity opened the detail screen instead.
  // The −/+ buttons are Pressables and would have been fine; the typable box
  // is why the whole control has to sit outside.
  const details = (
    <View style={styles.detailsRow}>
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
          {/* No "info" icon: tapping the details area opens the details. */}
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

        <View style={styles.priceGroup}>
          <Text style={styles.price}>{formatINR(price)}</Text>
          {discounted ? <Text style={styles.mrp}>{formatINR(mrp)}</Text> : null}
          {product.unit ? (
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
      </View>
    </View>
  );

  // Tapping the details area opens the detail view. The edit/delete icons sit
  // inside it but are Pressables of their own, so they consume their own taps.
  const tappableDetails = onOpenDetails ? (
    <Pressable
      onPress={onOpenDetails}
      accessibilityRole="button"
      accessibilityLabel={t('products.details.view')}
      style={({ pressed }) => (pressed ? styles.cardPressed : undefined)}
    >
      {details}
    </Pressable>
  ) : (
    details
  );

  return (
    <Card style={styles.card}>
      {inlineControl ? (
        // Tablet/desktop: the control sits beside the details, where there's room.
        <View style={styles.wideRow}>
          <View style={styles.flex1}>{tappableDetails}</View>
          {control}
        </View>
      ) : (
        <>
          {tappableDetails}
          {control ? <View style={styles.controlBar}>{control}</View> : null}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  // A column: the tappable details row, then the control row beneath it. The
  // control must not be a descendant of the details Pressable (see `details`).
  card: { gap: spacing.xs, marginBottom: spacing.md },
  detailsRow: { flexDirection: 'row', gap: spacing.md },
  // Tablet/desktop: details take the room they need, control sits alongside.
  wideRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex1: { flex: 1 },
  cardPressed: { opacity: 0.7 },
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
  // Price + struck-through MRP + unit stay baseline-aligned to each other, and
  // wrap rather than squeeze when all three are long.
  priceGroup: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  price: { ...typography.title, color: colors.text },
  mrp: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  unit: { ...typography.caption, color: colors.textMuted },
  // Compact pill sized to its label — it must never stretch, so the price
  // keeps the rest of the row.
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
  addBtnDisabled: { backgroundColor: colors.textMuted },
  // Phone-only row under the details, right-aligned — the pill and the stepper
  // both size to their content.
  //
  // Indented to start where the text column does. This row is a sibling of the
  // details (the tap fix — see `details`) rather than a child of the text
  // column, so without the padding its divider would run the full card width,
  // under the image. Vertical spacing comes from the card's gap, not a margin.
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: IMAGE_SIZE + spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addLabel: { ...typography.label, color: '#FFFFFF' },
});
