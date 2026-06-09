import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const notifConfig = {
  order: { icon: 'package', color: COLORS.primary, bg: '#EEF2FF' },
  stock: { icon: 'alert-circle', color: COLORS.warning, bg: COLORS.warningLight },
  system: { icon: 'bell', color: COLORS.gray600, bg: COLORS.backgroundAlt },
};

const NotificationItem = ({ notification, onPress }) => {
  const config = notifConfig[notification.type] || notifConfig.system;
  const isUnread = !notification.read;

  return (
    <TouchableOpacity
      style={[styles.notifCard, isUnread && styles.notifUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
        <Feather name={config.icon} size={18} color={config.color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>{notification.title}</Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{notification.message}</Text>
        <Text style={styles.notifDate}>{notification.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const NotificationsScreen = ({ navigation }) => {
  const { appState, markNotificationAsRead } = useContext(AppContext);
  const unreadCount = appState.notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={COLORS.gray900} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && <Text style={styles.headerCount}>{unreadCount} unread</Text>}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={appState.notifications}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => markNotificationAsRead(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={48} color={COLORS.gray300} style={{marginBottom: SPACING.md}} />
            <Text style={styles.emptyText}>No notifications</Text>
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  headerCount: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.primary, fontWeight: '600', marginTop: 2 },

  list: { padding: SPACING.lg },

  notifCard: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  notifIconText: { fontSize: 18 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '500', color: COLORS.gray700 },
  notifTitleUnread: { fontWeight: '700', color: COLORS.gray900 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifMessage: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: SPACING.xs, lineHeight: 18 },
  notifDate: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, marginTop: SPACING.sm },

  emptyState: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.gray500 },
});
