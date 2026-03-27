import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sensitive values (API keys, session tokens) - encrypted
export const secureSet = async (key: string, value: string) => {
  try { await SecureStore.setItemAsync(key, value); } catch (e) { console.warn('SecureStore write failed:', e); }
};
export const secureGet = async (key: string): Promise<string | null> => {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
};
export const secureDelete = async (key: string) => {
  try { await SecureStore.deleteItemAsync(key); } catch {}
};

// Non-sensitive preferences
export const prefSet = async (key: string, value: unknown) => {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
};
export const prefGet = async <T>(key: string): Promise<T | null> => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) as T : null;
  } catch { return null; }
};
