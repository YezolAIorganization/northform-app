import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDay, formatTime } from "../lib/format";
import type { BookingItem } from "../lib/useBookings";
import { colors, fonts, radius, spacing, type } from "../theme";
import { cardStyles, SpotsPill } from "./ClassCard";

type Props = {
  item: BookingItem;
  past?: boolean;
  onCancel?: () => void;
};

export function BookingCard({ item, past = false, onCancel }: Props) {
  const time = formatTime(item.starts_at);

  return (
    <View style={[styles.card, past && styles.past]}>
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
        <View style={styles.action}>
          {past ? (
            <SpotsPill label="Completed" tone="muted" />
          ) : (
            <Pressable
              onPress={onCancel}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Cancel ${item.class_name} on ${formatDay(item.starts_at)} at ${time}`}
              style={({ pressed }) => [
                styles.cancel,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...cardStyles.card },
  past: { opacity: 0.75 },
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
  action: { flexDirection: "row", marginTop: spacing.sm },
  cancel: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.97 }] },
  cancelText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: colors.foreground,
  },
});
