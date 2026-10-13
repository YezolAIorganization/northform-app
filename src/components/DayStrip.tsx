import * as Haptics from "expo-haptics";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { DayInfo } from "../lib/format";
import { colors, fonts, radius, spacing, type } from "../theme";

type Props = {
  days: DayInfo[];
  selected: string;
  onSelect: (key: string) => void;
};

export function DayStrip({ days, selected, onSelect }: Props) {
  return (
    <FlatList
      horizontal
      data={days}
      extraData={selected}
      keyExtractor={(d) => d.key}
      showsHorizontalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const active = item.key === selected;
        return (
          <Pressable
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync();
                onSelect(item.key);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={
              item.isToday ? `${item.label}, today` : item.label
            }
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.item,
              active && styles.itemActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.weekday, active && styles.onAccent]}>
              {item.weekday}
            </Text>
            <Text style={[styles.date, active && styles.onAccent]}>
              {item.date}
            </Text>
            <View
              style={[
                styles.dot,
                item.isToday && {
                  backgroundColor: active ? colors.onAccent : colors.accent,
                },
              ]}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  content: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  item: {
    width: 52,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  itemActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pressed: { transform: [{ scale: 0.97 }] },
  weekday: { ...type.label, color: colors.muted },
  date: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    lineHeight: 24,
    color: colors.foreground,
  },
  onAccent: { color: colors.onAccent },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "transparent" },
});
