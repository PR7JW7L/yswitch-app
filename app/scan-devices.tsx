import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useWiFi, WiFiNetwork } from "@/hooks/useWifi";

export default function ScanDevicesScreen() {
  const { networks, isScanning, scanNetworks, connectToNetwork, isConnecting } =
    useWiFi();

  const filteredNetworks = useMemo(
    () =>
      networks.filter((network) =>
        network.SSID.toLowerCase().includes("tasmota"),
      ),
    [networks],
  );

  const handleScan = useCallback(async () => {
    try {
      await scanNetworks();
    } catch (error) {
      console.error("Failed to scan WiFi networks:", error);
      Alert.alert(
        "Error",
        "Failed to scan WiFi networks. Please check permissions.",
      );
    }
  }, [scanNetworks]);

  const handleConnectToDevice = useCallback(
    async (network: WiFiNetwork) => {
      try {
        const success = await connectToNetwork(network.SSID, "");

        if (success) {
          Alert.alert(
            "Connected",
            `Connected to ${network.SSID}. You can now configure the device.`,
            [
              {
                text: "Configure Device",
                onPress: () =>
                  router.replace(`/configure-device?ssid=${network.SSID}`),
              },
            ],
          );
        } else {
          Alert.alert(
            "Connection Failed",
            "Could not connect to the device network.",
          );
        }
      } catch (error) {
        console.error("Failed to connect to device network:", error);
        Alert.alert("Error", "Failed to connect to device network.");
      }
    },
    [connectToNetwork],
  );

  const renderNetworkItem = useCallback(
    ({ item }: { item: WiFiNetwork }) => (
      <TouchableOpacity
        style={styles.networkItem}
        onPress={() => handleConnectToDevice(item)}
        disabled={isConnecting}>
        <View style={styles.networkInfo}>
          <Text style={styles.networkName}>{item.SSID}</Text>
          <Text style={styles.networkDetails}>
            Signal: {item.level}dBm | {item.capabilities}
          </Text>
        </View>
        {isConnecting && <ActivityIndicator size="small" color="#2563eb" />}
      </TouchableOpacity>
    ),
    [handleConnectToDevice, isConnecting],
  );

  useEffect(() => {
    // Auto-scan on mount
    void handleScan();
  }, [handleScan]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Scan for device networks (Tasmota-*)
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          disabled={isScanning}>
          <Text style={styles.scanButtonText}>
            {isScanning ? "Scanning..." : "Scan Again"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNetworks}
        renderItem={renderNetworkItem}
        keyExtractor={(item) => item.BSSID}
        refreshControl={
          <RefreshControl refreshing={isScanning} onRefresh={handleScan} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isScanning
                ? "Scanning for devices..."
                : "No device networks found"}
            </Text>
            <Text style={styles.emptySubtext}>
              Make sure your device is in configuration mode and try scanning
              again.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap on a network to connect and configure the device
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
  },
  networkItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  networkDetails: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
