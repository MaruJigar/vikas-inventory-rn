import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

import i18n, {
  AppLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '@/i18n';

const STORAGE_KEY = 'qera.language';

function isSupported(value: string | null | undefined): value is AppLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

interface LanguageState {
  language: AppLanguage;
  /** Load saved choice, else fall back to device locale, else default. */
  hydrate: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: DEFAULT_LANGUAGE,

  hydrate: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    const deviceLang = getLocales()[0]?.languageCode ?? undefined;
    const lang: AppLanguage = isSupported(saved)
      ? saved
      : isSupported(deviceLang)
        ? deviceLang
        : DEFAULT_LANGUAGE;

    await i18n.changeLanguage(lang);
    set({ language: lang });
  },

  setLanguage: async (lang) => {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
    set({ language: lang });
  },
}));
