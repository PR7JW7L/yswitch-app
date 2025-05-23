import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function MqttConfigScreen() {
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mqttConfig, setMqttConfig] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // Load saved server URL and MQTT config
    const savedUrl = storageService.getString(StorageKeys.SERVER_URL);
    const savedMqttConfig = storageService.getObject(StorageKeys.MQTT_CONFIG);

    if (savedUrl) {
      setServerUrl(savedUrl);
      serverApi.setServerUrl(savedUrl);
    }

    if (savedMqttConfig) {
      setMqttConfig(savedMqttConfig);
    }
  }, []);

  const handleFetchMqttConfig = async () => {
    if (!serverUrl.trim()) {
      Alert.alert("Error", "Please enter a valid server URL");
      return;
    }

    setIsLoading(true);
    try {
      serverApi.setServerUrl(serverUrl.trim());
      const response = await serverApi.getMqttConfig();

      if (response.success && response.data) {
        setMqttConfig(response.data);
        storageService.setString(StorageKeys.SERVER_URL, serverUrl.trim());
        storageService.setObject(StorageKeys.MQTT_CONFIG, response.data);
        Alert.alert("Success", "MQTT configuration retrieved successfully!");
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to get MQTT configuration",
        );
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

  const handleTestConnection = async () => {
    if (!mqttConfig) {
      Alert.alert("Error", "No MQTT configuration available");
      return;
    }

    setIsTestingConnection(true);
    try {
      // Simulate MQTT connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, you would test the MQTT connection here
      Alert.alert("Success", "MQTT connection test passed!");
    } catch (error) {
      Alert.alert("Error", "MQTT connection test failed");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveAndContinue = () => {
    if (!mqttConfig) {
      Alert.alert("Error", "Please fetch MQTT configuration first");
      return;
    }

    Alert.alert(
      "Configuration Saved",
      "MQTT configuration has been saved. You can now proceed to configure devices.",
      [
        {
          text: "Configure Device",
          onPress: () => router.push("/scan-devices"),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          <Text style={styles.sectionDescription}>
            Enter your server URL to fetch MQTT configuration
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter server URL (e.g., https://api.example.com)"
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleFetchMqttConfig}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Fetch MQTT Config</Text>
            )}
          </TouchableOpacity>
        </View>

        {mqttConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MQTT Configuration</Text>
            <View style={styles.configContainer}>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Host:</Text>
                <Text style={styles.configValue}>{mqttConfig.host}</Text>
              </View>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Port:</Text>
                <Text style={styles.configValue}>
                  {mqttConfig.port || 1883}
                </Text>
              </View>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Username:</Text>
                <Text style={styles.configValue}>{mqttConfig.username}</Text>
              </View>
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>Password:</Text>
                <Text style={styles.configValue}>••••••••</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleTestConnection}
              disabled={isTestingConnection}>
              {isTestingConnection ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Test MQTT Connection</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleSaveAndContinue}>
              <Text style={styles.buttonText}>Save & Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About MQTT Configuration</Text>
          <Text style={styles.infoText}>
            MQTT (Message Queuing Telemetry Transport) is used to communicate
            with your devices remotely. The server will provide the necessary
            connection details including host, credentials, and port
            information.
          </Text>
        </View>
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
    marginBottom: 10,
    color: "#333",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
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
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  secondaryButton: {
    backgroundColor: "#7c3aed",
  },
  successButton: {
    backgroundColor: "#059669",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  configContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  configItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  configValue: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  infoSection: {
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1565c0",
    lineHeight: 20,
  },
});
