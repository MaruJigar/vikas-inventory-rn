import React from 'react';
import { TextInputProps } from 'react-native';
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/Input';

interface ControlledInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
}

/** Binds react-hook-form to <Input>; error keys are translated via i18n. */
export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: ControlledInputProps<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          // error.message holds an i18n key (see features/auth/schemas.ts)
          error={error?.message ? t(error.message) : undefined}
          {...inputProps}
        />
      )}
    />
  );
}
