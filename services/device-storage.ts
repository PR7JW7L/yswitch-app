import { StorageKeys, storageService } from "@/lib/storage";

export const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `device-${timestamp}-${randomStr}`;
};

export const saveDeviceConfiguration = (deviceId: string, config: any) => {
  const devices =
    storageService.getObject<Record<string, any>>(
      StorageKeys.CONFIGURED_DEVICES,
    ) || {};
  devices[deviceId] = {
    ...config,
    configuredAt: new Date().toISOString(),
  };
  storageService.setObject(StorageKeys.CONFIGURED_DEVICES, devices);
};

export const getConfiguredDevices = (): Record<string, any> => {
  return (
    storageService.getObject<Record<string, any>>(
      StorageKeys.CONFIGURED_DEVICES,
    ) || {}
  );
};

export const isValidSSID = (ssid: string): boolean => {
  return ssid.length > 0 && ssid.length <= 32;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && password.length <= 63;
};
