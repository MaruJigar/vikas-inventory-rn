import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import {
  Screen,
  Button,
  ControlledInput,
  Select,
  Spinner,
  EmptyState,
} from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { resolveMediaUrl } from '@/lib/media';
import { addShopSchema, type AddShopForm } from '@/features/shops/schemas';
import { useShop, useUpdateShop } from '@/features/shops/hooks';
import { useCities, useStates } from '@/features/region/hooks';
import type { PickedImage, Shop, UpdateShopPayload } from '@/types/shop';
import type { ShopsScreenProps } from '@/navigation/types';

export function EditShopScreen({
  route,
  navigation,
}: ShopsScreenProps<'EditShop'>) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { data: shop, isLoading, isError, refetch } = useShop(id);

  if (isLoading) return <Spinner />;
  if (isError || !shop) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('shops.loadError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }
  return <EditForm shop={shop} onSaved={() => navigation.goBack()} />;
}

/** Inner form — mounted only once the shop has loaded (stable defaults). */
function EditForm({ shop, onSaved }: { shop: Shop; onSaved: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateShop(shop.id);
  // A newly picked photo replaces the existing one; null means keep current.
  const [image, setImage] = useState<PickedImage | null>(null);

  const { control, handleSubmit, watch, setValue } = useForm<AddShopForm>({
    resolver: zodResolver(addShopSchema),
    defaultValues: {
      name: shop.name,
      owner_name: shop.owner_name ?? '',
      phone: shop.phone,
      address: shop.address,
      state_id: shop.state_id ?? '',
      city_id: shop.city_id ?? '',
      maps_link: shop.maps_link ?? '',
      gst_number: shop.gst_number ?? '',
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

  const toPickedImage = (a: ImagePicker.ImagePickerAsset): PickedImage => ({
    uri: a.uri,
    name: a.fileName ?? a.uri.split('/').pop() ?? 'shop.jpg',
    type: a.mimeType ?? 'image/jpeg',
  });

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return notify(t('shops.form.photoPermission'));
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setImage(toPickedImage(res.assets[0]));
  };
  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return notify(t('shops.form.photoPermission'));
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled) setImage(toPickedImage(res.assets[0]));
  };
  const choosePhoto = () => {
    if (Platform.OS === 'web') return void pickFromLibrary();
    Alert.alert(t('shops.form.photo'), undefined, [
      { text: t('shops.form.takePhoto'), onPress: () => void pickFromCamera() },
      {
        text: t('shops.form.chooseFromLibrary'),
        onPress: () => void pickFromLibrary(),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const onSubmit = (values: AddShopForm) => {
    const payload: UpdateShopPayload = {
      name: values.name,
      owner_name: values.owner_name || undefined,
      phone: values.phone,
      address: values.address,
      state_id: values.state_id,
      city_id: values.city_id,
      state: stateOptions.find((o) => o.value === values.state_id)?.label,
      city: cityOptions.find((o) => o.value === values.city_id)?.label,
      maps_link: values.maps_link || undefined,
      gst_number: values.gst_number || undefined,
    };
    update.mutate(
      { payload, image: image ?? undefined },
      {
        onSuccess: onSaved,
        onError: (err) =>
          notify(getApiErrorMessage(err, t) || t('shops.edit.saveError')),
      },
    );
  };

  const existingPhoto = resolveMediaUrl(shop.verification_photo_url);
  const shownPhoto = image?.uri ?? existingPhoto ?? undefined;

  return (
    <Screen edges={[]}>
      <Text style={[styles.sectionLabel, styles.firstSection]}>
        {t('shops.edit.sectionDetails')}
      </Text>
      <ControlledInput control={control} name="name" label={t('shops.form.name')} />
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

      <Text style={styles.sectionLabel}>{t('shops.edit.sectionLocation')}</Text>
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
      {shownPhoto ? (
        <View>
          <Image source={{ uri: shownPhoto }} style={styles.preview} />
          <Pressable
            style={styles.replacePhoto}
            onPress={choosePhoto}
            accessibilityRole="button"
            accessibilityLabel={t('shops.edit.replacePhoto')}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.replaceText}>{t('shops.edit.replacePhoto')}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.photoPicker} onPress={choosePhoto}>
          <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
          <Text style={styles.muted}>{t('shops.form.addPhoto')}</Text>
        </Pressable>
      )}

      <Button
        label={t('shops.edit.save')}
        onPress={handleSubmit(onSubmit)}
        loading={update.isPending}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  firstSection: { marginTop: spacing.sm },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  replacePhoto: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(17,17,17,0.75)',
  },
  replaceText: { ...typography.caption, color: '#FFFFFF' },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  muted: { ...typography.body, color: colors.textMuted },
  submit: { marginTop: spacing.xl },
});
