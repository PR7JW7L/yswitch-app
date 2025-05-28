import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { authService } from "@/services/auth";
import { useGetSavedDevices } from "@/hooks/useGetSavedDevices";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetMqttConfig } from "@/hooks/useGetMqttConfig";
import { StorageKeys, storageService } from "@/lib/storage";
import { ServerMqttConfig } from "@/services/device-control";
import { useFocusEffect } from "@react-navigation/native";

function HomeScreenContent() {
  const [mqttConfigLocal, setMqttConfigLocal] = useState<ServerMqttConfig>();
  const {
    data: savedDevices,
    isLoading: loadingSavedDevices,
    isRefetching: refetchingSavedDevices,
    refetch: refetchSavedDevices,
  } = useGetSavedDevices();

  const { refetch: refetchMqttConfig } = useGetMqttConfig({});

  useEffect(() => {
    const savedMqttConfig = storageService.getObject<ServerMqttConfig>(
      StorageKeys.MQTT_CONFIG,
    );
    if (savedMqttConfig) setMqttConfigLocal(savedMqttConfig);
  }, []);

  if (!mqttConfigLocal) {
    return (
      <View style={{ padding: 16, backgroundColor: "white", flex: 1 }}>
        <TouchableOpacity
          onPress={() =>
            refetchMqttConfig().then((data) => {
              if (data) setMqttConfigLocal(data);
            })
          }
          style={{
            alignItems: "center",
            borderRadius: 999,
            backgroundColor: "#259d9d",
            padding: 16,
          }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Check Server Status
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={{ width: 40 }}
              onPress={() =>
                authService.logout(() => router.navigate("/login"))
              }>
              <MaterialCommunityIcons name="logout" size={20} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refetchingSavedDevices || loadingSavedDevices}
            onRefresh={refetchSavedDevices}
          />
        }>
        {!!savedDevices && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Devices</Text>
            {savedDevices?.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() =>
                  router.navigate(`/device-control?deviceId=${device.name}`)
                }>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceId}>{device.name}</Text>
                  <Text style={styles.deviceDate}>
                    Updated: {new Date(device.updatedAt).toLocaleString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.deviceStatusDot,
                    device.status === "ON" ? styles.statusOn : styles.statusOff,
                  ]}
                />
              </TouchableOpacity>
            ))}
            {!savedDevices.length && (
              <Text>No devices found. Add a new device to get started.</Text>
            )}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.navigate("/scan-devices")}>
          <Text style={styles.buttonText}>Add New Device</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const [ready, setReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const user = authService.getUser();
      if (!user) {
        router.navigate("/login");
      } else {
        setReady(true);
      }
    }, []),
  );
  if (!ready) return null;
  return <HomeScreenContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
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
    flexDirection: "row",
    gap: 12,
    padding: 15,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  deviceInfo: {
    flex: 1,
    overflow: "hidden",
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
  deviceStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
  },
  statusOn: {
    backgroundColor: "#07cb8e",
  },
  statusOff: {
    backgroundColor: "#ef4444",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
  },
});
