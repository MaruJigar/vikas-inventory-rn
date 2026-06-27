import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Button, Card, ControlledInput } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import { addShopSchema, type AddShopForm } from '@/features/shops/schemas';
import { useCheckDuplicate, useCreateShop } from '@/features/shops/hooks';
import type {
  CreateShopPayload,
  DuplicateMatch,
  PickedImage,
} from '@/types/shop';
import type { ShopsScreenProps } from '@/navigation/types';

type Coords = { latitude: number; longitude: number };

export function AddShopScreen({ navigation }: ShopsScreenProps<'AddShop'>) {
  const { t } = useTranslation();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);

  const checkDuplicate = useCheckDuplicate();
  const createShop = useCreateShop();
  const busy = checkDuplicate.isPending || createShop.isPending;

  const { control, handleSubmit } = useForm<AddShopForm>({
    resolver: zodResolver(addShopSchema),
    defaultValues: {
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      gst_number: '',
    },
  });

  const captureLocation = async () => {
    setLocating(true);
    try {
      if (Platform.OS === 'web') {
        // Browsers block geolocation on insecure origins (non-HTTPS,
        // non-localhost) and report "denied" without ever prompting.
        if ((globalThis as { isSecureContext?: boolean }).isSecureContext === false) {
          notify(t('shops.form.locationInsecure'));
          return;
        }
        // On web the prompt fires on the position request itself, not on the
        // permission request — so call it directly to trigger the dialog.
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        notify(t('shops.form.locationPermission'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch {
      notify(
        Platform.OS === 'web'
          ? t('shops.form.locationDenied')
          : t('shops.form.locationError'),
      );
    } finally {
      setLocating(false);
    }
  };

  const toPickedImage = (
    asset: ImagePicker.ImagePickerAsset,
  ): PickedImage => ({
    uri: asset.uri,
    name: asset.fileName ?? asset.uri.split('/').pop() ?? 'shop.jpg',
    type: asset.mimeType ?? 'image/jpeg',
  });

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      notify(t('shops.form.photoPermission'));
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setImage(toPickedImage(res.assets[0]));
  };

  const pickFromLibrary = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      notify(t('shops.form.photoPermission'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled) setImage(toPickedImage(res.assets[0]));
  };

  const choosePhoto = () => {
    // react-native-web's Alert can't render a multi-button action sheet, so on
    // web go straight to the file picker (which offers the camera on mobile web).
    if (Platform.OS === 'web') {
      void pickFromLibrary();
      return;
    }
    Alert.alert(t('shops.form.photo'), undefined, [
      { text: t('shops.form.takePhoto'), onPress: () => void pickFromCamera() },
      {
        text: t('shops.form.chooseFromLibrary'),
        onPress: () => void pickFromLibrary(),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const buildPayload = (
    values: AddShopForm,
    location: Coords,
    bypass?: DuplicateMatch,
  ): CreateShopPayload => ({
    name: values.name,
    phone: values.phone,
    address: values.address,
    owner_name: values.owner_name || undefined,
    city: values.city || undefined,
    state: values.state || undefined,
    gst_number: values.gst_number || undefined,
    latitude: location.latitude,
    longitude: location.longitude,
    duplicate_bypass: bypass
      ? { matched_shop_id: bypass.shop.id, match_type: bypass.match_type }
      : undefined,
  });

  const submitShop = (payload: CreateShopPayload) => {
    createShop.mutate(
      { payload, image: image ?? undefined },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err) =>
          notify(getApiErrorMessage(err, t) || t('shops.form.createError')),
      },
    );
  };

  const onSubmit = async (values: AddShopForm) => {
    if (!coords) {
      notify(t('shops.form.locationRequired'));
      return;
    }
    try {
      const matches = await checkDuplicate.mutateAsync({
        name: values.name,
        phone: values.phone,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (matches.length > 0) {
        const top = matches[0];
        confirmAction({
          title: t('shops.duplicate.title'),
          message: `${t('shops.duplicate.message')}\n${t(
            'shops.duplicate.matchedBy',
            { type: top.match_type },
          )}`,
          confirmLabel: t('shops.duplicate.addAnyway'),
          cancelLabel: t('shops.duplicate.cancel'),
          onConfirm: () => submitShop(buildPayload(values, coords, top)),
        });
        return;
      }

      submitShop(buildPayload(values, coords));
    } catch (err) {
      notify(getApiErrorMessage(err, t));
    }
  };

  return (
    <Screen>
      <Text style={[typography.h1, styles.title]}>{t('shops.form.title')}</Text>

      <ControlledInput
        control={control}
        name="name"
        label={t('shops.form.name')}
      />
      <ControlledInput
        control={control}
        name="owner_name"
        label={`${t('shops.form.ownerName')} (${t('shops.form.optional')})`}
      />
      <ControlledInput
        control={control}
        name="phone"
        label={t('shops.form.phone')}
        keyboardType="phone-pad"
      />
      <ControlledInput
        control={control}
        name="address"
        label={t('shops.form.address')}
        multiline
      />
      <ControlledInput
        control={control}
        name="city"
        label={`${t('shops.form.city')} (${t('shops.form.optional')})`}
      />
      <ControlledInput
        control={control}
        name="state"
        label={`${t('shops.form.state')} (${t('shops.form.optional')})`}
      />
      <ControlledInput
        control={control}
        name="gst_number"
        label={`${t('shops.form.gstNumber')} (${t('shops.form.optional')})`}
        autoCapitalize="characters"
      />

      <Text style={styles.sectionLabel}>{t('shops.form.location')}</Text>
      <Button
        label={
          coords
            ? t('shops.form.locationCaptured')
            : t('shops.form.captureLocation')
        }
        variant="secondary"
        loading={locating}
        onPress={() => void captureLocation()}
      />
      {coords ? (
        <View style={styles.coordsRow}>
          <Ionicons name="location" size={14} color={colors.success} />
          <Text style={styles.coords}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>{t('shops.form.photo')}</Text>
      <Pressable onPress={choosePhoto}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.preview} />
        ) : (
          <Card style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
            <Text style={styles.muted}>{t('shops.form.addPhoto')}</Text>
          </Card>
        )}
      </Pressable>

      <Button
        label={t('shops.form.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={busy}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  coords: { ...typography.caption, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  submit: { marginTop: spacing.xl },
});
