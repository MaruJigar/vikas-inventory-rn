import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Alert, Platform, StatusBar, Modal,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

export const SalesmenManagementScreen = ({ navigation }) => {
  const { appState, addSalesman, deleteSalesman } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);

  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const salesmen = appState.users.filter(u => u.role === 'salesman');

  const handleAdd = () => {
    if (!newName || !newUsername || !newPassword) {
      Alert.alert('Missing info', 'Please fill out all fields for the salesman.');
      return;
    }
    addSalesman({
      name: newName,
      username: newUsername,
      password: newPassword,
    });
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setModalVisible(false);
  };

  const confirmDelete = (user) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to permanently remove "${user.name}" access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSalesman(user.id) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Team</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>{salesmen.length} Active Salesmen</Text>
        <TouchableOpacity style={styles.addFab} onPress={() => setModalVisible(true)}>
          <Text style={styles.addFabText}>+ New Salesman</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={salesmen}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{item.name.substring(0,1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userInfo}>Username: <Text style={{fontWeight:'600', color:COLORS.gray800}}>{item.username}</Text></Text>
              <Text style={styles.userInfo}>Pass: ••••••••</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
              <Feather name="trash-2" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Salesman Account</Text>
            
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="e.g. Sanjay Patel" />

            <Text style={styles.inputLabel}>Login Username</Text>
            <TextInput style={styles.input} value={newUsername} onChangeText={setNewUsername} placeholder="e.g. sanjay_sales" autoCapitalize="none"/>

            <Text style={styles.inputLabel}>Login Password</Text>
            <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Enter password" secureTextEntry />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleAdd}>
                <Text style={styles.btnTextSave}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  summaryText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray500 },
  addFab: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  addFabText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  list: { padding: SPACING.lg },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  userName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  userInfo: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, marginTop: 1 },
  deleteBtn: { padding: SPACING.sm, backgroundColor: COLORS.dangerLight, borderRadius: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING['3xl'] },
  modalTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '800', color: COLORS.gray900, marginBottom: SPACING.lg },
  inputLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700', color: COLORS.gray600, textTransform: 'uppercase', marginBottom: SPACING.xs, marginTop: SPACING.md },
  input: { backgroundColor: COLORS.backgroundAlt, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, fontSize: TYPOGRAPHY.sizes.base },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING['2xl'] },
  btn: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  btnCancel: { backgroundColor: COLORS.gray100 },
  btnTextCancel: { color: COLORS.gray600, fontWeight: '700' },
  btnSave: { backgroundColor: COLORS.primary },
  btnTextSave: { color: COLORS.white, fontWeight: '700' },
});
