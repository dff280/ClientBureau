import { Redirect, Tabs } from "expo-router"
import * as Haptics from "expo-haptics"
import { BriefcaseBusiness, FileText, Home, Search, UserCircle, type LucideIcon } from "lucide-react-native"
import type { ColorValue } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { LoadingState } from "@/components/ui"
import { colors, radius } from "@/lib/theme"
import { useAuth } from "@/providers/auth-provider"

function TabIcon({ icon: Icon, color, focused }: { icon: LucideIcon; color: ColorValue; focused: boolean }) {
  return <Icon color={String(color)} size={focused ? 23 : 21} strokeWidth={focused ? 2.7 : 2.25} />
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
        tabBarActiveBackgroundColor: colors.goldSoft,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
          marginHorizontal: 3,
          marginVertical: 6,
          paddingVertical: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 72 + bottomInset,
          minHeight: 72 + bottomInset,
          paddingBottom: bottomInset,
          paddingHorizontal: 8,
          paddingTop: 8,
          shadowColor: "#020617",
          shadowOpacity: 0.1,
          shadowRadius: 18,
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
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Check",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={Search} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={FileText} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={BriefcaseBusiness} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={UserCircle} />,
        }}
      />
    </Tabs>
  )
}
