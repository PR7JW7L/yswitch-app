import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

// eslint-disable-next-line @typescript-eslint/no-require-imports
if (__DEV__) require("../ReactotronConfig");

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#2563eb" },
          headerTintColor: "#fff",
        }}>
        <Stack.Screen
          name="index"
          options={{ title: "Device Configuration" }}
        />

        <Stack.Screen
          name="scan-devices"
          options={{
            title: "Scan Devices",
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />

        <Stack.Screen
          name="configure-device"
          options={{ title: "Configure Device" }}
        />

        <Stack.Screen name="wifi-setup" options={{ title: "WiFi Setup" }} />

        <Stack.Screen
          name="device-control"
          options={{ title: "Device Control" }}
        />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
