import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { generateDeviceId, saveDeviceConfiguration } from "@/lib/device";
import { deviceApi } from "@/lib/tasmota";
import { StorageKeys, storageService } from "@/lib/storage";
import WifiManager from "react-native-wifi-reborn";

function waitForDevice(timeout = 5_000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export default function ConfigureDeviceScreen() {
  const { ssid } = useLocalSearchParams<{ ssid: string }>();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [configurationStep, setConfigurationStep] = useState(-1);
  const [mqttConfig, setMqttConfig] = useState<any>(null);

  useEffect(() => {
    const id = generateDeviceId();
    setDeviceId(id);
    const savedMqttConfig = storageService.getObject(StorageKeys.MQTT_CONFIG);
    setMqttConfig(savedMqttConfig);
  }, []);

  const configurationSteps = [
    { title: "Connect to Device", description: "Establishing connection..." },
    { title: "Configure GPIO", description: "Setting up GPIO pins..." },
    { title: "Configure MQTT", description: "Setting up MQTT connection..." },
    { title: "Complete", description: "Configuration completed!" },
  ];

  const handleStartConfiguration = async () => {
    if (!mqttConfig) {
      Alert.alert(
        "Error",
        "MQTT configuration not found. Please set up server connection first.",
      );
      return;
    }

    setIsConfiguring(true);
    setConfigurationStep(0);

    try {
      // Step 1: Test device connection
      setConfigurationStep(0);
      const deviceInfo = await deviceApi.getDeviceInfo();
      if (!deviceInfo.success) throw new Error("Cannot connect to device");

      // Step 2: Configure GPIO
      setConfigurationStep(1);
      const gpioResult = await deviceApi.configureGPIO();
      if (!gpioResult.success) throw new Error("GPIO configuration failed");

      await waitForDevice();
      await WifiManager.connectToProtectedSSID(ssid, "", false, false);
      await waitForDevice();

      // Step 3: Configure MQTT
      setConfigurationStep(2);
      const mqttResult = await deviceApi.configureMQTT(
        {
          host: mqttConfig.host,
          port: parseInt(mqttConfig.port),
          username: mqttConfig.username,
          password: mqttConfig.password,
        },
        deviceId,
      );
      await waitForDevice();

      if (!mqttResult.success) throw new Error("MQTT configuration failed");

      // Step 4: Complete
      setConfigurationStep(3);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save device configuration
      saveDeviceConfiguration(deviceId, {
        ssid: ssid,
        mqttConfig,
        configuredAt: new Date().toISOString(),
      });

      Alert.alert(
        "Configuration Complete!",
        `Device ${deviceId} has been configured successfully. You can now connect it to your home WiFi network.`,
        [
          {
            text: "Setup WiFi",
            onPress: () => router.push(`/wifi-setup?deviceId=${deviceId}`),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Configuration Failed",
        error instanceof Error ? error.message : "Unknown error occurred",
      );
      setConfigurationStep(-1);
    } finally {
      setIsConfiguring(false);
    }
  };

  const renderConfigurationStep = (step: any, index: number) => {
    const isActive = index === configurationStep;
    const isCompleted = index < configurationStep;
    const isUpcoming = index > configurationStep;

    return (
      <View key={index} style={styles.stepContainer}>
        <View
          style={[
            styles.stepIndicator,
            isCompleted && styles.stepCompleted,
            isActive && styles.stepActive,
          ]}>
          {isCompleted ? (
            <Text style={styles.stepCheckmark}>✓</Text>
          ) : isActive ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text
              style={[
                styles.stepNumber,
                isUpcoming && styles.stepNumberUpcoming,
              ]}>
              {index + 1}
            </Text>
          )}
        </View>
        <View style={styles.stepContent}>
          <Text
            style={[
              styles.stepTitle,
              isActive && styles.stepTitleActive,
              isCompleted && styles.stepTitleCompleted,
            ]}>
            {step.title}
          </Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Device Configuration</Text>
          <Text style={styles.headerSubtitle}>Connected to: {ssid}</Text>
          <Text style={styles.deviceIdText}>Device ID: {deviceId}</Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Configuration Steps</Text>
          {configurationSteps.map((step, index) =>
            renderConfigurationStep(step, index),
          )}
        </View>

        {!isConfiguring && configurationStep === -1 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartConfiguration}>
            <Text style={styles.startButtonText}>Start Configuration</Text>
          </TouchableOpacity>
        )}

        {configurationStep === 3 && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Configuration Complete!</Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => router.push(`/wifi-setup?deviceId=${deviceId}`)}>
              <Text style={styles.nextButtonText}>Setup WiFi Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>
            What happens during configuration:
          </Text>
          <Text style={styles.infoText}>
            • Connect to the device&#39;s access point{"\n"}• Configure GPIO
            pins for LED and Relay control{"\n"}• Set up MQTT connection
            parameters
            {"\n"}• Prepare device for home network connection
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
  header: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  deviceIdText: {
    fontSize: 14,
    color: "#999",
    fontFamily: "monospace",
  },
  stepsContainer: {
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
  stepsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  stepActive: {
    backgroundColor: "#2563eb",
  },
  stepCompleted: {
    backgroundColor: "#059669",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  stepNumberUpcoming: {
    color: "#999",
  },
  stepCheckmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  stepTitleActive: {
    color: "#2563eb",
  },
  stepTitleCompleted: {
    color: "#059669",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
  },
  startButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    backgroundColor: "#d1fae5",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#059669",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: "#059669",
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#fff3cd",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
});
