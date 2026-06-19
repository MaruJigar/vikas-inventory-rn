import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrderRevisions } from '../hooks/useOrderQueries';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../../styles/colors';

export const OrderRevisionsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  const { data: revisions, isLoading } = useOrderRevisions(orderId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderRevision = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.revNumber}>Revision #{item.revision_number}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.reason}>Reason: {item.reason || 'No reason provided'}</Text>
        <View style={styles.diffRow}>
          <Text style={styles.label}>Old Quantity:</Text>
          <Text style={styles.value}>{item.old_data?.total_quantity || 0}</Text>
        </View>
        <View style={styles.diffRow}>
          <Text style={styles.label}>New Quantity:</Text>
          <Text style={styles.highlightValue}>{item.new_data?.total_quantity || 0}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {revisions?.length > 0 ? (
        <FlatList
          data={revisions}
          keyExtractor={item => item.id}
          renderItem={renderRevision}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No revisions found for this order.</Text>
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
  listContainer: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.white, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md, ...SHADOWS.sm
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingBottom: SPACING.sm },
  revNumber: { fontWeight: '700', color: COLORS.gray900 },
  date: { color: COLORS.gray500, fontSize: TYPOGRAPHY.sizes.xs },
  body: { paddingTop: SPACING.xs },
  reason: { fontStyle: 'italic', color: COLORS.gray600, marginBottom: SPACING.sm },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: COLORS.gray600 },
  value: { fontWeight: '600', color: COLORS.gray900 },
  highlightValue: { fontWeight: '800', color: COLORS.primary },
  emptyText: { color: COLORS.gray500, fontSize: TYPOGRAPHY.sizes.base }
});
