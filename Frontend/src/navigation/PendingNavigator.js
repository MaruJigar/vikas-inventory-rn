import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { PendingHomeScreen } from '../modules/pending/screens/PendingHomeScreen';
import { CatalogueScreen } from '../modules/pending/screens/CatalogueScreen';
import { DerivedManufacturerScreen } from '../modules/pending/screens/DerivedManufacturerScreen';
import { ProfileScreen } from '../modules/pending/screens/ProfileScreen';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../styles/colors';

// Custom lightweight tab navigator to avoid depending on @react-navigation/bottom-tabs 
// until we can guarantee npm install has run.
export const PendingNavigator = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home': return <PendingHomeScreen />;
      case 'Catalogue': return <CatalogueScreen />;
      case 'Manufacturers': return <DerivedManufacturerScreen />;
      case 'Profile': return <ProfileScreen />;
      default: return <PendingHomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <SafeAreaView style={styles.tabBarSafeArea}>
        <View style={styles.tabBar}>
          <TabButton name="Home" icon="🏠" active={activeTab === 'Home'} onPress={() => setActiveTab('Home')} />
          <TabButton name="Catalogue" icon="📦" active={activeTab === 'Catalogue'} onPress={() => setActiveTab('Catalogue')} />
          <TabButton name="Manufacturers" icon="🏢" active={activeTab === 'Manufacturers'} onPress={() => setActiveTab('Manufacturers')} />
          <TabButton name="Profile" icon="👤" active={activeTab === 'Profile'} onPress={() => setActiveTab('Profile')} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const TabButton = ({ name, icon, active, onPress }) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    <Text style={[styles.tabIcon, active && styles.activeTabIcon]}>{icon}</Text>
    <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  screenContainer: { flex: 1 },
  tabBarSafeArea: { backgroundColor: COLORS.white, ...SHADOWS.md },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: { fontSize: 20, opacity: 0.5 },
  activeTabIcon: { opacity: 1 },
  tabLabel: { fontSize: 10, marginTop: 4, color: COLORS.gray500, fontWeight: '500' },
  activeTabLabel: { color: COLORS.primary, fontWeight: 'bold' }
});
