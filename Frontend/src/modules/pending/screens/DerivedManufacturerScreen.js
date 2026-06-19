import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { useProductList } from '../../product/hooks/useProductQueries';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const DerivedManufacturerScreen = () => {
  const { data: products, isLoading, isError } = useProductList();

  // Derive unique manufacturers from the catalogue
  const manufacturers = useMemo(() => {
    if (!products) return [];
    const uniqueMap = new Map();
    products.forEach(p => {
      const name = p.manufacturerName || 'Unknown Manufacturer';
      if (!uniqueMap.has(name)) {
        uniqueMap.set(name, { id: name, name });
      }
    });
    return Array.from(uniqueMap.values());
  }, [products]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Manufacturers...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load manufacturers.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manufacturers</Text>
        <Text style={styles.headerSubtitle}>Partner Ecosystem</Text>
      </View>
      <FlatList
        data={manufacturers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No manufacturers found in catalogue.</Text>}
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
  headerSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  listContent: { padding: SPACING.md },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white, alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md,
    padding: SPACING.md, ...SHADOWS.sm
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md
  },
  iconText: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: 'bold', color: COLORS.primaryDark },
  cardBody: { flex: 1 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: 'bold', color: COLORS.gray900 },
  emptyText: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING['2xl'] }
});
