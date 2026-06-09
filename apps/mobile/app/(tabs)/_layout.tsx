import { Redirect, Tabs } from "expo-router"
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#b89135",
        tabBarInactiveTintColor: "#667085",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#d7deea",
          height: 58 + bottomInset,
          minHeight: 58 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
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
