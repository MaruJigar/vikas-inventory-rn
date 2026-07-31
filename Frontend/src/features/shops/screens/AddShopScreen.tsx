import React, { useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Button, Card, ControlledInput, Select } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { confirmAction, notify } from '@/lib/dialog';
import { addShopSchema, type AddShopForm } from '@/features/shops/schemas';
import { useCheckDuplicate, useCreateShop } from '@/features/shops/hooks';
import { useCities, useStates } from '@/features/region/hooks';
import type {
  CreateShopPayload,
  DuplicateMatch,
  PickedImage,
} from '@/types/shop';
import type { ShopsScreenProps } from '@/navigation/types';

export function AddShopScreen({ navigation }: ShopsScreenProps<'AddShop'>) {
  const { t } = useTranslation();
  const [image, setImage] = useState<PickedImage | null>(null);

  const checkDuplicate = useCheckDuplicate();
  const createShop = useCreateShop();
  const busy = checkDuplicate.isPending || createShop.isPending;

  const { control, handleSubmit, watch, setValue } = useForm<AddShopForm>({
    resolver: zodResolver(addShopSchema),
    defaultValues: {
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      state_id: '',
      city_id: '',
      maps_link: '',
      gst_number: '',
    },
  });

  const stateId = watch('state_id');
  const statesQuery = useStates();
  const citiesQuery = useCities(stateId || undefined);

  const stateOptions = useMemo(
    () => (statesQuery.data ?? []).map((s) => ({ label: s.name, value: s.id })),
    [statesQuery.data],
  );
  const cityOptions = useMemo(
    () => (citiesQuery.data ?? []).map((c) => ({ label: c.name, value: c.id })),
    [citiesQuery.data],
  );

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
    bypass?: DuplicateMatch,
  ): CreateShopPayload => ({
    name: values.name,
    phone: values.phone,
    address: values.address,
    owner_name: values.owner_name || undefined,
    state_id: values.state_id,
    city_id: values.city_id,
    // Send the picked names too — the backend stores them as city_name/state_name.
    state: stateOptions.find((o) => o.value === values.state_id)?.label,
    city: cityOptions.find((o) => o.value === values.city_id)?.label,
    maps_link: values.maps_link || undefined,
    gst_number: values.gst_number || undefined,
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
    try {
      const matches = await checkDuplicate.mutateAsync({
        name: values.name,
        phone: values.phone,
        city_id: values.city_id,
        state_id: values.state_id,
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
          onConfirm: () => submitShop(buildPayload(values, top)),
        });
        return;
      }

      submitShop(buildPayload(values));
    } catch (err) {
      notify(getApiErrorMessage(err, t));
    }
  };

  return (
    <Screen edges={[]}>
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

      <Controller
        control={control}
        name="state_id"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Select
            label={t('shops.form.state')}
            placeholder={t('shops.form.selectState')}
            value={value}
            options={stateOptions}
            loading={statesQuery.isLoading}
            searchable
            searchPlaceholder={t('shops.form.searchState')}
            emptyText={t('shops.form.noStates')}
            onChange={(v) => {
              onChange(v);
              // Reset the dependent city whenever the state changes.
              setValue('city_id', '', { shouldValidate: false });
            }}
            error={error?.message ? t(error.message) : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="city_id"
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <Select
            label={t('shops.form.city')}
            placeholder={
              stateId
                ? t('shops.form.selectCity')
                : t('shops.form.selectStateFirst')
            }
            value={value}
            options={cityOptions}
            disabled={!stateId}
            loading={!!stateId && citiesQuery.isFetching}
            searchable
            searchPlaceholder={t('shops.form.searchCity')}
            emptyText={t('shops.form.noCities')}
            onChange={onChange}
            error={error?.message ? t(error.message) : undefined}
          />
        )}
      />

      <ControlledInput
        control={control}
        name="maps_link"
        label={`${t('shops.form.mapsLink')} (${t('shops.form.optional')})`}
        placeholder={t('shops.form.mapsLinkPlaceholder')}
        autoCapitalize="none"
        keyboardType="url"
      />

      <ControlledInput
        control={control}
        name="gst_number"
        label={`${t('shops.form.gstNumber')} (${t('shops.form.optional')})`}
        autoCapitalize="characters"
      />

      <Text style={styles.sectionLabel}>{t('shops.form.photo')}</Text>
      {image ? (
        <View>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <Pressable
            style={styles.removePhoto}
            onPress={() => setImage(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('shops.form.removePhoto')}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={choosePhoto} style={styles.changePhoto}>
            <Ionicons name="image-outline" size={16} color={colors.primary} />
            <Text style={styles.changePhotoText}>
              {t('shops.form.changePhoto')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={choosePhoto}>
          <Card style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
            <Text style={styles.muted}>{t('shops.form.addPhoto')}</Text>
          </Card>
        </Pressable>
      )}

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
  removePhoto: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  changePhotoText: { ...typography.label, color: colors.primary },
  submit: { marginTop: spacing.xl },
});
