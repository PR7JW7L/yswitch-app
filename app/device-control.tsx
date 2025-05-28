import React from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { deviceControl } from "@/services/device-control";
import { useApi } from "@/hooks/useApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DeviceControlScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const { data, isLoading, isRefetching, refetch } = useApi(
    () => deviceControl.getDevice(deviceId).then((r) => r.data),
    { onFocus: true },
    [],
  );

  const isDeviceOn = data?.status === "ON";

  const handleToggleDevice = async () => {
    if (!deviceId) {
      Alert.alert("Error", "Device ID not found");
      return;
    }
    try {
      const { success, message } = isDeviceOn
        ? await deviceControl.turnDeviceOff(deviceId)
        : await deviceControl.turnDeviceOn(deviceId);

      if (success) {
        void refetch();
      } else Alert.alert("Error", message || "Failed to control device");
    } finally {
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
                router.back();
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

  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size={28} />
      </View>
    );

  if (!data)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 16, gap: 8 }}>
        <Text style={{ textAlign: "center" }}>Device not found</Text>
        <Button
          onPress={() =>
            router.canGoBack() ? router.back() : router.navigate("/")
          }
          title="Back to Home"
        />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={handleRemoveDevice}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View style={styles.header}>
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
            <Switch
              value={isDeviceOn}
              onValueChange={handleToggleDevice}
              disabled={isLoading}
              trackColor={{ false: "#767577", true: "#059669" }}
              thumbColor={isDeviceOn ? "#ffffff" : "#f4f3f4"}
            />
          </View>
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
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  deviceIdText: {
    fontSize: 16,
    color: "#000000",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#999",
  },
  statusSection: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
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
    padding: 16,
    marginBottom: 16,
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
    padding: 16,
    marginBottom: 16,
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
