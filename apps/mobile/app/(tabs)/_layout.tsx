import { Redirect, Tabs } from "expo-router"
import * as Haptics from "expo-haptics"
import { BriefcaseBusiness, FileText, Home, Search, UserCircle, type LucideIcon } from "lucide-react-native"
import type { ColorValue } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { LoadingState } from "@/components/ui"
import { useAuth } from "@/providers/auth-provider"

function TabIcon({ icon: Icon, color }: { icon: LucideIcon; color: ColorValue }) {
  return <Icon color={String(color)} size={22} strokeWidth={2.4} />
}

export default function TabLayout() {
  const { loading, session } = useAuth()
  const insets = useSafeAreaInsets()
  const bottomInset = Math.max(insets.bottom, 10)

  if (loading) return <LoadingState />
  if (!session) return <Redirect href="/login" />

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync().catch(() => undefined)
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#b89135",
        tabBarInactiveTintColor: "#667085",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#d7deea",
          borderTopWidth: 1,
          height: 64 + bottomInset,
          minHeight: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 10,
          shadowColor: "#020617",
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -8 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: "900",
          letterSpacing: 0.1,
        },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon color={color} icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <TabIcon color={color} icon={Search} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color }) => <TabIcon color={color} icon={FileText} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) => <TabIcon color={color} icon={BriefcaseBusiness} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabIcon color={color} icon={UserCircle} />,
        }}
      />
    </Tabs>
  )
}
