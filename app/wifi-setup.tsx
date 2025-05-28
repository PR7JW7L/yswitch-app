import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import WifiManager from "react-native-wifi-reborn";
import { useWiFi, WiFiNetwork } from "@/hooks/useWifi";
import { isValidPassword, isValidSSID } from "@/services/device-storage";
import { StorageKeys, storageService } from "@/lib/storage";
import { PasswordInput } from "@/components/PasswordInput";
import { deviceSetup } from "@/services/device-setup";
import { deviceControl } from "@/services/device-control";

export default function WiFiSetupScreen() {
  const { deviceId } = useLocalSearchParams<{
    deviceId: string;
  }>();
  const { networks, isScanning, scanNetworks } = useWiFi();
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(
    null,
  );
  const [manualSSID, setManualSSID] = useState("");
  const [password, setPassword] = useState("wifipassword@yarsalabs");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [configurationSent, setConfigurationSent] = useState(false);

  const handleScanNetworks = async () => {
    try {
      await scanNetworks();
    } catch (error) {
      console.error("Failed to scan WiFi networks:", error);
      Alert.alert("Error", "Failed to scan WiFi networks");
    }
  };

  const handleNetworkSelect = (network: WiFiNetwork) => {
    setSelectedNetwork(network);
    setManualSSID("");
    setShowManualEntry(false);
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
    setSelectedNetwork(null);
  };

  const handleConnectDevice = async () => {
    const homeWifiSSID = selectedNetwork?.SSID || manualSSID;

    if (!homeWifiSSID || !isValidSSID(homeWifiSSID)) {
      Alert.alert("Error", "Please select a network or enter a valid SSID");
      return;
    }

    if (!password || !isValidPassword(password)) {
      Alert.alert("Error", "Password must be between 8-63 characters");
      return;
    }

    await WifiManager.connectToProtectedSSID(deviceId, "", false, false);
    setIsConnecting(true);
    try {
      // Send the HOME WiFi credentials to the device while connected to device hotspot
      const result = await deviceSetup.configureWifi(homeWifiSSID, password);

      if (result.success) {
        setConfigurationSent(true);
        Alert.alert(
          "WiFi Configuration Sent",
          `The device will now attempt to connect to "${homeWifiSSID}". Please connect your phone to "${homeWifiSSID}" to complete device registration.`,
          [
            {
              text: "Switch to Home WiFi",
              onPress: () => switchToHomeWiFi(homeWifiSSID),
            },
          ],
        );
      } else {
        Alert.alert("Error", "Failed to configure WiFi on device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send WiFi configuration to device");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToHomeWiFi = async (targetSSID: string) => {
    try {
      // Attempt to connect to the selected home WiFi network
      await WifiManager.connectToProtectedSSID(
        targetSSID,
        password,
        false,
        false,
      );

      // Give some time for connection to establish
      setTimeout(() => {
        verifyHomeWiFiConnection(targetSSID);
      }, 3000);
    } catch (error) {
      console.error("Failed to switch to home WiFi:", error);
      Alert.alert(
        "Manual Connection Required",
        `Please manually connect to "${targetSSID}" network and then tap "Register Device" below.`,
      );
    }
  };

  const verifyHomeWiFiConnection = async (expectedSSID: string) => {
    try {
      const currentSSID = await WifiManager.getCurrentWifiSSID();
      if (currentSSID === expectedSSID) {
        Alert.alert(
          "Connected Successfully",
          `You are now connected to "${expectedSSID}". You can proceed with device registration.`,
          [{ text: "Ok" }],
        );
      } else {
        Alert.alert(
          "Connection Verification",
          `Please ensure you are connected to "${expectedSSID}" network before registering the device.`,
        );
      }
    } catch (error) {
      console.error("Failed to verify home WiFi connection:", error);
    }
  };

  const handleRegisterDevice = async () => {
    if (!deviceId) {
      Alert.alert("Error", "Device ID not found");
      return;
    }
    setIsRegistering(true);
    try {
      const result = await deviceControl.registerDevice(deviceId);
      if (result.success) {
        storageService.setObject(StorageKeys.WIFI_CREDENTIALS, {
          ssid: selectedNetwork?.SSID || manualSSID,
          savedAt: new Date().toISOString(),
        });

        Alert.alert(
          "Device Registered Successfully!",
          `Device ${deviceId} has been registered with the server and is ready for use.`,
          [
            {
              text: "Control Device",
              onPress: () =>
                router.replace(`/device-control?deviceId=${deviceId}`),
            },
            {
              text: "Back to Home",
              onPress: () => router.replace("/"),
            },
          ],
        );
      } else {
        Alert.alert("Error", result.message || "Failed to register device");
      }
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        "Failed to register device with server. Please ensure you're connected to your home WiFi network.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    // Check initial connection and auto-scan networks on mount
    void handleScanNetworks();
  }, []);

  const renderNetworkItem = ({ item }: { item: WiFiNetwork }) => (
    <TouchableOpacity
      style={[
        styles.networkItem,
        selectedNetwork?.SSID === item.SSID && styles.networkItemSelected,
      ]}
      onPress={() => handleNetworkSelect(item)}>
      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>{item.SSID}</Text>
        <Text style={styles.networkDetails}>
          Signal: {item.level}dBm |{" "}
          {item.capabilities.includes("WPA") ? "Secured" : "Open"}
        </Text>
      </View>
      {selectedNetwork?.SSID === item.SSID && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>WiFi Setup</Text>
          <Text style={styles.headerSubtitle}>Device ID: {deviceId}</Text>
          <Text style={styles.headerDescription}>
            {configurationSent
              ? "Configuration sent! Connect to your home WiFi to complete setup."
              : "Connect your device to your home WiFi network"}
          </Text>
        </View>

        {!configurationSent && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Networks</Text>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanNetworks}
                  disabled={isScanning}>
                  <Text style={styles.scanButtonText}>
                    {isScanning ? "Scanning..." : "Refresh"}
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={networks.filter((n) => n.SSID && n.SSID.trim() !== "")}
                renderItem={renderNetworkItem}
                keyExtractor={(item) => item.BSSID}
                style={styles.networkList}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {isScanning
                      ? "Scanning for networks..."
                      : "No networks found"}
                  </Text>
                }
              />

              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleManualEntry}>
                <Text style={styles.manualButtonText}>
                  Enter Network Manually
                </Text>
              </TouchableOpacity>
            </View>

            {showManualEntry && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manual Network Entry</Text>
                <TextInput
                  style={styles.input}
                  placeholder="WiFi Network Name (SSID)"
                  value={manualSSID}
                  onChangeText={setManualSSID}
                  maxLength={32}
                />
              </View>
            )}

            {(selectedNetwork || showManualEntry) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>WiFi Password</Text>
                <Text style={styles.selectedNetworkText}>
                  Network: {selectedNetwork?.SSID || manualSSID}
                </Text>

                <PasswordInput
                  style={styles.input}
                  placeholder="Enter WiFi password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  maxLength={63}
                />

                <TouchableOpacity
                  style={[styles.button, styles.connectButton]}
                  onPress={handleConnectDevice}
                  disabled={isConnecting || isRegistering}>
                  {isConnecting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Connect Device to WiFi
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.registerSection}>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={handleRegisterDevice}
            disabled={isRegistering || isConnecting}>
            {isRegistering ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Register Device with Server</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.registerNote}>
            {configurationSent
              ? "Complete device registration after connecting to your home WiFi"
              : "Skip WiFi setup and register device directly if already connected"}
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
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
    marginBottom: 10,
  },
  headerDescription: {
    fontSize: 14,
    color: "#666",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scanButton: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scanButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  networkList: {
    maxHeight: 200,
  },
  networkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  networkItemSelected: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  networkInfo: {
    flex: 1,
  },
  networkName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  networkDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  selectedIndicator: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
  manualButton: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  manualButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedNetworkText: {
    fontSize: 14,
    color: "#2563eb",
    marginBottom: 10,
    fontWeight: "bold",
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
  connectButton: {
    backgroundColor: "#2563eb",
  },
  registerButton: {
    backgroundColor: "#059669",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerSection: {
    backgroundColor: "#f0fdf4",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#059669",
  },
  registerNote: {
    fontSize: 12,
    color: "#065f46",
    textAlign: "center",
    marginTop: 10,
  },
});
