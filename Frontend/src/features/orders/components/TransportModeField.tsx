import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input, Select } from '@/components';

/**
 * Preset transport modes. These strings are stored verbatim in
 * `orders.transport_mode` and MUST match the admin panel's options exactly, or
 * the same order reads back as "Other" there.
 */
export const TRANSPORT_PRESETS = ['By Air', 'By Road', 'By Train'] as const;

const OTHER = 'Other';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Transport mode picker: a dropdown of the presets plus "Other", which reveals
 * a free-text box. Mirrors the admin panel's create/edit order drawers.
 */
export function TransportModeField({ value, onChange, label }: Props) {
  const { t } = useTranslation();

  const isPreset = (TRANSPORT_PRESETS as readonly string[]).includes(value);
  // A non-empty value that isn't a preset is a custom one, so reopen as
  // "Other". Held in state too, so picking "Other" keeps the box open while
  // the field is still blank.
  const [otherPicked, setOtherPicked] = useState(!!value && !isPreset);

  const showCustom = otherPicked && !isPreset;
  const selected = isPreset ? value : showCustom ? OTHER : '';

  const options = [
    ...TRANSPORT_PRESETS.map((m) => ({
      label: t(`cart.transport.${m}`, { defaultValue: m }),
      value: m,
    })),
    { label: t('cart.transport.Other', { defaultValue: OTHER }), value: OTHER },
  ];

  return (
    <>
      <Select
        label={label ?? t('cart.transportMode')}
        placeholder={t('cart.transportModePlaceholder')}
        value={selected}
        options={options}
        onChange={(v) => {
          if (v === OTHER) {
            setOtherPicked(true);
            onChange('');
          } else {
            setOtherPicked(false);
            onChange(v);
          }
        }}
      />
      {showCustom ? (
        <Input
          value={value}
          onChangeText={(v) => onChange(v.trimStart())}
          placeholder={t('cart.transportModeCustom')}
        />
      ) : null}
    </>
  );
}
