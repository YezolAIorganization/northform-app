import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useOffline } from "../lib/network";
import { colors, radius, spacing, type } from "../theme";
import { FadeInView } from "./FadeInView";

type Props = {
  onReconnect?: () => void;
};

export function OfflineBanner({ onReconnect }: Props) {
  const offline = useOffline();
  const wasOffline = useRef(false);

  // Refetch once when the connection comes back.
  useEffect(() => {
    if (wasOffline.current && !offline) {
      onReconnect?.();
    }
    wasOffline.current = offline;
  }, [offline, onReconnect]);

  if (!offline) return null;

  return (
    <FadeInView style={styles.wrap}>
      <View
        style={styles.banner}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Feather name="wifi-off" size={16} color={colors.muted} />
        <Text style={styles.text}>
          You're offline. Reconnect to book classes.
        </Text>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: spacing.xl, marginTop: spacing.md },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  text: { ...type.caption, color: colors.muted, flex: 1 },
});
