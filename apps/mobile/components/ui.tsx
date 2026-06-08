import { PropsWithChildren } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, radius, spacing } from "@/lib/theme"

export function Screen({
  title,
  eyebrow,
  children,
}: PropsWithChildren<{ title: string; eyebrow?: string }>) {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          contentContainerStyle={[styles.screen, { paddingBottom: spacing.xl + insets.bottom + 96 }]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper?: string
}) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </Card>
  )
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  tone = "navy",
}: {
  title: string
  onPress?: () => void
  loading?: boolean
  tone?: "navy" | "gold" | "light"
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || !onPress}
      onPress={onPress}
      style={[
        styles.button,
        tone === "gold" && styles.goldButton,
        tone === "light" && styles.lightButton,
        (loading || !onPress) && styles.disabledButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone === "light" ? colors.navy : "#ffffff"} />
      ) : (
        <Text style={[styles.buttonText, tone === "light" && styles.lightButtonText]}>{title}</Text>
      )}
    </Pressable>
  )
}

export function SecondaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string
  title: string
  body?: string
}) {
  return (
    <View style={styles.sectionHeader}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  )
}

export function ActionRow({
  title,
  body,
  badge,
  onPress,
}: {
  title: string
  body?: string
  badge?: string
  onPress?: () => void
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.actionRow}>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        {body ? <Text style={styles.helper}>{body}</Text> : null}
      </View>
      <View style={styles.actionAside}>
        {badge ? <Badge label={badge} tone="gold" /> : null}
        <Text style={styles.actionArrow}>{">"}</Text>
      </View>
    </Pressable>
  )
}

export function ToolCard({
  title,
  body,
  meta,
  onPress,
}: {
  title: string
  body: string
  meta?: string
  onPress?: () => void
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.toolCard}>
      <View style={styles.toolIcon}>
        <Text style={styles.toolIconText}>{title.slice(0, 1)}</Text>
      </View>
      <View style={styles.actionText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {meta ? <Text style={styles.helper}>{meta}</Text> : null}
      </View>
      <Text style={styles.actionArrow}>{">"}</Text>
    </Pressable>
  )
}

export function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "green" | "gold" | "red" }) {
  return (
    <View
      style={[
        styles.badge,
        tone === "green" && styles.greenBadge,
        tone === "gold" && styles.goldBadge,
        tone === "red" && styles.redBadge,
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  )
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  keyboardType?: "default" | "email-address" | "numeric"
  multiline?: boolean
  secureTextEntry?: boolean
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#98a2b3"
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  )
}

export function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => onChange(option)}
            style={[styles.choice, value === option && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Card>
  )
}

export function LoadingState({ label = "Loading Client Bureau..." }: { label?: string }) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.body}>{label}</Text>
    </SafeAreaView>
  )
}

export function Message({ text, tone = "neutral" }: { text?: string; tone?: "neutral" | "error" | "success" }) {
  if (!text) return null

  return (
    <View style={[styles.message, tone === "error" && styles.errorMessage, tone === "success" && styles.successMessage]}>
      <Text style={styles.messageText}>{text}</Text>
    </View>
  )
}

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardAvoider: {
    flex: 1,
  },
  screen: {
    padding: spacing.md,
    gap: spacing.md,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionHeader: {
    gap: 6,
    paddingTop: 4,
  },
  sectionEyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    shadowColor: "#101828",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTitle: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "800",
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
  },
  statValue: {
    color: colors.navy,
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  goldButton: {
    backgroundColor: colors.gold,
  },
  lightButton: {
    backgroundColor: "#ffffff",
    borderColor: colors.line,
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  lightButtonText: {
    color: colors.navy,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "800",
  },
  actionRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md,
    shadowColor: "#101828",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "900",
  },
  actionAside: {
    alignItems: "flex-end",
    gap: 6,
  },
  actionArrow: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 30,
  },
  toolCard: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    shadowColor: "#101828",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  toolIcon: {
    alignItems: "center",
    backgroundColor: colors.goldSoft,
    borderRadius: radius.md,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  toolIconText: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "900",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#eef2f7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  greenBadge: {
    backgroundColor: "#dcfae6",
  },
  goldBadge: {
    backgroundColor: colors.goldSoft,
  },
  redBadge: {
    backgroundColor: "#fee4e2",
  },
  badgeText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 48,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choice: {
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  choiceTextActive: {
    color: "#ffffff",
  },
  message: {
    backgroundColor: "#eef2f7",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorMessage: {
    backgroundColor: "#fee4e2",
  },
  successMessage: {
    backgroundColor: "#dcfae6",
  },
  messageText: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "700",
  },
})
