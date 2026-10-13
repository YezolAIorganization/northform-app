import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import {
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { SpotsPill, spotsPill } from "../../components/ClassCard";
import { useAuth } from "../../lib/auth";
import { bookClass } from "../../lib/bookings";
import { formatDay, formatTime } from "../../lib/format";
import { useSchedule } from "../../lib/schedule";
import { useToast } from "../../lib/toast";
import { colors, radius, spacing, type } from "../../theme";

const BOOKING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

function InfoRow({
  icon,
  text,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  text: string;
}) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={18} color={colors.muted} />
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

export default function ClassSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { session } = useAuth();
  const { getClass, setBooked, reload } = useSchedule();
  const toast = useToast();

  const item = getClass(id);
  const [justBooked, setJustBooked] = useState(false);

  const translateY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 220,
        mass: 0.9,
        overshootClamping: true,
        useNativeDriver: false,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [translateY, backdrop]);

  const dismiss = useCallback(
    (after?: () => void) => {
      if (closing.current) return;
      closing.current = true;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start(() => {
        router.back();
        after?.();
      });
    },
    [translateY, backdrop, height, router],
  );

  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  // Android back button closes with the same animation.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        dismissRef.current();
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.9) {
          dismissRef.current();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 220,
            overshootClamping: true,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const book = async () => {
    if (!item) return;

    if (!session) {
      router.push("/auth");
      return;
    }

    // Optimistic: show the result now, roll back if the server refuses.
    setJustBooked(true);
    setBooked(item.id, true);

    const result = await bookClass(item.id);
    if (result.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reload();
    } else {
      setBooked(item.id, false);
      setJustBooked(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show(result.message, "error");
      reload();
    }
  };

  const renderBody = () => {
    if (!item) {
      return (
        <View style={styles.missing}>
          <Text style={styles.missingText}>
            That class is no longer available.
          </Text>
          <Button label="Close" variant="secondary" onPress={() => dismiss()} />
        </View>
      );
    }

    const startMs = new Date(item.starts_at).getTime();
    const endIso = new Date(startMs + item.duration_min * 60000).toISOString();
    const now = Date.now();
    const closed = startMs <= now || startMs - now > BOOKING_WINDOW_MS;
    const pill = spotsPill(item);

    if (justBooked && item.booked_by_me) {
      return (
        <>
          <View style={styles.confirm}>
            <View style={styles.successTile}>
              <Feather name="check" size={28} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>Class booked.</Text>
            <Text style={styles.confirmBody}>See you there.</Text>
            <Text style={styles.caption}>
              {item.class_name} · {formatDay(item.starts_at)} ·{" "}
              {formatTime(item.starts_at)}
            </Text>
          </View>
          <View style={styles.actions}>
            <Button
              label="See my bookings"
              onPress={() => dismiss(() => router.navigate("/bookings"))}
            />
            <Button
              label="Done"
              variant="secondary"
              onPress={() => dismiss()}
            />
          </View>
        </>
      );
    }

    let action;
    if (item.booked_by_me) {
      action = (
        <Button
          label="Booked"
          icon="check"
          variant="success"
          disabled
          onPress={() => {}}
        />
      );
    } else if (closed) {
      action = (
        <Button
          label="Booking closed"
          variant="secondary"
          disabled
          onPress={() => {}}
        />
      );
    } else if (item.spots_left <= 0) {
      action = (
        <Button label="Full" variant="secondary" disabled onPress={() => {}} />
      );
    } else {
      action = <Button label="Book class" onPress={book} />;
    }

    return (
      <>
        <Text style={styles.title}>{item.class_name}</Text>
        <View style={styles.pillRow}>
          <SpotsPill label={pill.label} tone={pill.tone} />
        </View>

        <View style={styles.rows}>
          <InfoRow icon="calendar" text={formatDay(item.starts_at)} />
          <InfoRow
            icon="clock"
            text={`${formatTime(item.starts_at)} – ${formatTime(endIso)} · ${item.duration_min} min`}
          />
          <InfoRow icon="user" text={item.trainer_name} />
        </View>

        {item.class_description ? (
          <Text style={styles.description}>{item.class_description}</Text>
        ) : null}

        <View style={styles.actions}>{action}</View>
      </>
    );
  };

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          { opacity: backdrop },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + spacing.xl,
            transform: [{ translateY }],
          },
        ]}
      >
        <View {...pan.panHandlers} style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>
        {renderBody()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: colors.elevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.xl,
  },
  grabberWrap: { height: 32, alignItems: "center", justifyContent: "center" },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: { ...type.h1, color: colors.foreground, marginTop: spacing.xs },
  pillRow: { flexDirection: "row", marginTop: spacing.md },
  rows: {
    marginTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowText: { ...type.body, color: colors.foreground, flex: 1 },
  description: { ...type.body, color: colors.muted, marginTop: spacing.lg },
  actions: { marginTop: spacing.xxl, gap: spacing.md },
  caption: { ...type.caption, color: colors.muted, textAlign: "center" },
  confirm: { alignItems: "center", gap: spacing.sm, paddingTop: spacing.lg },
  successTile: {
    width: 64,
    height: 64,
    borderRadius: radius.card,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  confirmTitle: { ...type.h1, color: colors.foreground },
  confirmBody: { ...type.body, color: colors.muted },
  missing: {
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  missingText: { ...type.body, color: colors.muted, textAlign: "center" },
});
