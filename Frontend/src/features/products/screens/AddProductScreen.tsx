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

import { Screen, Button, Card, ControlledInput, Input, Spinner, EmptyState } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { resolveMediaUrl } from '@/lib/media';
import { useDistributorProfile } from '@/features/distributor/hooks';
import { addProductSchema, type AddProductForm } from '@/features/products/schemas';
import {
  useCreateProduct,
  useUpdateProduct,
  useCreateCategory,
  useCategories,
} from '@/features/products/hooks';
import { toNum } from '@/features/products/pricing';
import type { PickedImage } from '@/types/shop';
import type { HomeScreenProps } from '@/navigation/types';

export function AddProductScreen({ route, navigation }: HomeScreenProps<'AddProduct'>) {
  const { t } = useTranslation();
  const editing = route.params?.product;
  const isEdit = !!editing;

  const { data: distributor, isLoading, isError, refetch } =
    useDistributorProfile(!isEdit);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(editing?.id ?? '');
  const createCategory = useCreateCategory();

  const [image, setImage] = useState<PickedImage | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    editing?.category ? [editing.category.id] : [],
  );
  const [addingTag, setAddingTag] = useState(false);
  const [tagName, setTagName] = useState('');

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const { control, handleSubmit } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: editing?.name ?? '',
      external_manufacturer_name: editing?.external_manufacturer_name ?? '',
      mrp: editing ? String(toNum(editing.mrp)) : '',
      gst_percent: editing ? String(toNum(editing.gst_percent)) : '',
      unit: editing?.unit ?? '',
      sku: editing?.sku ?? '',
      description: editing?.description ?? '',
    },
  });

  const busy = createProduct.isPending || updateProduct.isPending;
  const existingImage = isEdit ? resolveMediaUrl(editing?.product_image_url) : undefined;

  const pickImage = (picked: PickedImage) => {
    setImage(picked);
    setImageRemoved(false);
  };
  const removeImage = () => {
    setImage(null);
    setImageRemoved(true);
  };

  if (!isEdit && isLoading) return <Spinner />;
  if (!isEdit && (isError || !distributor)) {
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
    if (!res.canceled) pickImage(toPicked(res.assets[0]));
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return notify(t('shops.form.photoPermission'));
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) pickImage(toPicked(res.assets[0]));
  };

  const choosePhoto = () => {
    if (Platform.OS === 'web') return void pickFromLibrary();
    Alert.alert(t('products.form.photo'), undefined, [
      { text: t('shops.form.takePhoto'), onPress: () => void pickFromCamera() },
      { text: t('shops.form.chooseFromLibrary'), onPress: () => void pickFromLibrary() },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const addTag = () => {
    const name = tagName.trim();
    if (!name) return;
    createCategory.mutate(name, {
      onSuccess: (cat) => {
        setCategoryIds((prev) => [...prev, cat.id]);
        setAddingTag(false);
        setTagName('');
      },
      onError: (e) => notify(getApiErrorMessage(e, t) || t('products.form.tagError')),
    });
  };

  const onSubmit = (values: AddProductForm) => {
    const gst = values.gst_percent ? parseFloat(values.gst_percent) : undefined;

    if (isEdit) {
      updateProduct.mutate(
        {
          payload: {
            name: values.name,
            external_manufacturer_name: values.external_manufacturer_name,
            mrp: parseFloat(values.mrp),
            gst_percent: gst,
            unit: values.unit || undefined,
            sku: values.sku || undefined,
            description: values.description || undefined,
            category_id: categoryIds[0] ?? undefined,
            category_ids: categoryIds.length ? categoryIds : undefined,
            // '' clears the image on the backend; undefined keeps the existing one.
            product_image_url: imageRemoved && !image ? '' : undefined,
          },
          image: image ?? undefined,
        },
        {
          onSuccess: () => navigation.goBack(),
          onError: (e) =>
            notify(getApiErrorMessage(e, t) || t('products.form.createError')),
        },
      );
      return;
    }

    createProduct.mutate(
      {
        payload: {
          product_source: 'DISTRIBUTOR_CREATED',
          distributor_id: distributor!.id,
          external_manufacturer_name: values.external_manufacturer_name,
          name: values.name,
          mrp: parseFloat(values.mrp),
          gst_percent: gst,
          unit: values.unit || undefined,
          sku: values.sku || undefined,
          description: values.description || undefined,
          category_id: categoryIds[0] ?? undefined,
          category_ids: categoryIds.length ? categoryIds : undefined,
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
  const previewUri = image?.uri ?? (imageRemoved ? undefined : existingImage);

  return (
    <Screen edges={[]}>
      <Text style={[typography.h1, styles.title]}>
        {isEdit ? t('products.form.editTitle') : t('products.form.title')}
      </Text>

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

      <Text style={styles.sectionLabel}>{opt(t('products.form.category'))}</Text>
      <View style={styles.chips}>
        {(categories ?? []).map((c) => {
          const selected = categoryIds.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => toggleCategory(c.id)}
              style={[styles.chip, selected && styles.chipOn]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setAddingTag((v) => !v)}
          style={[styles.chip, styles.chipAdd]}
        >
          <Ionicons name="add" size={14} color={colors.primary} />
          <Text style={styles.chipAddText}>{t('products.form.addTag')}</Text>
        </Pressable>
      </View>
      {addingTag ? (
        <View style={styles.addTagRow}>
          <View style={styles.flex}>
            <Input
              value={tagName}
              onChangeText={setTagName}
              placeholder={t('products.form.tagName')}
            />
          </View>
          <Button
            label={t('products.form.addTagSubmit')}
            loading={createCategory.isPending}
            disabled={!tagName.trim()}
            onPress={addTag}
            style={styles.addTagBtn}
          />
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>{opt(t('products.form.photo'))}</Text>
      {previewUri ? (
        <View>
          <Image source={{ uri: previewUri }} style={styles.preview} />
          <Pressable style={styles.removePhoto} onPress={removeImage} hitSlop={8}>
            <Ionicons name="close" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={choosePhoto} style={styles.changePhoto}>
            <Text style={styles.changePhotoText}>{t('shops.form.changePhoto')}</Text>
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
        label={isEdit ? t('products.form.save') : t('products.form.submit')}
        onPress={handleSubmit(onSubmit)}
        loading={busy}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm, marginBottom: spacing.lg },
  flex: { flex: 1 },
  sectionLabel: { ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
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
  chipAdd: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  chipAddText: { ...typography.label, color: colors.primary },
  addTagRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.sm },
  addTagBtn: { paddingHorizontal: spacing.md },
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
  changePhoto: { alignSelf: 'center', marginTop: spacing.sm },
  changePhotoText: { ...typography.label, color: colors.primary },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  muted: { ...typography.body, color: colors.textMuted },
  submit: { marginTop: spacing.xl },
});
