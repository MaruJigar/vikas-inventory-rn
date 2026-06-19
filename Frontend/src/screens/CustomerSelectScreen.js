import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const CustomerCard = ({ customer, onPress, isSelected }) => (
  <TouchableOpacity
    style={[
      styles.customerCard,
      isSelected && styles.customerCardSelected,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.customerCardHeader}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerGst}>GSTIN: {customer.gstin || 'N/A'}</Text>
      </View>
      {isSelected && (
        <View style={styles.selectedCheckmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </View>

    <View style={styles.customerDetails}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Orders</Text>
        <Text style={styles.detailValue}>{customer.totalOrders || '0'}</Text>
      </View>
      <View style={styles.detailItem}>
        <Feather name="map-pin" size={12} color={COLORS.gray400} style={{marginBottom:2}} />
        <Text style={styles.detailValue}>{customer.city}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Phone</Text>
        <Text style={styles.detailValue}>{customer.phone}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const CustomerSelectScreen = ({ navigation }) => {
  const { appState, selectCustomer } = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const filteredCustomers = useMemo(() => {
    if (!searchText) return appState.customers;
    
    return appState.customers.filter(
      customer =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.city.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, appState.customers]);

  const handleSelectCustomer = (customer) => {
    selectCustomer(customer.id);
    navigation.navigate('ProductListing');
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Customer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={COLORS.gray400} style={{marginRight: SPACING.sm}} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or city..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={COLORS.gray400}
          />
          {searchText ? (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Customer List */}
        {filteredCustomers.length > 0 ? (
          <FlatList
            data={filteredCustomers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <CustomerCard
                customer={item}
                onPress={() => handleSelectCustomer(item)}
                isSelected={false}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color={COLORS.gray300} style={{marginBottom:SPACING.md}} />
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        )}
      </ScrollView>


      {/* Add Customer FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => alert('Feature coming soon!')} activeOpacity={0.8}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    paddingHorizontal: SPACING.sm,
  },
  backText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray900,
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  clearButton: {
    padding: SPACING.sm,
  },
  clearText: {
    color: COLORS.gray400,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  customerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  customerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.gray50,
  },
  customerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  customerGst: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  customerCity: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  selectedCheckmark: {
    backgroundColor: COLORS.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  customerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  proceedButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute', bottom: 30, right: SPACING.lg,
    backgroundColor: COLORS.primary, 
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.lg,
  },
  fabText: { color: COLORS.white, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700' },
});
