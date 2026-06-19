import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, TextInput, RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDebounce } from '../../../utils/useDebounce';
import { useProductList } from '../../product/hooks/useProductQueries';
import { useCartStore } from '../store/useCartStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const ProductCatalogueScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { visitId, shopId } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { 
    data: products, 
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching
  } = useProductList(debouncedSearch);
  
  const { initializeCart, addItem, updateItemQuantity, items, getTotals } = useCartStore();

  useEffect(() => {
    if (visitId && shopId) {
      // Re-initialize only if starting a fresh cart for a new visit
      const state = useCartStore.getState();
      if (state.visitId !== visitId) {
        initializeCart(visitId, shopId);
      }
    }
  }, [visitId, shopId, initializeCart]);

  const allProducts = useMemo(() => {
    if (!products || !products.pages) return [];
    return products.pages.flatMap(page => page.data);
  }, [products]);

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  };

  const totals = getTotals();

  const renderProductItem = ({ item }) => {
    const cartItem = items.find(i => i.productId === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productSku}>{item.sku || 'No SKU'} • {item.unit || 'Unit'}</Text>
          <Text style={styles.productPrice}>₹{Number(item.mrp).toFixed(2)}</Text>
        </View>

        <View style={styles.actionArea}>
          {quantity > 0 ? (
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQuantity(item.id, quantity - 1)}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItemQuantity(item.id, quantity + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item, 1)}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catalogue</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      {isLoading && !allProducts.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : allProducts.length > 0 ? (
        <FlatList
          data={allProducts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ padding: SPACING.md }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      )}

      {totals.totalQuantity > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartItemsText}>{totals.totalQuantity} Items</Text>
            <Text style={styles.cartTotalText}>₹{totals.finalOrderAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.reviewBtn} 
            onPress={() => navigation.navigate('CartReviewScreen')}
          >
            <Text style={styles.reviewBtnText}>Review Order →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, ...SHADOWS.sm, zIndex: 10
  },
  backBtn: { padding: SPACING.sm, marginRight: SPACING.md },
  backBtnText: { fontSize: 24, color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700', color: COLORS.gray900 },
  searchContainer: { padding: SPACING.lg },
  searchInput: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md, fontSize: TYPOGRAPHY.sizes.base, ...SHADOWS.sm, color: COLORS.gray900,
  },
  listContainer: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row', backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
    alignItems: 'center', justifyContent: 'space-between'
  },
  productInfo: { flex: 1, marginRight: SPACING.md },
  productName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  productSku: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  productPrice: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
  actionArea: { width: 100, alignItems: 'flex-end' },
  addBtn: {
    backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary
  },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.sm },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.md },
  qtyBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  qtyBtnText: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.primary },
  qtyText: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900, minWidth: 20, textAlign: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.gray500 },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingBottom: SPACING['2xl'], ...SHADOWS.lg, borderTopWidth: 1, borderTopColor: COLORS.gray200
  },
  cartItemsText: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, fontWeight: '600' },
  cartTotalText: { fontSize: TYPOGRAPHY.sizes.xl, color: COLORS.gray900, fontWeight: '800' },
  reviewBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  reviewBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.base }
});
