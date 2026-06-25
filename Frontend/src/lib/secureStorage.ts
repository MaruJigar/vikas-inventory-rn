import * as SecureStore from 'expo-secure-store';

/** Thin typed wrapper over expo-secure-store (used for JWT tokens). */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const STORAGE_KEYS = {
  accessToken: 'qera.access_token',
  refreshToken: 'qera.refresh_token',
} as const;
