import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.active]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    padding: spacing.xs,
  },
  item: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  text: { ...type.title, fontSize: 15, color: colors.muted },
  textActive: { color: colors.foreground },
});
