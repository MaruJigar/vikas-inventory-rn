import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, Modal, BackHandler, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import * as Crypto from 'expo-crypto';
import { withLocationRecovery } from '../../../utils/locationUtils';
import { useNavigation } from '@react-navigation/native';
import { useVisitHistory } from '../hooks/useVisitQueries';
import { useVisitMutations } from '../hooks/useVisitMutations';
import { useShopList } from '../../shop/hooks/useShopQueries';
import { useOrdersList } from '../../order/hooks/useOrderQueries';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../styles/colors';
import { Feather } from '@expo/vector-icons';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppButton } from '../../../components/ui/AppButton';
import { AppInput } from '../../../components/ui/AppInput';
import { AppLoadingSkeleton } from '../../../components/ui/AppLoadingSkeleton';

const REASONS = [
  'Shop Closed',
  'Owner Not Available',
  'Sufficient Stock',
  'Payment Pending',
  'Competitor Stock Purchased',
  'Other'
];

export const ActiveVisitScreen = () => {
  const navigation = useNavigation();
  const { data: visits, isLoading: isVisitsLoading } = useVisitHistory();
  const { data: shops } = useShopList();
  const { data: ordersList } = useOrdersList();
  const { noOrderVisitMutation, endVisitMutation } = useVisitMutations();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');

  const activeVisit = React.useMemo(() => {
    if (!visits) return null;
    return visits.find(v => v.status === 'ACTIVE');
  }, [visits]);

  const activeShop = React.useMemo(() => {
    if (!activeVisit || !shops) return null;
    return shops.find(s => s.id === activeVisit.shop_id);
  }, [activeVisit, shops]);

  const ordersForVisit = React.useMemo(() => {
    if (!activeVisit || !ordersList) return [];
    return ordersList.filter(o => o.visit_id === activeVisit.id);
  }, [activeVisit, ordersList]);

  const hasOrders = ordersForVisit.length > 0;

  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    if (!activeVisit?.started_at) return;
    const start = new Date(activeVisit.started_at).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsedTime(`${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVisit]);

  // If no active visit is found after loading, auto-redirect to Home
  useEffect(() => {
    if (!isVisitsLoading && !activeVisit) {
      navigation.replace('SalesmanHomeScreen');
    }
  }, [isVisitsLoading, activeVisit, navigation]);

  // MED-01: Prevent Android hardware back button from silently abandoning active visit
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Active Visit',
        'You have an active visit in progress. End the visit or submit a No Order Reason before leaving.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleCreateOrder = () => {
    navigation.navigate('ProductCatalogueScreen', { 
      visitId: activeVisit.id, 
      shopId: activeVisit.shop_id 
    });
  };

  const handleStandardEndVisit = async () => {
    if (!hasOrders) {
      Alert.alert('Action Blocked', 'Cannot close visit without an order. Use No Order Reason.');
      return;
    }

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

      endVisitMutation.mutate({
        visitId: activeVisit.id,
        latitude: location.latitude,
        longitude: location.longitude,
        idempotencyKey: `endvisit_${uuid}`,
      }, {
        onSuccess: () => {
          navigation.replace('SalesmanHomeScreen');
        }
      });
    });
  };

  const handleNoOrderSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Validation Error', 'Please select a reason.');
      return;
    }

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

      noOrderVisitMutation.mutate({
        visitId: activeVisit.id,
        reason: selectedReason,
        note: note,
        latitude: location.latitude,
        longitude: location.longitude,
        idempotencyKey: `noorder_${uuid}`,
      }, {
        onSuccess: () => {
          setModalVisible(false);
          navigation.replace('SalesmanHomeScreen');
        }
      });
    });
  };

  if (isVisitsLoading || !activeVisit) {
    return (
      <View style={styles.center}>
        <AppLoadingSkeleton type="card" count={2} style={{ padding: SPACING.lg }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Active Visit" 
        backgroundColor={COLORS.primary} 
        textColor={COLORS.white} 
        rightAction={elapsedTime} 
      />

      <View style={styles.content}>
        <AppCard style={styles.shopCard}>
          <View style={styles.iconCircle}>
            <Feather name="home" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{activeShop?.name || 'Loading Shop...'}</Text>
            <Text style={styles.shopDetails}>{activeShop?.owner_name} • {activeShop?.phone}</Text>
            <Text style={styles.shopAddress}>{activeShop?.address}, {activeShop?.city}</Text>
          </View>
        </AppCard>

        <View style={styles.actionGrid}>
          <AppButton 
            title="Create Order" 
            icon="shopping-cart" 
            onPress={handleCreateOrder} 
            size="lg" 
            style={{ marginBottom: SPACING.md }}
          />

          <AppButton 
            title="End Visit" 
            icon={hasOrders ? 'check-circle' : 'x-circle'} 
            variant={hasOrders ? 'primary' : 'outline'}
            onPress={hasOrders ? handleStandardEndVisit : () => Alert.alert('Action Blocked', 'Cannot close visit without an order. Use No Order Reason.')} 
            disabled={endVisitMutation.isPending}
            loading={endVisitMutation.isPending}
            size="lg"
            style={{ marginBottom: SPACING.md }}
          />

          <AppButton 
            title="No Order Reason" 
            icon="alert-triangle" 
            variant="outline"
            onPress={() => setModalVisible(true)} 
            size="lg"
          />
        </View>
      </View>

      {/* No Order Reason Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Select No Order Reason</Text>
            
            <View style={styles.reasonList}>
              {REASONS.map(r => (
                <AppButton 
                  key={r}
                  title={r}
                  variant={selectedReason === r ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setSelectedReason(r)}
                  style={styles.reasonOption}
                />
              ))}
            </View>

            <AppInput
              placeholder="Additional notes (optional)"
              value={note}
              onChangeText={setNote}
              multiline
              inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
            />

            <View style={styles.modalActions}>
              <AppButton 
                title="Cancel" 
                variant="secondary" 
                onPress={() => setModalVisible(false)} 
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <AppButton 
                title="End Visit" 
                loading={noOrderVisitMutation.isPending}
                onPress={handleNoOrderSubmit} 
                disabled={noOrderVisitMutation.isPending}
                style={{ flex: 1, marginLeft: SPACING.sm }}
              />
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {(noOrderVisitMutation.isPending || endVisitMutation.isPending) && !modalVisible && (
        <View style={styles.loadingOverlay}>
          <AppLoadingSkeleton type="card" count={1} style={{ width: 200 }} />
          <Text style={styles.loadingText}>Ending Visit...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: SPACING.lg },
  shopCard: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  shopInfo: { flex: 1 },
  shopName: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.gray900 },
  shopDetails: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: 4 },
  shopAddress: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  
  actionGrid: { gap: SPACING.xs },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.lg },
  reasonList: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  reasonOption: { marginBottom: SPACING.sm },
  modalActions: { flexDirection: 'row', marginTop: SPACING.md },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  loadingText: { color: COLORS.white, marginTop: SPACING.md, fontWeight: '600', fontSize: TYPOGRAPHY.sizes.base }
});
