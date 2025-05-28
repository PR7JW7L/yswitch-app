import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { deviceControl } from "@/services/device-control";
import { useFocusApi } from "@/hooks/useFocusApi";

export default function DeviceControlScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { data, loading, refetch } = useFocusApi(
    () => deviceControl.getDevice(deviceId).then((r) => r.data),
    [],
  );
  const isDeviceOn = data?.status === "ON";
  const handleToggleDevice = async () => {
    if (!deviceId) {
      Alert.alert("Error", "Device ID not found");
      return;
    }
    setIsLoading(true);
    try {
      const { success, message } = isDeviceOn
        ? await deviceControl.turnDeviceOff(deviceId)
        : await deviceControl.turnDeviceOn(deviceId);

      if (success) {
        refetch();
      } else Alert.alert("Error", message || "Failed to control device");
    } finally {
      setIsLoading(false);
    }
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
            deviceControl.removeDevice(deviceId).then(({ success }) => {
              if (success) {
                router.navigate("/");
              } else {
                Alert.alert("Error", "Failed to remove device");
              }
            });
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
            onPress={() => router.navigate("/")}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <Text>Please wait...</Text>;
  if (!data) return <Text>Failed to get data</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Device Control</Text>
          <Text style={styles.deviceIdText}>{data.name}</Text>
          {data.updatedAt ? (
            <Text style={styles.lastUpdateText}>
              Updated: {new Date(data.updatedAt).toLocaleString()}
            </Text>
          ) : null}
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>Device Controls</Text>
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
        </View>

        <View style={styles.actionSection}>
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
