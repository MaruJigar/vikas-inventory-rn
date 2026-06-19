import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCreateShopMutation, useUploadShopImageMutation } from '../hooks/useShopMutations';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../styles/colors';

import { AppHeader } from '../../../components/ui/AppHeader';
import { AppCard } from '../../../components/ui/AppCard';
import { AppInput } from '../../../components/ui/AppInput';
import { AppButton } from '../../../components/ui/AppButton';

export default function ShopRegistrationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { initialData, duplicate_bypass } = route.params || {};

  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Recovery State: Store the shop if creation succeeds but upload fails
  const [createdShop, setCreatedShop] = useState(null);

  const createShopMutation = useCreateShopMutation();
  const uploadShopImageMutation = useUploadShopImageMutation();

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Camera access is required to take verification photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!address) {
      Alert.alert('Validation Error', 'Address is required.');
      return;
    }
    
    if (!imageUri) {
      Alert.alert('Validation Error', 'Verification photo is mandatory. Please capture an image.');
      return;
    }

    let activeShopId = createdShop?.id;

    // 1. Create Shop (only if not already created)
    if (!activeShopId) {
      try {
        const createPayload = {
          ...initialData,
          address,
          owner_name: ownerName || undefined,
          city: city || undefined,
          state: state || undefined,
          gst_number: gstNumber || undefined,
          duplicate_bypass: duplicate_bypass || undefined,
        };

        const shop = await createShopMutation.mutateAsync(createPayload);
        
        if (!shop?.id) {
          throw new Error('Shop creation failed. No ID returned.');
        }
        
        // Persist the created shop in local state
        setCreatedShop(shop);
        activeShopId = shop.id;
      } catch (error) {
        Alert.alert('Shop Creation Failed', error?.response?.data?.message || error.message || 'An error occurred while creating the shop record.');
        return; // Stop execution here
      }
    }

    // 2. Upload Image
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: `shop_${activeShopId}.jpg`,
        type: 'image/jpeg',
      });

      await uploadShopImageMutation.mutateAsync({ shopId: activeShopId, formData });

      // 3. Success
      setCreatedShop(null); // Clear recovery state
      Alert.alert('Success', 'Shop registered and verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
             navigation.navigate('SalesmanHome');
          }
        }
      ]);

    } catch (error) {
      Alert.alert(
        'Image Upload Failed', 
        'The shop was created successfully, but the photo upload failed due to network issues. Please try registering again to retry the upload.',
        [{ text: 'OK' }]
      );
    }
  };

  const isSubmitting = createShopMutation.isPending || uploadShopImageMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Complete Registration" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AppCard variant="elevated">
          <Text style={styles.summaryText}>Shop: {initialData?.name}</Text>
          <Text style={styles.summaryText}>Phone: {initialData?.phone}</Text>
          <View style={{ marginBottom: SPACING.md }} />
          
          <AppInput
            label="Address *"
            value={address}
            onChangeText={setAddress}
            placeholder="Complete street address"
            multiline
            inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          <AppInput
            label="Owner Name"
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Owner name (optional)"
            icon="user"
          />

          <AppInput
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="City (optional)"
            icon="map-pin"
          />

          <AppInput
            label="State"
            value={state}
            onChangeText={setState}
            placeholder="State (optional)"
            icon="map"
          />

          <AppInput
            label="GST Number"
            value={gstNumber}
            onChangeText={setGstNumber}
            placeholder="GSTIN (optional)"
            icon="file-text"
          />

          <Text style={styles.label}>Verification Photo *</Text>
          <View style={styles.photoContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No photo captured</Text>
              </View>
            )}
            <AppButton 
              title={imageUri ? 'Retake Photo' : 'Capture Photo'}
              variant="secondary"
              icon="camera"
              onPress={takePhoto}
              disabled={isSubmitting}
            />
          </View>

          <AppButton 
            title="Register Shop"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            size="lg"
            style={{ marginTop: SPACING.lg, backgroundColor: COLORS.success }}
          />
        </AppCard>
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
  summaryText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: 'bold',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  placeholderText: {
    color: COLORS.gray500,
  },
});
