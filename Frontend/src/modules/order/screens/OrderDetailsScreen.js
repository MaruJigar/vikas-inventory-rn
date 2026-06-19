import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrderDetails } from '../hooks/useOrderQueries';
import { useOrderMutations } from '../hooks/useOrderMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

const PRE_DISPATCH_STATUSES = ['CREATED', 'CONFIRMED', 'PROCESSING', 'PACKED'];

export const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  const { data: orderData, isLoading } = useOrderDetails(orderId);
  const { cancelOrderMutation } = useOrderMutations();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading || !orderData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { order, items } = orderData;
  const canCancel = PRE_DISPATCH_STATUSES.includes(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const handleCancelPress = () => {
    setCancelReason('');
    setCancelModalVisible(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Reason is required');
      return;
    }
    cancelOrderMutation.mutate({ orderId: order.id, reason: cancelReason.trim() }, {
      onSuccess: () => {
        setCancelModalVisible(false);
        setCancelReason('');
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product_name_snapshot}</Text>
        <Text style={styles.itemMeta}>Qty: {item.quantity} | {item.status}</Text>
        {item.item_discount_amount > 0 && (
          <Text style={styles.discountText}>Discount: -₹{item.item_discount_amount}</Text>
        )}
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>₹{item.net_line_amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('SalesmanHome')}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_number}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Final Amount:</Text>
              <Text style={styles.finalAmount}>₹{order.final_order_amount}</Text>
            </View>

            <TouchableOpacity 
              style={styles.revisionsBtn} 
              onPress={() => navigation.navigate('OrderRevisionsScreen', { orderId: order.id })}
            >
              <Text style={styles.revisionsBtnText}>View Revision History</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {canCancel && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={handleCancelPress}
            disabled={cancelOrderMutation.isPending}
          >
            {cancelOrderMutation.isPending ? (
              <ActivityIndicator color={COLORS.danger} />
            ) : (
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Cross-platform Cancel Reason Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalSubtitle}>Please enter a reason for cancellation:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reason..."
              placeholderTextColor={COLORS.gray400}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Nevermind</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleCancelConfirm}
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  listContainer: { padding: SPACING.lg, paddingBottom: SPACING['3xl'] },
  statusCard: {
    backgroundColor: COLORS.white, padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.lg, ...SHADOWS.sm
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  statusLabel: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray600, fontWeight: '600' },
  statusBadge: { backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  statusBadgeCancelled: { backgroundColor: COLORS.danger + '15' },
  statusText: { color: COLORS.primary, fontWeight: '800' },
  finalAmount: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '800', color: COLORS.gray900 },
  revisionsBtn: { marginTop: SPACING.md, padding: SPACING.sm, backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  revisionsBtnText: { color: COLORS.primary, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, ...SHADOWS.sm
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '600', color: COLORS.gray900 },
  itemMeta: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  discountText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.success, marginTop: 4 },
  itemTotalText: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  footer: { padding: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  cancelBtn: { padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger },
  cancelBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.lg },
  // Cancel Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, width: '100%', maxWidth: 400, ...SHADOWS.lg,
  },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginBottom: SPACING.lg },
  modalInput: {
    backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray900,
    minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.gray200,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.lg, gap: SPACING.md },
  modalCancelBtn: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  modalCancelText: { color: COLORS.gray600, fontWeight: '600', fontSize: TYPOGRAPHY.sizes.base },
  modalConfirmBtn: {
    backgroundColor: COLORS.danger, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  modalConfirmText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.base },
});
