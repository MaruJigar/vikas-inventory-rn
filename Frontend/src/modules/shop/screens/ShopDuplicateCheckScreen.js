import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCheckDuplicateMutation } from '../hooks/useShopMutations';
import { withLocationRecovery } from '../../../utils/locationUtils';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../styles/colors';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';

export default function ShopDuplicateCheckScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [matches, setMatches] = useState([]);

  const checkDuplicateMutation = useCheckDuplicateMutation();

  const handleCheck = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Name and Phone are required.');
      return;
    }

    setIsGettingLocation(true);
    await withLocationRecovery(async (coords) => {
      setLocation(coords);
      setIsGettingLocation(false);

      try {
        const result = await checkDuplicateMutation.mutateAsync({
          name,
          phone,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (result && result.length > 0) {
          setMatches(result);
        } else {
          // No matches, proceed to registration
          proceedToRegistration(coords, null);
        }
      } catch (error) {
        Alert.alert('Error', error?.response?.data?.message || 'Failed to check for duplicates.');
      }
    });
    
    // We must ensure loading state is cleared if recovery is cancelled.
    // withLocationRecovery swallows errors to show alerts, so we timeout a failsafe or let the user click retry.
    // Actually, setting it false immediately after the wrapper is not safe because the wrapper is async and waits for alerts.
    // The easiest fix is to let `withLocationRecovery` handle the spinner state inside if we wanted, but since we use `isGettingLocation` to disable the button,
    // we should make sure it turns off if location fails.
    setIsGettingLocation(false); 
  };

  const proceedToRegistration = (coords, duplicateBypass = null) => {
    navigation.navigate('ShopRegistrationScreen', {
      initialData: {
        name,
        phone,
        latitude: coords?.latitude || location?.latitude,
        longitude: coords?.longitude || location?.longitude,
      },
      duplicate_bypass: duplicateBypass,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Register New Shop" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {matches.length === 0 ? (
          <AppCard variant="elevated">
            <AppInput
              label="Shop Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Vikas Supermarket"
              icon="shopping-bag"
            />

            <AppInput
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. +919876543210"
              keyboardType="phone-pad"
              icon="phone"
            />

            <AppButton 
              title="Check & Proceed"
              onPress={handleCheck}
              loading={checkDuplicateMutation.isPending || isGettingLocation}
              disabled={checkDuplicateMutation.isPending || isGettingLocation}
              style={{ marginTop: SPACING.md }}
            />
          </AppCard>
        ) : (
          <View style={styles.duplicateContainer}>
            <Text style={styles.warningHeader}>Potential Duplicates Found</Text>
            <Text style={styles.warningText}>We found similar shops already in the system:</Text>
            
            {matches.map((match, index) => (
              <AppCard key={index} variant="outlined" style={styles.matchCard}>
                <Text style={styles.matchName}>{match.shop.name}</Text>
                <Text style={styles.matchPhone}>{match.shop.phone}</Text>
                <Text style={styles.matchAddress}>{match.shop.address}</Text>
                <Text style={styles.matchType}>Match Type: {match.match_type} (Score: {match.match_score})</Text>
              </AppCard>
            ))}

            <View style={styles.actionRow}>
              <AppButton 
                title="Cancel"
                variant="secondary"
                onPress={() => navigation.goBack()}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />

              <AppButton 
                title="Create Anyway"
                variant="primary"
                style={{ backgroundColor: COLORS.danger, flex: 1, marginLeft: SPACING.sm }}
                onPress={() => proceedToRegistration(location, {
                  matched_shop_id: matches[0].shop.id,
                  match_type: matches[0].match_type
                })}
              />
            </View>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  duplicateContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: 8,
    elevation: 2,
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  warningHeader: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  matchCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  matchName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  matchPhone: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray700,
    marginVertical: 4,
  },
  matchAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
  },
  matchType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.danger,
    marginTop: 8,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
});
