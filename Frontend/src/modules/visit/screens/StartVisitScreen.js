import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, Alert
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { withLocationRecovery } from '../../../utils/locationUtils';
import { useNavigation } from '@react-navigation/native';
import { useShopList } from '../../shop/hooks/useShopQueries';
import { useVisitMutations } from '../hooks/useVisitMutations';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../styles/colors';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppLoadingSkeleton } from '../../../components/ui/AppLoadingSkeleton';
import { AppEmptyState } from '../../../components/ui/AppEmptyState';

export const StartVisitScreen = () => {
  const navigation = useNavigation();
  const { data: shops, isLoading: isShopsLoading } = useShopList();
  const { startVisitMutation } = useVisitMutations();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShops = React.useMemo(() => {
    if (!shops) return [];
    if (!searchQuery) return shops;
    return shops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery));
  }, [shops, searchQuery]);

  const handleStartVisit = async (shopId) => {
    await withLocationRecovery(async (location) => {
      let uuid = '';
      if (Crypto && Crypto.randomUUID) {
        uuid = Crypto.randomUUID();
      } else {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Date.now() + Math.random()*16)%16 | 0;
          return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
        });
      }

      startVisitMutation.mutate({
        shopId,
        latitude: location.latitude,
        longitude: location.longitude,
        idempotencyKey: `startvisit_${uuid}`,
      }, {
        onSuccess: () => {
          navigation.replace('ActiveVisitScreen');
        }
      });
    });
  };

  const renderShopItem = ({ item }) => (
    <AppCard 
      style={styles.shopCard} 
      onPress={() => handleStartVisit(item.id)}
      variant="elevated"
    >
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{item.name}</Text>
        <Text style={styles.shopDetails}>{item.owner_name} • {item.phone}</Text>
        <Text style={styles.shopAddress} numberOfLines={1}>{item.address}, {item.city}</Text>
      </View>
      <View style={styles.actionArea}>
        <Text style={styles.actionText}>Start</Text>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Select Shop" onBack={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <AppInput
          icon="search"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isShopsLoading ? (
        <View style={styles.loadingContainer}>
          <AppLoadingSkeleton type="list" count={5} />
        </View>
      ) : filteredShops.length > 0 ? (
        <FlatList
          data={filteredShops}
          keyExtractor={item => item.id}
          renderItem={renderShopItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <AppEmptyState 
          icon="map-pin" 
          title="No shops found" 
          description="Try adjusting your search criteria." 
        />
      )}

      {startVisitMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <AppLoadingSkeleton type="card" count={1} style={{ width: 200 }} />
          <Text style={styles.loadingText}>Starting Visit...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  loadingContainer: { padding: SPACING.lg },
  listContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING['3xl'] },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between'
  },
  shopInfo: { flex: 1, marginRight: SPACING.md },
  shopName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  shopDetails: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: 4 },
  shopAddress: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  actionArea: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  actionText: { color: COLORS.primary, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.sm },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  loadingText: { color: COLORS.white, marginTop: SPACING.md, fontWeight: '600', fontSize: TYPOGRAPHY.sizes.base }
});
