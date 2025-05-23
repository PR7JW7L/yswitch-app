import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getConfiguredDevices } from "@/lib/device";
import { serverApi } from "@/lib/api";
import { StorageKeys, storageService } from "@/lib/storage";

export default function DeviceControlScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const [isDeviceOn, setIsDeviceOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (deviceId) {
      loadDeviceConfig();
      // Auto-refresh device status every 30 seconds
      const interval = setInterval(() => {
        // In a real app, you would fetch device status from server
        setLastUpdate(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [deviceId]);

  const loadDeviceConfig = () => {
    const configuredDevices = getConfiguredDevices();
    if (deviceId && configuredDevices[deviceId]) {
      setDeviceConfig(configuredDevices[deviceId]);
    }
  };

  const handleToggleDevice = async () => {
    if (!deviceId) {
      Alert.alert("Error", "Device ID not found");
      return;
    }

    setIsLoading(true);
    try {
      const result = isDeviceOn
        ? await serverApi.turnDeviceOff(deviceId)
        : await serverApi.turnDeviceOn(deviceId);

      if (result.success) {
        setIsDeviceOn(!isDeviceOn);
        setLastUpdate(new Date());
      } else {
        Alert.alert("Error", result.message || "Failed to control device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to communicate with device");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnOn = async () => {
    if (!deviceId || isLoading) return;

    setIsLoading(true);
    try {
      const result = await serverApi.turnDeviceOn(deviceId);
      console.log({ result });
      if (result.success) {
        setIsDeviceOn(true);
        setLastUpdate(new Date());
        Alert.alert("Success", "Device turned ON");
      } else {
        Alert.alert("Error", result.message || "Failed to turn device on");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to turn device on");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurnOff = async () => {
    if (!deviceId || isLoading) return;

    setIsLoading(true);
    try {
      const result = await serverApi.turnDeviceOff(deviceId);
      if (result.success) {
        setIsDeviceOn(false);
        setLastUpdate(new Date());
        Alert.alert("Success", "Device turned OFF");
      } else {
        Alert.alert("Error", result.message || "Failed to turn device off");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to turn device off");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    // In a real app, you would fetch the actual device status
    setLastUpdate(new Date());
    Alert.alert("Status Updated", "Device status has been refreshed");
  };

  const handleRemoveDevice = () => {
    Alert.alert(
      "Remove Device",
      "Are you sure you want to remove this device? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            // Remove device from storage
            const devices = getConfiguredDevices();
            if (deviceId && devices[deviceId]) {
              delete devices[deviceId];
              storageService.setObject(StorageKeys.CONFIGURED_DEVICES, devices);
            }
            router.push("/");
          },
        },
      ],
    );
  };

  if (!deviceId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Device ID not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/")}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Device Control</Text>
          <Text style={styles.deviceIdText}>{deviceId}</Text>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Device Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Power:</Text>
              <View style={styles.statusValue}>
                <View
                  style={[
                    styles.statusIndicator,
                    isDeviceOn ? styles.statusOn : styles.statusOff,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    isDeviceOn ? styles.statusTextOn : styles.statusTextOff,
                  ]}>
                  {isDeviceOn ? "ON" : "OFF"}
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Connection:</Text>
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Device Controls</Text>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Power Toggle</Text>
            <Switch
              value={isDeviceOn}
              onValueChange={handleToggleDevice}
              disabled={isLoading}
              trackColor={{ false: "#767577", true: "#059669" }}
              thumbColor={isDeviceOn ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.onButton]}
              onPress={handleTurnOn}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Turn ON</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.offButton]}
              onPress={handleTurnOff}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Turn OFF</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {deviceConfig && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Device Information</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>
                  {deviceConfig.name || "Unknown"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>
                  {deviceConfig.type || "Generic Device"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>
                  {deviceConfig.location || "Not specified"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>
                  {deviceConfig.model || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshStatus}>
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveDevice}>
            <Text style={styles.removeButtonText}>Remove Device</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  deviceIdText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#999",
  },
  statusSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 16,
    color: "#666",
  },
  statusValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOn: {
    backgroundColor: "#10b981",
  },
  statusOff: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusTextOn: {
    color: "#10b981",
  },
  statusTextOff: {
    color: "#ef4444",
  },
  controlSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  onButton: {
    backgroundColor: "#10b981",
  },
  offButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  removeButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
