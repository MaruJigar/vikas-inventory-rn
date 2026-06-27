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
import * as ImagePicker from 'expo-image-picker';

import { Screen, Button, Card, ControlledInput, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { useDistributorProfile } from '@/features/distributor/hooks';
import { addProductSchema, type AddProductForm } from '@/features/products/schemas';
import { useCreateProduct, useCategories } from '@/features/products/hooks';
import type { PickedImage } from '@/types/shop';
import type { HomeScreenProps } from '@/navigation/types';

export function AddProductScreen({ navigation }: HomeScreenProps<'AddProduct'>) {
  const { t } = useTranslation();
  const { data: distributor, isLoading, isError, refetch } =
    useDistributorProfile();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();

  const [image, setImage] = useState<PickedImage | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: '',
      external_manufacturer_name: '',
      mrp: '',
      gst_percent: '',
      unit: '',
      sku: '',
      description: '',
    },
  });

  if (isLoading) return <Spinner />;
  if (isError || !distributor) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('salesmen.profileError')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  const toPicked = (a: ImagePicker.ImagePickerAsset): PickedImage => ({
    uri: a.uri,
    name: a.fileName ?? a.uri.split('/').pop() ?? 'product.jpg',
    type: a.mimeType ?? 'image/jpeg',
  });

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return notify(t('shops.form.photoPermission'));
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled) setImage(toPicked(res.assets[0]));
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return notify(t('shops.form.photoPermission'));
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) setImage(toPicked(res.assets[0]));
  };

  const choosePhoto = () => {
    if (Platform.OS === 'web') return void pickFromLibrary();
    Alert.alert(t('products.form.photo'), undefined, [
      { text: t('shops.form.takePhoto'), onPress: () => void pickFromCamera() },
      { text: t('shops.form.chooseFromLibrary'), onPress: () => void pickFromLibrary() },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const onSubmit = (values: AddProductForm) => {
    createProduct.mutate(
      {
        payload: {
          product_source: 'DISTRIBUTOR_CREATED',
          distributor_id: distributor.id,
          external_manufacturer_name: values.external_manufacturer_name,
          name: values.name,
          mrp: parseFloat(values.mrp),
          gst_percent: values.gst_percent
            ? parseFloat(values.gst_percent)
            : undefined,
          unit: values.unit || undefined,
          sku: values.sku || undefined,
          description: values.description || undefined,
          category_id: categoryId ?? undefined,
        },
        image: image ?? undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (e) =>
          notify(getApiErrorMessage(e, t) || t('products.form.createError')),
      },
    );
  };

  const opt = (label: string) => `${label} (${t('shops.form.optional')})`;

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>{t('products.form.title')}</Text>

      <ControlledInput control={control} name="name" label={t('products.form.name')} />
      <ControlledInput
        control={control}
        name="external_manufacturer_name"
        label={t('products.form.manufacturer')}
      />
      <ControlledInput
        control={control}
        name="mrp"
        label={t('products.form.mrp')}
        keyboardType="decimal-pad"
      />
      <ControlledInput
        control={control}
        name="gst_percent"
        label={opt(t('products.form.gst'))}
        keyboardType="decimal-pad"
      />
      <ControlledInput control={control} name="unit" label={opt(t('products.form.unit'))} />
      <ControlledInput control={control} name="sku" label={opt(t('products.form.sku'))} />
      <ControlledInput
        control={control}
        name="description"
        label={opt(t('products.form.description'))}
        multiline
      />

      {categories && categories.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>{opt(t('products.form.category'))}</Text>
          <View style={styles.chips}>
            {categories.map((c) => {
              const selected = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(selected ? null : c.id)}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>{opt(t('products.form.photo'))}</Text>
      {image ? (
        <View>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <Pressable
            style={styles.removePhoto}
            onPress={() => setImage(null)}
            hitSlop={8}
          >
            <Ionicons name="close" size={18} color="#FFFFFF" />
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
        label={t('products.form.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={createProduct.isPending}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.text },
  chipTextOn: { color: '#FFFFFF' },
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
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  muted: { ...typography.body, color: colors.textMuted },
  submit: { marginTop: spacing.xl },
});
