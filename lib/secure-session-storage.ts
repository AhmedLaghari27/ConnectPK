import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

// Move existing native sessions out of plaintext storage when first read.
export const secureSessionStorage = {
  async getItem(key: string) {
    const secured = await SecureStore.getItemAsync(key, options);
    if (secured !== null) {
      await AsyncStorage.removeItem(key);
      return secured;
    }
    const legacy = await AsyncStorage.getItem(key);
    if (legacy !== null) {
      await SecureStore.setItemAsync(key, legacy, options);
      await AsyncStorage.removeItem(key);
    }
    return legacy;
  },
  async setItem(key: string, value: string) {
    await SecureStore.setItemAsync(key, value, options);
    await AsyncStorage.removeItem(key);
  },
  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(key, options);
    await AsyncStorage.removeItem(key);
  },
};
