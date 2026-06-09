import React, { useContext, useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Animated, Platform, StatusBar, KeyboardAvoidingView
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';



const ProductListItem = ({ product, cartItem, maxDiscount, onUpdateQty, onUpdatePrice }) => {
  const qty = cartItem?.quantity || 0;
  const appliedPrice = cartItem?.appliedPrice || product.price;
  
  // Use a local string buffer so typing is seamless and doesn't freeze
  const [priceText, setPriceText] = useState(String(appliedPrice));
  
  // Sync local text if external price changes (like cart resets)
  React.useEffect(() => {
    setPriceText(String(appliedPrice));
  }, [appliedPrice]);

  const isDiscounted = appliedPrice < product.price;
  const discountPercent = ((product.price - appliedPrice) / product.price * 100).toFixed(0);
  const hasAdded = qty > 0;

  // Animation scale for the "Add" click
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerAnim = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.card, hasAdded && styles.cardActive, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.cardMain}>
        {/* Visual Icon Column */}
        <View style={styles.visualCol}>
          <View style={[styles.iconCircle, hasAdded && styles.iconCircleActive]}>
            <Feather name="box" size={24} color={hasAdded ? '#4F46E5' : '#94A3B8'} />
          </View>
          {isDiscounted && (
            <View style={styles.discountBadgeSmall}>
              <Text style={styles.discountBadgeTxt}>-{discountPercent}%</Text>
            </View>
          )}
        </View>

        {/* Content Details Column */}
        <View style={styles.detailsCol}>
          <Text style={styles.prodName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.prodMeta}>{product.sku} · {product.unit}</Text>
          
          {/* Smart Price Inline Editor */}
          <View style={styles.priceFlexRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <TextInput
                style={[styles.priceEntry, isDiscounted && styles.priceEntryDiscounted]}
                value={priceText}
                onChangeText={setPriceText}
                onEndEditing={() => {
                  let numeric = parseFloat(priceText) || product.price;
                  const minPrice = product.price * (1 - maxDiscount / 100);
                  // Force clamp to legal values ON BLUR only
                  if (numeric < minPrice) numeric = minPrice;
                  if (numeric > product.price) numeric = product.price;
                  
                  setPriceText(String(numeric));
                  onUpdatePrice(product.id, numeric);
                }}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
            {isDiscounted && (
              <Text style={styles.mrpStrikethrough}>₹{product.price}</Text>
            )}
          </View>
        </View>

        {/* Interaction Column */}
        <View style={styles.actionCol}>
          {!hasAdded ? (
            <TouchableOpacity 
              style={styles.addInitialBtn} 
              onPress={() => {
                triggerAnim();
                onUpdateQty(product, 1, appliedPrice);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.addInitialTxt}>ADD</Text>
              <Text style={styles.addPlusIcon}>+</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterRow}>
              <TouchableOpacity 
                style={styles.countBtn} 
                onPress={() => onUpdateQty(product, qty - 1, appliedPrice)}
              >
                <Text style={styles.countBtnSign}>−</Text>
              </TouchableOpacity>
              
              <View style={styles.countEntryBox}>
                 <TextInput
                    style={styles.countNumber}
                    value={String(qty)}
                    onChangeText={(v) => onUpdateQty(product, parseInt(v) || 0, appliedPrice)}
                    keyboardType="number-pad"
                    selectTextOnFocus
                 />
              </View>

              <TouchableOpacity 
                style={styles.countBtn} 
                onPress={() => onUpdateQty(product, qty + 1, appliedPrice)}
              >
                <Text style={styles.countBtnSign}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {hasAdded && (
        <View style={styles.lineTotalRibbon}>
          <Text style={styles.lineTotalLabel}>Line Total:</Text>
          <Text style={styles.lineTotalVal}>₹{(qty * appliedPrice).toLocaleString('en-IN')}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export const ProductListingScreen = ({ navigation }) => {
  const { appState, addToCart, updateCartQuantity, updateCartPrice } = useContext(AppContext);
  const [search, setSearch] = useState('');
  // Track prices that aren't in cart yet so we preserve edits pre-add
  const [preCartPrices, setPreCartPrices] = useState({});

  try {
    const filtered = useMemo(() => {
      return appState.products.filter(p => {
        if (!p.inStock) return false;
        return p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
      });
    }, [appState.products, search]);

    const cartSummary = useMemo(() => {
      const count = appState.cart.reduce((sum, i) => sum + i.quantity, 0);
      const total = appState.cart.reduce((sum, i) => sum + (i.appliedPrice || i.price) * i.quantity, 0);
      return { count, total };
    }, [appState.cart]);

    // HIGH PERFORMANCE LOOKUP: Construct hashmap to make renderItem lookup O(1) instead of O(N)
    const cartMap = useMemo(() => {
      return appState.cart.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
    }, [appState.cart]);

    const handleQty = useCallback((prod, newQty, currentApplied) => {
      const exist = cartMap[prod.id];
      const priceToUse = currentApplied;
      if (newQty <= 0) {
        updateCartQuantity(prod.id, 0);
      } else {
        if (exist) updateCartQuantity(prod.id, newQty);
        else addToCart({ ...prod, appliedPrice: priceToUse }, newQty);
      }
    }, [cartMap, addToCart, updateCartQuantity]);

    const handlePrice = useCallback((id, p) => {
      const inCart = !!cartMap[id];
      if (inCart) {
        updateCartPrice(id, p);
      } else {
        // Store in local transient hash map for later inclusion upon 'ADD' click
        setPreCartPrices(prev => ({ ...prev, [id]: p }));
      }
    }, [cartMap, updateCartPrice]);

    return (
      <SafeAreaView style={styles.wrapper}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Compact Sleek Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hdrBack}>
            <Feather name="arrow-left" size={20} color="#334155" />
          </TouchableOpacity>
          <View style={styles.hdrInfo}>
            <Text style={styles.hdrSub}>Ordering for:</Text>
            <Text style={styles.hdrTitle} numberOfLines={1}>
              {appState.selectedCustomer?.name || 'Unknown Customer'}
            </Text>
          </View>
        </View>

        {/* Rich Search Box */}
        <View style={styles.searchStrip}>
          <View style={styles.searchPlate}>
            <Feather name="search" size={16} color="#64748B" style={{marginRight: SPACING.xs}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search item or SKU..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>
        </View>



        {/* Streamlined Flat Product Catalog */}
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.catalogList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cartItem = cartMap[item.id];
            // Precedence: Cart Item Applied Price -> Transcient Pre-Cart Price -> Master Product Price
            const activeDisplayPrice = cartItem?.appliedPrice || preCartPrices[item.id] || item.price;
            
            // Re-inject transient appliedPrice into Product for correct default math
            const productWithApplied = { ...item, price: activeDisplayPrice }; 
            // Wait, passing directly via customized item instead of mutating root
            const effectiveProduct = { ...item, appliedPrice: activeDisplayPrice };

            return (
              <ProductListItem
                product={effectiveProduct}
                cartItem={cartItem}
                maxDiscount={15}
                onUpdateQty={handleQty}
                onUpdatePrice={handlePrice}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyArea}>
              <Feather name="package" size={48} color={COLORS.gray300} style={{marginBottom: SPACING.md}} />
              <Text style={styles.emptyTxt}>No matching products available</Text>
            </View>
          }
        />

        {/* Sticky Action Bar - Elevating to Order Review */}
        {cartSummary.count > 0 && (
          <View style={styles.stickyTray}>
            <View style={styles.trayStats}>
              <View style={styles.trayQtyBadge}>
                <Text style={styles.trayQtyTxt}>{cartSummary.count}</Text>
              </View>
              <View>
                <Text style={styles.trayTotal}>₹{cartSummary.total.toLocaleString('en-IN')}</Text>
                <Text style={styles.trayTag}>Subtotal Est.</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.trayAction}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('OrderConfirmation')}
            >
              <Text style={styles.trayActionTxt}>Review Order</Text>
              <Text style={styles.trayArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  } catch (err) {
    console.error(err);
    return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Load error.</Text></View>;
  }
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // Header Architecture
  headerBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.sm : SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  hdrBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  hdrBackTxt: { fontSize: 22, color: '#334155', fontWeight: '600' },
  hdrInfo: { flex: 1, marginLeft: SPACING.md },
  hdrSub: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  hdrTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },

  // Search architecture
  searchStrip: { backgroundColor: '#FFFFFF', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: SPACING.md },
  searchPlate: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 12,
    paddingHorizontal: SPACING.md, height: 44
  },
  searchGlass: { fontSize: 16, marginRight: SPACING.xs },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', height: '100%' },

  // Category Tabs
  catStrip: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  catScroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.xs },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: 'transparent' },
  catPillActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  catPillTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  catPillTxtActive: { color: '#4F46E5' },

  // Product Listing List
  catalogList: { padding: SPACING.md, paddingBottom: 140 },
  emptyArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyTxt: { fontSize: 15, color: '#64748B', fontWeight: '500' },

  // MODERN PRODUCT CARD
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginBottom: SPACING.md, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  cardActive: {
    borderColor: '#818CF8',
    backgroundColor: '#FAFAFF',
    borderWidth: 1.5,
  },
  cardMain: { flexDirection: 'row', padding: SPACING.md, alignItems: 'center' },

  // Left visual
  visualCol: { width: 56, alignItems: 'center', position: 'relative' },
  iconCircle: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center'
  },
  iconCircleActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  iconTxt: { fontSize: 24 },
  discountBadgeSmall: { 
    position: 'absolute', bottom: -4,
    backgroundColor: '#DC2626', borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  discountBadgeTxt: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },

  // Mid details
  detailsCol: { flex: 1, paddingHorizontal: SPACING.md },
  prodName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  prodMeta: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  
  priceFlexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  priceSymbol: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  priceEntry: { fontSize: 14, fontWeight: '700', color: '#1E293B', minWidth: 45, padding: 0, margin: 0 },
  priceEntryDiscounted: { color: '#D97706' },
  mrpStrikethrough: { fontSize: 12, textDecorationLine: 'line-through', color: '#94A3B8' },

  // Right actions
  actionCol: { width: 90, alignItems: 'flex-end' },
  
  // The iconic e-com initial 'ADD' button
  addInitialBtn: {
    width: 75, height: 34, borderRadius: 8, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#4F46E5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1,
  },
  addInitialTxt: { color: '#4F46E5', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  addPlusIcon: { color: '#4F46E5', fontSize: 12, fontWeight: '800', position: 'absolute', right: 6, top: 2 },

  // Counter when added
  counterRow: {
    width: 90, height: 34, borderRadius: 8,
    backgroundColor: '#4F46E5',
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden'
  },
  countBtn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  countBtnSign: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  countEntryBox: { 
    width: 30, height: '100%', 
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center' 
  },
  countNumber: { 
    fontSize: 14, fontWeight: '800', color: '#4F46E5', 
    textAlign: 'center', width: '100%', padding: 0 
  },

  // Bottom line total indicator
  lineTotalRibbon: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F3FF', paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: '#E0E7FF'
  },
  lineTotalLabel: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
  lineTotalVal: { fontSize: 13, color: '#4338CA', fontWeight: '800' },

  // FLOATING STICKY SUMMARY BAR
  stickyTray: {
    position: 'absolute', bottom: SPACING.xl, left: SPACING.md, right: SPACING.md,
    backgroundColor: '#1E293B', borderRadius: 16,
    padding: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  trayStats: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trayQtyBadge: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  trayQtyTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  trayTotal: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  trayTag: { color: '#94A3B8', fontSize: 11, fontWeight: '500', marginTop: -2 },
  
  trayAction: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, height: 44, borderRadius: 10,
  },
  trayActionTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginRight: 6 },
  trayArrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
