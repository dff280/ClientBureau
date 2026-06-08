import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { AuthProvider } from "@/providers/auth-provider"

export { ErrorBoundary } from "expo-router"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#07111f" },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "800" },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="tools/contracts" options={{ title: "Contracts" }} />
          <Stack.Screen name="tools/recovery" options={{ title: "Payment Recovery" }} />
          <Stack.Screen name="tools/lien-service" options={{ title: "Florida Lien Service" }} />
          <Stack.Screen name="tools/evidence" options={{ title: "Evidence Vault" }} />
          <Stack.Screen name="tools/watchlist" options={{ title: "Watchlist" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
