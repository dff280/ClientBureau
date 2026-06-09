import { ComponentType, PropsWithChildren } from "react"
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

import { colors, radius, shadows, spacing, typography } from "@/lib/theme"

type MobileIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>

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

export function BureauPanel({
  children,
  dark,
  style,
}: PropsWithChildren<{ dark?: boolean; style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.bureauPanel, dark && styles.bureauPanelDark, style]}>{children}</View>
}

export function BureauHero({
  eyebrow,
  title,
  body,
  children,
}: PropsWithChildren<{ eyebrow: string; title: string; body?: string }>) {
  return (
    <BureauPanel dark style={styles.heroPanel}>
      <View style={styles.heroAccent} />
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      {body ? <Text style={styles.heroBody}>{body}</Text> : null}
      {children}
    </BureauPanel>
  )
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

export function MetricTile({
  label,
  value,
  helper,
  tone = "light",
}: {
  label: string
  value: string | number
  helper?: string
  tone?: "light" | "dark" | "gold"
}) {
  return (
    <View style={[styles.metricTile, tone === "dark" && styles.metricTileDark, tone === "gold" && styles.metricTileGold]}>
      <Text style={[styles.metricValue, tone === "dark" && styles.metricValueDark]}>{value}</Text>
      <Text style={[styles.metricLabel, tone === "dark" && styles.metricLabelDark]}>{label}</Text>
      {helper ? <Text style={[styles.helper, tone === "dark" && styles.heroBody]}>{helper}</Text> : null}
    </View>
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

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "green" | "gold" | "red" | "blue" | "dark"
}) {
  return (
    <View
      style={[
        styles.statusPill,
        tone === "green" && styles.statusGreen,
        tone === "gold" && styles.statusGold,
        tone === "red" && styles.statusRed,
        tone === "blue" && styles.statusBlue,
        tone === "dark" && styles.statusDark,
      ]}
    >
      <Text style={[styles.statusText, tone === "dark" && styles.statusTextDark]}>{label}</Text>
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

export function IconActionRow({
  title,
  body,
  badge,
  icon: Icon,
  onPress,
}: {
  title: string
  body?: string
  badge?: string
  icon: MobileIcon
  onPress?: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconActionRow, pressed && styles.pressed]}
    >
      <View style={styles.iconBadge}>
        <Icon color={colors.navy} size={20} strokeWidth={2.3} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        {body ? <Text style={styles.helper}>{body}</Text> : null}
      </View>
      <View style={styles.actionAside}>
        {badge ? <StatusPill label={badge} tone="gold" /> : null}
        <Text style={styles.actionArrow}>{">"}</Text>
      </View>
    </Pressable>
  )
}

export function ToolCard({
  title,
  body,
  meta,
  icon: Icon,
  onPress,
}: {
  title: string
  body: string
  meta?: string
  icon?: MobileIcon
  onPress?: () => void
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.toolCard, pressed && styles.pressed]}>
      <View style={styles.toolIcon}>
        {Icon ? <Icon color={colors.navy} size={21} strokeWidth={2.3} /> : <Text style={styles.toolIconText}>{title.slice(0, 1)}</Text>}
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

export function TrustScoreCard({
  score,
  label = "Client Bureau signal",
  body,
}: {
  score: number
  label?: string
  body?: string
}) {
  const clamped = Math.max(0, Math.min(100, score))

  return (
    <BureauPanel style={styles.scoreCard}>
      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.sectionEyebrow}>{label}</Text>
          <Text style={styles.scoreValue}>{clamped}</Text>
        </View>
        <StatusPill label={clamped >= 75 ? "Stronger signal" : clamped >= 50 ? "Review context" : "Use caution"} tone={clamped >= 75 ? "green" : clamped >= 50 ? "gold" : "red"} />
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%` }]} />
      </View>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </BureauPanel>
  )
}

export function TimelineItem({
  title,
  body,
  meta,
  tone = "gold",
}: {
  title: string
  body?: string
  meta?: string
  tone?: "gold" | "green" | "red" | "blue"
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, tone === "green" && styles.timelineDotGreen, tone === "red" && styles.timelineDotRed, tone === "blue" && styles.timelineDotBlue]} />
      <View style={styles.timelineContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {meta ? <Text style={styles.helper}>{meta}</Text> : null}
      </View>
    </View>
  )
}

export function FormStepPanel({
  step,
  title,
  body,
  children,
}: PropsWithChildren<{ step: string; title: string; body?: string }>) {
  return (
    <Card>
      <StatusPill label={step} tone="dark" />
      <Text style={styles.cardTitle}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {children}
    </Card>
  )
}

export function StickyActionBar({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets()

  return <View style={[styles.stickyActionBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>{children}</View>
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
      <BureauPanel dark style={styles.loadingPanel}>
        <ActivityIndicator color={colors.gold2} size="large" />
        <Text style={styles.heroBody}>{label}</Text>
      </BureauPanel>
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
    fontSize: typography.eyebrow,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.navy,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 36,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: typography.section,
    fontWeight: "900",
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
    ...shadows.card,
  },
  bureauPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.md,
    ...shadows.card,
  },
  bureauPanelDark: {
    backgroundColor: colors.navy,
    borderColor: colors.lineDark,
  },
  heroPanel: {
    padding: spacing.lg,
    ...shadows.hero,
  },
  heroAccent: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 4,
    width: 58,
  },
  heroEyebrow: {
    color: colors.gold2,
    fontSize: typography.eyebrow,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.hero,
    fontWeight: "900",
    lineHeight: 40,
  },
  heroBody: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
  },
  cardTitle: {
    color: colors.navy,
    fontSize: typography.cardTitle,
    fontWeight: "900",
  },
  body: {
    color: colors.muted,
    fontSize: typography.body,
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
    minHeight: 52,
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
  rowBetween: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
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
  metricTile: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minWidth: "47%",
    padding: spacing.md,
  },
  metricTileDark: {
    backgroundColor: colors.navy2,
    borderColor: colors.lineDark,
  },
  metricTileGold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
  },
  metricValue: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "900",
  },
  metricValueDark: {
    color: colors.white,
  },
  metricLabel: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "800",
  },
  metricLabelDark: {
    color: "#cbd5e1",
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#eef2f7",
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusGreen: {
    backgroundColor: colors.greenSoft,
    borderColor: "#a6f4c5",
  },
  statusGold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
  },
  statusRed: {
    backgroundColor: colors.redSoft,
    borderColor: "#fecdca",
  },
  statusBlue: {
    backgroundColor: colors.blueSoft,
    borderColor: "#bfdbfe",
  },
  statusDark: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  statusText: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  statusTextDark: {
    color: colors.white,
  },
  iconActionRow: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }],
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  scoreCard: {
    gap: spacing.md,
  },
  scoreRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  scoreValue: {
    color: colors.navy,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 48,
  },
  progressTrack: {
    backgroundColor: "#e7edf6",
    borderRadius: 999,
    height: 9,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 9,
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineDot: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 12,
    marginTop: 5,
    width: 12,
  },
  timelineDotGreen: {
    backgroundColor: colors.green,
  },
  timelineDotRed: {
    backgroundColor: colors.red,
  },
  timelineDotBlue: {
    backgroundColor: colors.blue,
  },
  timelineContent: {
    flex: 1,
    gap: 3,
    paddingBottom: spacing.sm,
  },
  stickyActionBar: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  loadingPanel: {
    alignItems: "center",
    maxWidth: 280,
    padding: spacing.xl,
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
