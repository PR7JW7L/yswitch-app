import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { StorageKeys, storageService } from "@/lib/storage";
import { getConfiguredDevices } from "@/services/device-storage";
import { deviceOperationsService } from "@/services/device-operations";
import { authService } from "@/services/auth";

function HomeScreenContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [configuredDevices, setConfiguredDevices] = useState<
    Record<string, any>
  >({});

  useEffect(() => {
    setConfiguredDevices(getConfiguredDevices());
  }, []);

  const handleServerUrlSave = async () => {
    setIsLoading(true);
    try {
      const response = await deviceOperationsService.getMqttConfig();

      if (response.success && response.data) {
        storageService.setObject(StorageKeys.MQTT_CONFIG, response.data);
        Alert.alert("Success", "Server URL saved and MQTT config retrieved!");
      } else {
        Alert.alert("Error", response.message || "Failed to connect to server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
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
            onPress={() => router.push("/scan-devices")}>
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

export default function HomeScreen() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      router.navigate("/login");
    } else {
      setReady(true);
    }
  }, []);
  if (!ready) return null;
  return <HomeScreenContent />;
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
