import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookingCard } from "../../components/BookingCard";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { FadeInView } from "../../components/FadeInView";
import { OfflineBanner } from "../../components/OfflineBanner";
import { ScheduleSkeleton } from "../../components/ScheduleSkeleton";
import { Segmented } from "../../components/Segmented";
import { useAuth } from "../../lib/auth";
import { cancelBooking } from "../../lib/bookings";
import { dayKey, formatDay } from "../../lib/format";
import { useSchedule } from "../../lib/schedule";
import { useToast } from "../../lib/toast";
import { useBookings, type BookingItem } from "../../lib/useBookings";
import { colors, spacing, type } from "../../theme";

const LOCK_MS = 2 * 60 * 60 * 1000;
const TOO_LATE = "Too late to cancel. Classes lock 2 hours before start.";

type Tab = "upcoming" | "past";

function groupByDay(items: BookingItem[]) {
  const groups: { key: string; items: BookingItem[] }[] = [];
  for (const item of items) {
    const key = dayKey(item.starts_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, items: [item] });
    }
  }
  return groups;
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { session } = useAuth();
  const { setBooked, reload: reloadSchedule } = useSchedule();
  const {
    bookings,
    loading,
    refreshing,
    failed,
    reload,
    refresh,
    retry,
    removeLocal,
    restoreLocal,
  } = useBookings();

  const [tab, setTab] = useState<Tab>("upcoming");
  const [pending, setPending] = useState<BookingItem | null>(null);

  // Refetch quietly when the tab regains focus (for example after booking from the sheet).
  const skipFirst = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (skipFirst.current) {
        skipFirst.current = false;
        return;
      }
      reload();
    }, [reload]),
  );

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const time = (b: BookingItem) => new Date(b.starts_at).getTime();
    return {
      upcoming: bookings
        .filter((b) => time(b) > now)
        .sort((a, b) => time(a) - time(b)),
      past: bookings
        .filter((b) => time(b) <= now)
        .sort((a, b) => time(b) - time(a)),
    };
  }, [bookings]);

  const visible = tab === "upcoming" ? upcoming : past;
  const groups = useMemo(() => groupByDay(visible), [visible]);

  const requestCancel = (booking: BookingItem) => {
    if (new Date(booking.starts_at).getTime() - Date.now() < LOCK_MS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show(TOO_LATE, "error");
      return;
    }
    setPending(booking);
  };

  const confirmCancel = async () => {
    const booking = pending;
    if (!booking) return;
    setPending(null);

    // Optimistic: remove now, restore if the server refuses.
    removeLocal(booking.booking_id);
    setBooked(booking.class_id, false);

    const result = await cancelBooking(booking.booking_id);
    if (result.ok) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toast.show("Booking cancelled.", "success");
      reloadSchedule();
    } else {
      restoreLocal(booking);
      setBooked(booking.class_id, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.show(result.message, "error");
      reload();
      reloadSchedule();
    }
  };

  let counter = 0;

  const renderContent = () => {
    if (!session) {
      return (
        <EmptyState
          icon="user"
          message="Log in to see your bookings."
          actionLabel="Log in"
          onAction={() => router.push("/auth")}
        />
      );
    }
    if (loading) {
      return <ScheduleSkeleton />;
    }
    if (failed && bookings.length === 0) {
      return (
        <EmptyState
          icon="alert-circle"
          message="Something went wrong. Please try again."
          actionLabel="Try again"
          onAction={retry}
        />
      );
    }
    if (visible.length === 0) {
      return tab === "upcoming" ? (
        <EmptyState
          icon="bookmark"
          message="Nothing booked yet. Your next session is one tap away."
          actionLabel="Browse schedule"
          onAction={() => router.navigate("/")}
        />
      ) : (
        <EmptyState icon="clock" message="No past classes yet." />
      );
    }
    return groups.map((group) => (
      <View key={`${tab}-${group.key}`} style={styles.group}>
        <Text style={styles.groupLabel}>
          {formatDay(group.items[0].starts_at)}
        </Text>
        {group.items.map((b) => (
          <FadeInView key={b.booking_id} index={counter++}>
            <BookingCard
              item={b}
              past={tab === "past"}
              onCancel={() => requestCancel(b)}
            />
          </FadeInView>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.screen}>
      <View
        style={{
          paddingTop: insets.top + spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <Text style={styles.title}>My bookings</Text>
      </View>
      <OfflineBanner onReconnect={reload} />

      {session && (
        <View style={styles.segment}>
          <Segmented
            options={[
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          session ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
              progressBackgroundColor={colors.elevated}
            />
          ) : undefined
        }
      >
        {renderContent()}
      </ScrollView>

      <ConfirmDialog
        visible={pending !== null}
        title="Cancel this class?"
        message="You can rebook anytime if spots are available."
        cancelLabel="Keep booking"
        confirmLabel="Cancel class"
        onCancel={() => setPending(null)}
        onConfirm={confirmCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { ...type.h1, color: colors.foreground },
  segment: { paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  group: { gap: spacing.md },
  groupLabel: { ...type.label, color: colors.muted },
});
