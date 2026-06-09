import { ComponentType, ForwardedRef, PropsWithChildren, forwardRef, useRef, useState } from "react"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { Eye, EyeOff } from "lucide-react-native"
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
  TextInputProps,
  View,
  ViewStyle,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { colors, gradients, radius, shadows, spacing, typography } from "@/lib/theme"

type MobileIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>
type MobileKeyboardType = TextInputProps["keyboardType"]
type MobileReturnKeyType = TextInputProps["returnKeyType"]
type MobileSubmitBehavior = TextInputProps["submitBehavior"]

function assignTextInputRef(ref: ForwardedRef<TextInput>, value: TextInput | null) {
  if (typeof ref === "function") {
    ref(value)
    return
  }

  if (ref) {
    ref.current = value
  }
}

function runPress(onPress?: () => void) {
  if (!onPress) return
  Haptics.selectionAsync().catch(() => undefined)
  onPress()
}

export function Screen({
  title,
  eyebrow,
  body,
  badge,
  children,
}: PropsWithChildren<{ title: string; eyebrow?: string; body?: string; badge?: string }>) {
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
          <AppHeader eyebrow={eyebrow} title={title} body={body} badge={badge} />
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export function AuthShell({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoider}
      >
        <ScrollView
          contentContainerStyle={[styles.authScreen, { paddingBottom: spacing.lg + insets.bottom + 18 }]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export function AppHeader({
  eyebrow,
  title,
  body,
  badge,
}: {
  eyebrow?: string
  title: string
  body?: string
  badge?: string
}) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.rowBetween}>
        <View style={styles.headerText}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {badge ? <TrustBadge label={badge} tone="gold" /> : null}
      </View>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  )
}

export function AuthHeroPanel({
  eyebrow = "Client Bureau Mobile",
  title,
  body,
}: {
  eyebrow?: string
  title: string
  body: string
}) {
  return (
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.authHero}>
      <View style={styles.authBrandRow}>
        <View style={styles.authMark}>
          <Text style={styles.authMarkText}>CB</Text>
        </View>
        <Text style={styles.authEyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.authTitle}>{title}</Text>
      <Text style={styles.authBody}>{body}</Text>
    </LinearGradient>
  )
}

export function TrustProofStrip({ items }: { items: string[] }) {
  return (
    <View style={styles.proofStrip}>
      {items.map((item) => (
        <View key={item} style={styles.proofChip}>
          <View style={styles.proofDot} />
          <Text style={styles.proofText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

export function SecureFormCard({
  title,
  body,
  children,
}: PropsWithChildren<{ title: string; body?: string }>) {
  return (
    <View style={styles.secureFormCard}>
      <View style={styles.secureFormHeader}>
        <Text style={styles.secureFormTitle}>{title}</Text>
        <TrustBadge label="Secure" tone="gold" />
      </View>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {children}
    </View>
  )
}

export function AuthSwitchCard({
  label,
  action,
  onPress,
}: {
  label: string
  action: string
  onPress?: () => void
}) {
  return (
    <Pressable accessibilityRole="button" onPress={() => runPress(onPress)} style={({ pressed }) => [styles.authSwitchCard, pressed && styles.pressed]}>
      <Text style={styles.authSwitchLabel}>{label}</Text>
      <Text style={styles.authSwitchAction}>{action}</Text>
    </Pressable>
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
    <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bureauPanel, styles.bureauPanelDark, styles.heroPanel]}>
      <View style={styles.heroAccent} />
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      {body ? <Text style={styles.heroBody}>{body}</Text> : null}
      {children}
    </LinearGradient>
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

export function MetricMini({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metricMini}>
      <Text style={styles.metricMiniValue}>{value}</Text>
      <Text style={styles.metricMiniLabel}>{label}</Text>
    </View>
  )
}

export function CommandCard({
  label,
  title,
  body,
  metric,
  icon: Icon,
  onPress,
  tone = "light",
}: {
  label: string
  title: string
  body: string
  metric?: string | number
  icon?: MobileIcon
  onPress?: () => void
  tone?: "light" | "gold" | "dark"
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={() => runPress(onPress)}
      style={({ pressed }) => [
        styles.commandCard,
        tone === "gold" && styles.commandCardGold,
        tone === "dark" && styles.commandCardDark,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.rowBetween}>
        <View style={styles.actionText}>
          <Text style={[styles.sectionEyebrow, tone === "dark" && styles.textOnDarkMuted]}>{label}</Text>
          <Text style={[styles.cardTitle, tone === "dark" && styles.textOnDark]}>{title}</Text>
        </View>
        {Icon ? (
          <View style={[styles.iconBadge, tone === "dark" && styles.iconBadgeDark]}>
            <Icon color={tone === "dark" ? colors.gold2 : colors.navy} size={20} strokeWidth={2.3} />
          </View>
        ) : null}
      </View>
      {metric !== undefined ? (
        <Text style={[styles.commandMetric, tone === "dark" && styles.textOnDark]}>{metric}</Text>
      ) : null}
      <Text style={[styles.body, tone === "dark" && styles.textOnDarkMuted]}>{body}</Text>
    </Pressable>
  )
}

export function ToolBrief({
  useWhen,
  privateNote,
  primaryAction,
}: {
  useWhen: string
  privateNote: string
  primaryAction: string
}) {
  return (
    <View style={styles.briefGrid}>
      <View style={styles.briefCell}>
        <Text style={styles.sectionEyebrow}>Use when</Text>
        <Text style={styles.helper}>{useWhen}</Text>
      </View>
      <View style={styles.briefCell}>
        <Text style={styles.sectionEyebrow}>Private</Text>
        <Text style={styles.helper}>{privateNote}</Text>
      </View>
      <View style={styles.briefCell}>
        <Text style={styles.sectionEyebrow}>Next action</Text>
        <Text style={styles.helper}>{primaryAction}</Text>
      </View>
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
      onPress={() => runPress(onPress)}
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
    <Pressable accessibilityRole="button" onPress={() => runPress(onPress)} style={styles.secondaryButton}>
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

export function TrustBadge({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "neutral" | "gold" | "green" | "blue"
}) {
  return (
    <View style={[styles.trustBadge, tone === "gold" && styles.trustBadgeGold, tone === "green" && styles.trustBadgeGreen, tone === "blue" && styles.trustBadgeBlue]}>
      <View style={styles.trustBadgeDot} />
      <Text style={styles.trustBadgeText}>{label}</Text>
    </View>
  )
}

export function InsightCard({
  label,
  title,
  body,
  metric,
  icon: Icon,
  tone = "light",
}: {
  label: string
  title: string
  body?: string
  metric?: string | number
  icon?: MobileIcon
  tone?: "light" | "gold" | "dark"
}) {
  return (
    <View style={[styles.insightCard, tone === "gold" && styles.insightCardGold, tone === "dark" && styles.insightCardDark]}>
      <View style={styles.rowBetween}>
        <View style={styles.actionText}>
          <Text style={[styles.sectionEyebrow, tone === "dark" && styles.textOnDarkMuted]}>{label}</Text>
          <Text style={[styles.cardTitle, tone === "dark" && styles.textOnDark]}>{title}</Text>
        </View>
        {Icon ? (
          <View style={[styles.iconBadge, tone === "dark" && styles.iconBadgeDark]}>
            <Icon color={tone === "dark" ? colors.gold2 : colors.navy} size={20} strokeWidth={2.3} />
          </View>
        ) : null}
      </View>
      {metric ? <Text style={[styles.insightMetric, tone === "dark" && styles.textOnDark]}>{metric}</Text> : null}
      {body ? <Text style={[styles.body, tone === "dark" && styles.textOnDarkMuted]}>{body}</Text> : null}
    </View>
  )
}

export function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <View style={styles.segmentedTabs}>
      {options.map((option) => {
        const active = option === value

        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => runPress(() => onChange(option))}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function BureauSearchBox({
  value,
  onChangeText,
  onSubmit,
  loading,
  placeholder = "Search a client",
  buttonLabel = "Search",
}: {
  value: string
  onChangeText: (value: string) => void
  onSubmit?: () => void
  loading?: boolean
  placeholder?: string
  buttonLabel?: string
}) {
  return (
    <View style={styles.searchBox}>
      <Text style={styles.fieldLabel}>Client search</Text>
      <TextInput
        accessibilityLabel="Client search"
        autoCapitalize="words"
        onChangeText={onChangeText}
        onSubmitEditing={() => runPress(onSubmit)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted2}
        returnKeyType="search"
        style={styles.searchInput}
        value={value}
      />
      <PrimaryButton loading={loading} onPress={onSubmit} title={buttonLabel} tone="gold" />
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

export function SuggestionChip({
  label,
  onPress,
  tone = "light",
}: {
  label: string
  onPress?: () => void
  tone?: "light" | "dark" | "gold"
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => runPress(onPress)}
      style={({ pressed }) => [
        styles.suggestionChip,
        tone === "dark" && styles.suggestionChipDark,
        tone === "gold" && styles.suggestionChipGold,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.suggestionChipText, tone === "dark" && styles.suggestionChipTextDark]}>
        {label}
      </Text>
    </Pressable>
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
    <Pressable accessibilityRole="button" onPress={() => runPress(onPress)} style={styles.actionRow}>
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
      onPress={() => runPress(onPress)}
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
    <Pressable accessibilityRole="button" onPress={() => runPress(onPress)} style={({ pressed }) => [styles.toolCard, pressed && styles.pressed]}>
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

type FieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  keyboardType?: MobileKeyboardType
  multiline?: boolean
  secureTextEntry?: boolean
  returnKeyType?: MobileReturnKeyType
  submitBehavior?: MobileSubmitBehavior
  onSubmitEditing?: TextInputProps["onSubmitEditing"]
  autoComplete?: TextInputProps["autoComplete"]
  textContentType?: TextInputProps["textContentType"]
  autoCorrect?: boolean
  autoFocus?: boolean
  importantForAutofill?: TextInputProps["importantForAutofill"]
}

export const Field = forwardRef<TextInput, FieldProps>(function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secureTextEntry,
  returnKeyType,
  submitBehavior,
  onSubmitEditing,
  autoComplete,
  textContentType,
  autoCorrect,
  autoFocus,
  importantForAutofill,
}, ref) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect ?? keyboardType !== "email-address"}
        autoFocus={autoFocus}
        importantForAutofill={importantForAutofill}
        keyboardType={keyboardType}
        multiline={multiline}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor="#98a2b3"
        ref={(node) => assignTextInputRef(ref, node)}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        submitBehavior={submitBehavior}
        style={[styles.input, focused && styles.inputFocused, multiline && styles.multilineInput]}
        textContentType={textContentType}
        value={value}
      />
    </View>
  )
})

type PasswordFieldProps = {
  label?: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  returnKeyType?: MobileReturnKeyType
  submitBehavior?: MobileSubmitBehavior
  onSubmitEditing?: TextInputProps["onSubmitEditing"]
  autoComplete?: TextInputProps["autoComplete"]
  textContentType?: TextInputProps["textContentType"]
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(function PasswordField({
  label = "Password",
  value,
  onChangeText,
  placeholder = "Your password",
  returnKeyType,
  submitBehavior,
  onSubmitEditing,
  autoComplete = "password",
  textContentType = "password",
}, ref) {
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.passwordInputWrap, focused && styles.inputFocused]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoComplete={autoComplete}
          autoCorrect={false}
          importantForAutofill="yes"
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#98a2b3"
          ref={(node) => {
            inputRef.current = node
            assignTextInputRef(ref, node)
          }}
          returnKeyType={returnKeyType}
          secureTextEntry={!visible}
          style={styles.passwordInput}
          submitBehavior={submitBehavior}
          textContentType={textContentType}
          value={value}
        />
        <Pressable
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          accessibilityRole="button"
          focusable={false}
          hitSlop={8}
          onPress={() =>
            runPress(() => {
              setVisible((current) => !current)
              requestAnimationFrame(() => inputRef.current?.focus())
            })
          }
          style={styles.passwordToggle}
        >
          <Icon color={colors.slate} size={19} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  )
})

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
            onPress={() => runPress(() => onChange(option))}
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

export function PremiumEmptyState({
  title,
  body,
  actionTitle,
  onAction,
}: {
  title: string
  body: string
  actionTitle?: string
  onAction?: () => void
}) {
  return (
    <LinearGradient colors={gradients.paper} style={styles.emptyPremium}>
      <TrustBadge label="No action needed yet" tone="gold" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionTitle ? <PrimaryButton onPress={onAction} title={actionTitle} tone="light" /> : null}
    </LinearGradient>
  )
}

export function SkeletonPanel({ lines = 3 }: { lines?: number }) {
  return (
    <Card>
      <View style={styles.skeletonHeader} />
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={[styles.skeletonLine, index === lines - 1 && styles.skeletonLineShort]} />
      ))}
    </Card>
  )
}

export function ActionDock({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.actionDock, { marginBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {children}
    </View>
  )
}

export function StatusTimeline({
  items,
}: {
  items: Array<{ title: string; body?: string; meta?: string; tone?: "gold" | "green" | "red" | "blue" }>
}) {
  return (
    <View style={styles.statusTimeline}>
      {items.map((item, index) => (
        <TimelineItem key={`${item.title}-${index}`} title={item.title} body={item.body} meta={item.meta} tone={item.tone} />
      ))}
    </View>
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
  authScreen: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  appHeader: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  authHero: {
    borderColor: colors.lineDark,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: "hidden",
    padding: spacing.lg,
    ...shadows.hero,
  },
  authBrandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  authMark: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  authMarkText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "900",
  },
  authEyebrow: {
    color: colors.gold2,
    flex: 1,
    fontSize: typography.eyebrow,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  authTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 35,
  },
  authBody: {
    color: "#d8e1ed",
    fontSize: 13.5,
    lineHeight: 20,
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
  textOnDark: {
    color: colors.white,
  },
  textOnDarkMuted: {
    color: "#cbd5e1",
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
  proofStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  proofChip: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.goldLine,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...shadows.card,
  },
  proofDot: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  proofText: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  secureFormCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.floating,
  },
  secureFormHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  secureFormTitle: {
    color: colors.navy,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 27,
  },
  authSwitchCard: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  authSwitchLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  authSwitchAction: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "900",
  },
  trustBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#eef2f7",
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trustBadgeGold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
  },
  trustBadgeGreen: {
    backgroundColor: colors.greenSoft,
    borderColor: "#a6f4c5",
  },
  trustBadgeBlue: {
    backgroundColor: colors.blueSoft,
    borderColor: "#bfdbfe",
  },
  trustBadgeDot: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  trustBadgeText: {
    color: colors.navy,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  insightCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  insightCardGold: {
    backgroundColor: colors.ivory,
    borderColor: colors.goldLine,
  },
  insightCardDark: {
    backgroundColor: colors.navy2,
    borderColor: colors.lineDark,
  },
  iconBadgeDark: {
    backgroundColor: "rgba(214,173,72,0.14)",
    borderColor: "rgba(214,173,72,0.32)",
  },
  insightMetric: {
    color: colors.navy,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  segmentedTabs: {
    backgroundColor: "#eaf0f8",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 5,
  },
  segment: {
    alignItems: "center",
    borderRadius: radius.sm,
    flexGrow: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  segmentActive: {
    backgroundColor: colors.navy,
    ...shadows.card,
  },
  segmentText: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: colors.white,
  },
  searchBox: {
    backgroundColor: colors.panel,
    borderColor: colors.goldLine,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.floating,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800",
    minHeight: 56,
    paddingHorizontal: spacing.md,
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
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricTileDark: {
    backgroundColor: colors.navy2,
    borderColor: colors.lineDark,
  },
  metricTileGold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
  },
  metricMini: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: "30%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  metricMiniValue: {
    color: colors.navy,
    fontSize: 17,
    fontWeight: "900",
  },
  metricMiniLabel: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.15,
    textTransform: "uppercase",
  },
  commandCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.card,
  },
  commandCardGold: {
    backgroundColor: colors.ivory,
    borderColor: colors.goldLine,
  },
  commandCardDark: {
    backgroundColor: colors.navy,
    borderColor: colors.navy3,
  },
  commandMetric: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 34,
  },
  briefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  briefCell: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: "47%",
    padding: spacing.md,
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
  chipRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  signalRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  suggestionChip: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...shadows.card,
  },
  suggestionChipDark: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  suggestionChipGold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldLine,
  },
  suggestionChipText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "900",
  },
  suggestionChipTextDark: {
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
  actionDock: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: colors.line,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.floating,
  },
  statusTimeline: {
    gap: spacing.sm,
  },
  emptyPremium: {
    borderColor: colors.goldLine,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: "hidden",
    padding: spacing.lg,
    ...shadows.card,
  },
  skeletonHeader: {
    backgroundColor: "#e7edf6",
    borderRadius: 999,
    height: 20,
    width: "46%",
  },
  skeletonLine: {
    backgroundColor: "#eef2f7",
    borderRadius: 999,
    height: 12,
    width: "100%",
  },
  skeletonLineShort: {
    width: "64%",
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
  inputFocused: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  passwordInputWrap: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingLeft: 13,
  },
  passwordInput: {
    color: colors.ink,
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
  },
  passwordToggle: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
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
