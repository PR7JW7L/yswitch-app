import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const StorageKeys = {
  SERVER_URL: "server_url",
  DEVICE_ID: "device_id",
  MQTT_CONFIG: "mqtt_config",
  WIFI_CREDENTIALS: "wifi_credentials",
  CONFIGURED_DEVICES: "configured_devices",
  ACCESS_TOKEN: "accessToken",
  USER: "user",
} as const;

export const storageService = {
  setString: (key: string, value: string) => {
    storage.set(key, value);
  },

  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  setObject: (key: string, value: object) => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  delete: (key: string) => {
    storage.delete(key);
  },

  clear: () => {
    storage.clearAll();
  },
};
