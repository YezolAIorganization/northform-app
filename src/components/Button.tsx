import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, sizes, spacing, type } from "../theme";

type Variant = "primary" | "secondary" | "success" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>["name"];
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const textColors: Record<Variant, string> = {
  primary: colors.onAccent,
  secondary: colors.foreground,
  success: colors.success,
  danger: colors.foreground,
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const inactive = disabled || loading;
  const color = textColors[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "success" && styles.success,
        variant === "danger" && styles.danger,
        variant === "primary" && pressed && styles.primaryPressed,
        pressed && styles.pressed,
        disabled && variant !== "success" && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          {icon ? <Feather name={icon} size={18} color={color} /> : null}
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.control,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  primary: { backgroundColor: colors.accent },
  primaryPressed: { backgroundColor: colors.accentPressed },
  secondary: {
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  success: { backgroundColor: colors.successSoft },
  danger: { backgroundColor: colors.danger },
  pressed: { transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.5 },
  label: { ...type.title },
});
