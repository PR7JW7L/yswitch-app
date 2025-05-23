import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { StorageKeys, storageService } from "@/lib/storage";
import { serverApi } from "@/lib/api";
import { getConfiguredDevices } from "@/lib/device";

export default function HomeScreen() {
  const [serverUrl, setServerUrl] = useState("http://172.16.1.64:6969");
  const [isLoading, setIsLoading] = useState(false);
  const [configuredDevices, setConfiguredDevices] = useState<
    Record<string, any>
  >({});

  useEffect(() => {
    const savedUrl = storageService.getString(StorageKeys.SERVER_URL);
    if (savedUrl) {
      setServerUrl(savedUrl);
      serverApi.setServerUrl(savedUrl);
    }

    setConfiguredDevices(getConfiguredDevices());
  }, []);

  const handleServerUrlSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert("Error", "Please enter a valid server URL");
      return;
    }

    setIsLoading(true);
    try {
      serverApi.setServerUrl(serverUrl.trim());
      const response = await serverApi.getMqttConfig();

      if (response.success && response.data) {
        storageService.setString(StorageKeys.SERVER_URL, serverUrl.trim());
        storageService.setObject(StorageKeys.MQTT_CONFIG, response.data);
        Alert.alert("Success", "Server URL saved and MQTT config retrieved!");
      } else {
        Alert.alert("Error", response.message || "Failed to connect to server");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to connect to server. Please check the URL.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startDeviceConfiguration = () => {
    const savedUrl = storageService.getString(StorageKeys.SERVER_URL);
    if (!savedUrl) {
      Alert.alert("Error", "Please set up server URL first");
      return;
    }
    router.push("/scan-devices");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter server URL (e.g., https://api.example.com)"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleServerUrlSave}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? "Connecting..." : "Save & Test Connection"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Configuration</Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={startDeviceConfiguration}>
            <Text style={styles.buttonText}>Configure New Device</Text>
          </TouchableOpacity>
        </View>

        {Object.keys(configuredDevices).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configured Devices</Text>
            {Object.entries(configuredDevices).map(([deviceId, config]) => (
              <TouchableOpacity
                key={deviceId}
                style={styles.deviceItem}
                onPress={() =>
                  router.push(`/device-control?deviceId=${deviceId}`)
                }>
                <Text style={styles.deviceId}>{deviceId}</Text>
                <Text style={styles.deviceDate}>
                  Configured:{" "}
                  {new Date(config.configuredAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  secondaryButton: {
    backgroundColor: "#059669",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deviceItem: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deviceDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
