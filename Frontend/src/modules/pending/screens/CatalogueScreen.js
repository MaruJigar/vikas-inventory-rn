import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { useProductList } from '../../product/hooks/useProductQueries';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const CatalogueScreen = () => {
  const { data: products, isLoading, isError } = useProductList();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Catalogue...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load catalogue. Please try again later.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.emojiIcon}>📦</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.brandName}>{item.manufacturerName || 'Generic Brand'}</Text>
        <Text style={styles.price}>₹{item.base_price}</Text>
        {/* Note: Inventory/Stock restrictions applied - stock count is explicitly hidden from pending users */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Catalogue</Text>
        <Text style={styles.headerSubtitle}>Read-only Preview</Text>
      </View>
      <FlatList
        data={products || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No products available.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.gray600, fontSize: TYPOGRAPHY.sizes.sm },
  errorText: { color: COLORS.danger, fontSize: TYPOGRAPHY.sizes.base },
  header: { padding: SPACING.xl, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: 'bold', color: COLORS.gray900 },
  headerSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.warningDark, fontWeight: '600', marginTop: 4 },
  listContent: { padding: SPACING.md },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md,
    padding: SPACING.md, ...SHADOWS.sm
  },
  imagePlaceholder: {
    width: 70, height: 70, backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.md
  },
  emojiIcon: { fontSize: 32 },
  cardBody: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: 'bold', color: COLORS.gray900, marginBottom: 4 },
  brandName: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginBottom: 8 },
  price: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.primary },
  emptyText: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING['2xl'] }
});
