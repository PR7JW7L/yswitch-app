import { useApi, UseApiOptions } from "@/hooks/useApi";
import { deviceControl } from "@/services/device-control";
import { StorageKeys, storageService } from "@/lib/storage";
import { Alert } from "react-native";

export function useGetMqttConfig(options: UseApiOptions) {
  return useApi(
    () =>
      deviceControl.getMqttConfig().then((response) => {
        if (response.success && response.data) {
          storageService.setObject(StorageKeys.MQTT_CONFIG, response.data);
          Alert.alert("Success", "Server URL saved and MQTT config retrieved!");
        } else {
          Alert.alert(
            "Error",
            response.message || "Failed to connect to server",
          );
        }
        return response.data;
      }),
    options,
    [],
  );
}
