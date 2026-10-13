import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";
import { Button } from "./Button";

type Props = {
  icon: ComponentProps<typeof Feather>["name"];
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.tile}>
        <Feather name={icon} size={24} color={colors.muted} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.huge,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 260,
  },
});
