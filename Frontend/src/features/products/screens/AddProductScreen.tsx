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
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { Screen, Button, Card, ControlledInput, Input, Spinner, EmptyState } from '@/components';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, radius, spacing, typography } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import { toast } from '@/store/useToastStore';
import { resolveMediaUrl, splitMediaPaths } from '@/lib/media';

/** Backend packs all photos into one comma-separated column. */
const MAX_PRODUCT_PHOTOS = 3;
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
  const role = useAuthStore((s) => s.user?.role);
  const editing = route.params?.product;
  const isEdit = !!editing;

  const { data: distributor, isLoading, isError, refetch } =
    useDistributorProfile(!isEdit);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(editing?.id ?? '');
  const createCategory = useCreateCategory();

  // The backend keeps every photo in one comma-separated `product_image_url`,
  // so we track kept existing paths and freshly picked files separately and
  // rejoin them on save.
  const [images, setImages] = useState<PickedImage[]>([]);
  const [keptUrls, setKeptUrls] = useState<string[]>(
    splitMediaPaths(editing?.product_image_url),
  );
  const [photosTouched, setPhotosTouched] = useState(false);
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

  const totalPhotos = keptUrls.length + images.length;
  const canAddPhoto = totalPhotos < MAX_PRODUCT_PHOTOS;

  const pickImage = (picked: PickedImage) => {
    setPhotosTouched(true);
    setImages((prev) => [...prev, picked].slice(0, MAX_PRODUCT_PHOTOS));
  };
  const removeKept = (url: string) => {
    setPhotosTouched(true);
    setKeptUrls((prev) => prev.filter((u) => u !== url));
  };
  const removePicked = (uri: string) => {
    setPhotosTouched(true);
    setImages((prev) => prev.filter((i) => i.uri !== uri));
  };

  // Backend already restricts POST/PUT /products to SUPER_ADMIN,
  // MANUFACTURER_ADMIN and DISTRIBUTOR_ADMIN. Guard the screen too so a
  // salesman reaching this route by any path gets a clear message instead of a
  // form that 403s on submit.
  if (role === 'SALESMAN') {
    return (
      <Screen edges={[]}>
        <EmptyState
          title={t('products.form.notAllowedTitle')}
          message={t('products.form.notAllowed')}
        />
      </Screen>
    );
  }

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
      onError: (e) => toast.error(getApiErrorMessage(e, t) || t('products.form.tagError')),
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
          },
          images,
          // Only send the photo set when the user actually changed it, so an
          // untouched edit leaves the column alone.
          keptUrls: photosTouched ? keptUrls : undefined,
        },
        {
          onSuccess: () => {
            toast.success(t('products.form.updated'));
            navigation.goBack();
          },
          onError: (e) =>
            toast.error(getApiErrorMessage(e, t) || t('products.form.createError')),
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
        images,
      },
      {
        onSuccess: () => {
          toast.success(t('products.form.created'));
          navigation.goBack();
        },
        onError: (e) =>
          toast.error(getApiErrorMessage(e, t) || t('products.form.createError')),
      },
    );
  };

  const opt = (label: string) => `${label} (${t('shops.form.optional')})`;

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

      <Text style={styles.sectionLabel}>
        {opt(t('products.form.photos', { max: MAX_PRODUCT_PHOTOS }))}
      </Text>
      <View style={styles.photoGrid}>
        {keptUrls.map((url) => (
          <View key={url} style={styles.photoTile}>
            <Image source={{ uri: resolveMediaUrl(url) }} style={styles.photo} />
            <Pressable
              style={styles.removePhoto}
              onPress={() => removeKept(url)}
              hitSlop={8}
              accessibilityLabel={t('shops.form.removePhoto')}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
        {images.map((img) => (
          <View key={img.uri} style={styles.photoTile}>
            <Image source={{ uri: img.uri }} style={styles.photo} />
            <Pressable
              style={styles.removePhoto}
              onPress={() => removePicked(img.uri)}
              hitSlop={8}
              accessibilityLabel={t('shops.form.removePhoto')}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}
        {canAddPhoto ? (
          <Pressable onPress={choosePhoto} style={styles.photoTile}>
            <Card style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
              <Text style={styles.muted}>{t('shops.form.addPhoto')}</Text>
            </Card>
          </Pressable>
        ) : null}
      </View>

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
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoTile: { width: 100, height: 100 },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: { alignSelf: 'center', marginTop: spacing.sm },
  changePhotoText: { ...typography.label, color: colors.primary },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 0,
  },
  muted: { ...typography.body, color: colors.textMuted },
  submit: { marginTop: spacing.xl },
});
