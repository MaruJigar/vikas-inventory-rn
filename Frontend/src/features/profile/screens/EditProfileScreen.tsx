import React from 'react';
import { StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { Screen, Button, ControlledInput, Spinner, EmptyState } from '@/components';
import { spacing } from '@/theme';
import { getApiErrorMessage } from '@/lib/apiError';
import { notify } from '@/lib/dialog';
import {
  useDistributorProfile,
  useUpdateDistributorProfile,
} from '@/features/distributor/hooks';
import { editProfileSchema, type EditProfileForm } from '@/features/profile/schemas';
import type { UpdateDistributorProfilePayload } from '@/types/distributor';
import type { AccountScreenProps } from '@/navigation/types';

/** Distributor-only profile editor (PUT /distributors/profile). Salesmen have
 * no self-edit endpoint, so this screen is reached only by distributors. */
export function EditProfileScreen({
  navigation,
}: AccountScreenProps<'EditProfile'>) {
  const { t } = useTranslation();
  const { data: profile, isLoading, isError, refetch } =
    useDistributorProfile();

  if (isLoading) return <Spinner />;
  if (isError || !profile) {
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

  return <ProfileForm profile={profile} onSaved={() => navigation.goBack()} />;
}

/** Inner form — mounted only once the profile has loaded (stable defaults). */
function ProfileForm({
  profile,
  onSaved,
}: {
  profile: NonNullable<ReturnType<typeof useDistributorProfile>['data']>;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const update = useUpdateDistributorProfile();

  const { control, handleSubmit } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      business_name: profile.business_name ?? '',
      owner_name: profile.owner_name ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      gst_number: profile.gst_number ?? '',
      address: profile.address ?? '',
      state: profile.state ?? '',
      city: profile.city ?? '',
      pincode: profile.pincode ?? '',
    },
  });

  const onSubmit = (values: EditProfileForm) => {
    // Trim empties to undefined so we never overwrite with blank strings.
    const clean = (v?: string) => {
      const s = v?.trim();
      return s ? s : undefined;
    };
    const payload: UpdateDistributorProfilePayload = {
      business_name: values.business_name.trim(),
      owner_name: clean(values.owner_name),
      phone: clean(values.phone),
      email: clean(values.email),
      gst_number: clean(values.gst_number),
      address: clean(values.address),
      state: clean(values.state),
      city: clean(values.city),
      pincode: clean(values.pincode),
    };
    update.mutate(payload, {
      onSuccess: () => onSaved(),
      onError: (err) =>
        notify(getApiErrorMessage(err, t) || t('account.profile.saveError')),
    });
  };

  return (
    <Screen edges={[]}>
      <ControlledInput
        control={control}
        name="business_name"
        label={t('account.profile.businessName')}
      />
      <ControlledInput
        control={control}
        name="owner_name"
        label={t('account.profile.ownerName')}
      />
      <ControlledInput
        control={control}
        name="phone"
        label={t('account.profile.phone')}
        keyboardType="phone-pad"
      />
      <ControlledInput
        control={control}
        name="email"
        label={t('account.profile.email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ControlledInput
        control={control}
        name="gst_number"
        label={t('account.profile.gst')}
        autoCapitalize="characters"
      />
      <ControlledInput
        control={control}
        name="address"
        label={t('account.profile.address')}
        multiline
      />
      <ControlledInput
        control={control}
        name="state"
        label={t('account.profile.state')}
      />
      <ControlledInput
        control={control}
        name="city"
        label={t('account.profile.city')}
      />
      <ControlledInput
        control={control}
        name="pincode"
        label={t('account.profile.pincode')}
        keyboardType="number-pad"
      />

      <Button
        label={t('account.profile.save')}
        onPress={handleSubmit(onSubmit)}
        loading={update.isPending}
        style={styles.save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  save: { marginTop: spacing.xl },
});
