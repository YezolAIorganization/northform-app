import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatTime } from "../lib/format";
import type { ClassItem } from "../lib/schedule";
import { colors, fonts, radius, spacing, type } from "../theme";

const LOW_SPOTS = 3;

type Tone = "neutral" | "accent" | "muted" | "success";

const tones: Record<Tone, { bg: string; border: string; text: string }> = {
  neutral: { bg: colors.elevated, border: "transparent", text: colors.muted },
  accent: { bg: colors.accentSoft, border: "transparent", text: colors.accent },
  muted: { bg: "transparent", border: colors.border, text: colors.muted },
  success: {
    bg: colors.successSoft,
    border: "transparent",
    text: colors.success,
  },
};

export function spotsPill(
  item: Pick<ClassItem, "spots_left" | "booked_by_me">,
): {
  label: string;
  tone: Tone;
} {
  if (item.booked_by_me) return { label: "Booked", tone: "success" };
  if (item.spots_left <= 0) return { label: "Full", tone: "muted" };
  if (item.spots_left <= LOW_SPOTS)
    return { label: `${item.spots_left} left`, tone: "accent" };
  return { label: `${item.spots_left} spots left`, tone: "neutral" };
}

export function SpotsPill({ label, tone }: { label: string; tone: Tone }) {
  const t = tones[tone];
  return (
    <View
      style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      <Text style={[styles.pillText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

type Props = {
  item: ClassItem;
  onPress?: () => void;
};

export function ClassCard({ item, onPress }: Props) {
  const pill = spotsPill(item);
  const time = formatTime(item.starts_at);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.class_name}, ${time}, with ${item.trainer_name}, ${pill.label}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.time}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.caption}>{item.duration_min} min</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {item.class_name}
        </Text>
        <Text style={styles.caption} numberOfLines={1}>
          {item.trainer_name}
        </Text>
        <View style={styles.pillRow}>
          <SpotsPill label={pill.label} tone={pill.tone} />
        </View>
      </View>
    </Pressable>
  );
}

export const cardStyles = {
  card: {
    flexDirection: "row" as const,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
  },
};

const styles = StyleSheet.create({
  card: { ...cardStyles.card },
  pressed: { transform: [{ scale: 0.97 }] },
  time: { width: 76, flexShrink: 0, gap: spacing.xs },
  timeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: colors.foreground,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  main: { flex: 1, gap: spacing.xs },
  name: { ...type.title, color: colors.foreground },
  caption: { ...type.caption, color: colors.muted },
  pillRow: { flexDirection: "row", marginTop: spacing.sm },
  pill: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    height: 26,
    justifyContent: "center",
  },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16 },
});
