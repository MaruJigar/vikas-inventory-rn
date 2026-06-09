import React, { useState, useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { ApiService } from '../services/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

export const UserApprovalsScreen = ({ navigation }) => {
  const { appState } = useContext(AppContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      if (response.success) {
        // Filter out non-pending users
        setUsers(response.data.filter(u => u.approval_status === 'pending_approval'));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    }
  };

  const handleApprove = async (id) => {
    try {
      await ApiService.approveUser(id, 'approved');
      setUsers(users.filter(u => u.id !== id));
      Alert.alert('Success', 'User approved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const handleReject = async (id) => {
    try {
      await ApiService.approveUser(id, 'rejected');
      setUsers(users.filter(u => u.id !== id));
      Alert.alert('Success', 'User rejected.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject user');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userPhone}>{item.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
          {item.distributor && (
            <Text style={styles.distributorText}>Under: {item.distributor}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(item.id)}>
          <Feather name="x" size={20} color={COLORS.danger} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item.id)}>
          <Feather name="check" size={20} color={COLORS.success} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Approvals</Text>
        <View style={{ width: 24 }} />
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="check-circle" size={48} color={COLORS.gray300} style={{ marginBottom: SPACING.md }} />
          <Text style={styles.emptyText}>No pending approvals</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  backBtn: { padding: SPACING.xs },
  listContainer: { padding: SPACING.lg },
  userCard: {
    backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '20',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  avatarText: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '700', color: COLORS.primary },
  userName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  userPhone: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray500, marginTop: 2 },
  roleBadge: {
    backgroundColor: COLORS.gray100, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, alignSelf: 'flex-start', marginTop: 4,
  },
  roleText: { fontSize: 10, fontWeight: '700', color: COLORS.gray600 },
  distributorText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  approveBtn: { backgroundColor: COLORS.success + '15' },
  rejectBtn: { backgroundColor: COLORS.danger + '15' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray500, fontWeight: '500' }
});
