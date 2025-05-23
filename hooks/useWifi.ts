import { useCallback, useState } from "react";
import WifiManager from "react-native-wifi-reborn";
import { PermissionsAndroid } from "react-native";

export interface WiFiNetwork {
  SSID: string;
  BSSID: string;
  capabilities: string;
  frequency: number;
  level: number;
  timestamp: number;
}

export const useWiFi = () => {
  const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentSSID, setCurrentSSID] = useState<string | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      return Object.values(granted).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED,
      );
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  }, []);

  const scanNetworks = useCallback(async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      throw new Error("WiFi permissions not granted");
    }

    setIsScanning(true);
    try {
      const wifiList = await WifiManager.loadWifiList();
      setNetworks(wifiList);
      return wifiList;
    } catch (error) {
      console.error("WiFi scan failed:", error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  }, [requestPermissions]);

  const connectToNetwork = useCallback(
    async (ssid: string, password: string) => {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        throw new Error("WiFi permissions not granted");
      }

      setIsConnecting(true);
      try {
        await WifiManager.connectToProtectedSSID(ssid, password, false, false);
        setCurrentSSID(ssid);
        return true;
      } catch (error) {
        console.error("WiFi connection failed:", error);
        throw error;
      } finally {
        setIsConnecting(false);
      }
    },
    [requestPermissions],
  );

  const getCurrentSSID = useCallback(async () => {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();
      setCurrentSSID(ssid);
      return ssid;
    } catch (error) {
      console.error("Failed to get current SSID:", error);
      return null;
    }
  }, []);

  const disconnectFromNetwork = useCallback(async () => {
    try {
      await WifiManager.disconnect();
      setCurrentSSID(null);
      return true;
    } catch (error) {
      console.error("WiFi disconnection failed:", error);
      return false;
    }
  }, []);

  return {
    networks,
    isScanning,
    isConnecting,
    currentSSID,
    scanNetworks,
    connectToNetwork,
    getCurrentSSID,
    disconnectFromNetwork,
  };
};
