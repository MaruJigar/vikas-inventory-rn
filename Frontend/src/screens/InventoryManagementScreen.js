import React, { useContext, useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Alert, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const ProductRow = ({ product, onUpdateProduct }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    price: String(product.price),
    maxDiscount: String(product.maxDiscountPercent),
    stock: String(product.stock)
  });

  const stockStatus = product.stock === 0 ? 'out' : product.stock < 50 ? 'low' : 'ok';
  const stockColors = {
    out: { color: COLORS.danger, bg: COLORS.dangerLight, label: 'Out of Stock' },
    low: { color: COLORS.warning, bg: COLORS.warningLight, label: 'Low Stock' },
    ok: { color: COLORS.success, bg: COLORS.successLight, label: 'In Stock' },
  };
  const sc = stockColors[stockStatus];

  const handleSave = () => {
    onUpdateProduct(product.id, {
      price: parseFloat(form.price) || product.price,
      maxDiscountPercent: parseFloat(form.maxDiscount) || product.maxDiscountPercent,
      stock: parseInt(form.stock) || 0,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      price: String(product.price),
      maxDiscount: String(product.maxDiscountPercent),
      stock: String(product.stock)
    });
    setEditing(false);
  };

  return (
    <View style={styles.productRow}>
      <View style={styles.productTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productMeta}>{product.sku} · HSN {product.hsnCode} · GST {product.gstRate}%</Text>
        </View>
        <View style={[styles.stockBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.stockBadgeText, { color: sc.color }]}>{sc.label}</Text>
        </View>
      </View>

      <View style={styles.productBottom}>
        {editing ? (
          <>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Price</Text>
              <TextInput 
                style={styles.editInput}
                value={form.price}
                onChangeText={(t)=>setForm({...form, price:t})}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Max%</Text>
              <TextInput 
                style={styles.editInput}
                value={form.maxDiscount}
                onChangeText={(t)=>setForm({...form, maxDiscount:t})}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Stock</Text>
              <TextInput 
                style={styles.editInput}
                value={form.stock}
                onChangeText={(t)=>setForm({...form, stock:t})}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.actionBlock}>
               <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>✓</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>✕</Text>
               </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>₹{product.price}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Max Disc.</Text>
              <Text style={styles.infoValue}>{product.maxDiscountPercent}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Stock</Text>
              <Text style={[styles.infoValue, { color: sc.color }]}>
                {product.stock} {product.unit}
              </Text>
            </View>
            <TouchableOpacity style={styles.masterEditBtn} onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export const InventoryManagementScreen = ({ navigation }) => {
  const { appState, updateProduct } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out

  const filteredProducts = useMemo(() => {
    let products = appState.products;

    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter === 'low') products = products.filter(p => p.stock > 0 && p.stock < 50);
    if (filter === 'out') products = products.filter(p => p.stock === 0);

    return products;
  }, [appState.products, search, filter]);

  const stats = useMemo(() => ({
    total: appState.products.length,
    low: appState.products.filter(p => p.stock > 0 && p.stock < 50).length,
    out: appState.products.filter(p => p.stock === 0).length,
  }), [appState.products]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={[styles.statChip, filter === 'all' && styles.statChipActive]} onPress={() => setFilter('all')}>
          <Feather name="box" size={18} color={filter === 'all' ? '#FFF' : COLORS.gray400} style={{marginBottom:4}} />
          <Text style={[styles.statNum, filter === 'all' && styles.statNumActive]}>{stats.total}</Text>
          <Text style={[styles.statLabel, filter === 'all' && styles.statLabelActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statChip, filter === 'low' && styles.statChipWarn]} onPress={() => setFilter('low')}>
          <Feather name="alert-circle" size={18} color={COLORS.warning} style={{marginBottom:4}} />
          <Text style={[styles.statNum, filter === 'low' && { color: COLORS.warning }]}>{stats.low}</Text>
          <Text style={[styles.statLabel, filter === 'low' && { color: COLORS.warning }]}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statChip, filter === 'out' && styles.statChipDanger]} onPress={() => setFilter('out')}>
          <Feather name="slash" size={18} color={COLORS.danger} style={{marginBottom:4}} />
          <Text style={[styles.statNum, filter === 'out' && { color: COLORS.danger }]}>{stats.out}</Text>
          <Text style={[styles.statLabel, filter === 'out' && { color: COLORS.danger }]}>Out</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={COLORS.gray400} style={{marginRight: SPACING.sm, marginTop: Platform.OS === 'web' ? 1 : 0}} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or SKU..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductRow product={item} onUpdateProduct={updateProduct} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  statChip: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.white, ...SHADOWS.sm,
  },
  statChipActive: { backgroundColor: COLORS.primary },
  statChipWarn: { backgroundColor: COLORS.warningLight },
  statChipDanger: { backgroundColor: COLORS.dangerLight },
  statNum: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.gray900 },
  statNumActive: { color: COLORS.white },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, fontWeight: '500', marginTop: 2 },
  statLabelActive: { color: 'rgba(255,255,255,0.8)' },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, ...SHADOWS.sm,
  },
  searchIcon: { fontSize: 14, marginRight: SPACING.sm },
  searchInput: { flex: 1, paddingVertical: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray900 },

  list: { padding: SPACING.lg },

  // Product Row
  productRow: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  productTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  productName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900 },
  productMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  stockBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm, height: 20, borderRadius: BORDER_RADIUS.full },
  stockBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', lineHeight: Platform.OS === 'web' ? 12 : undefined },

  productBottom: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundAlt,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
  },
  infoCol: { flex: 1 },
  infoDivider: { width: 1, height: 30, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: SPACING.xs },
  infoValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },

  masterEditBtn: { paddingLeft: SPACING.sm, alignSelf:'center' },
  actionBlock: { flexDirection: 'row', gap: 6, marginLeft: 6 },
  editInput: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 4, paddingVertical: 2, fontSize: 13,
    fontWeight: '700', borderWidth: 1, borderColor: COLORS.primary,
    color: COLORS.gray900, height: 26, width: '90%'
  },
  saveBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  cancelBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.gray400, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray500, marginTop: SPACING.md },
});
