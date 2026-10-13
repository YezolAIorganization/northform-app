import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassCard } from "../../components/ClassCard";
import { DayStrip } from "../../components/DayStrip";
import { EmptyState } from "../../components/EmptyState";
import { FadeInView } from "../../components/FadeInView";
import { OfflineBanner } from "../../components/OfflineBanner";
import { ScheduleSkeleton } from "../../components/ScheduleSkeleton";
import { buildDays, dayKey, formatDay } from "../../lib/format";
import { useSchedule, type ClassItem } from "../../lib/schedule";
import { colors, spacing, type } from "../../theme";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { classes, loading, refreshing, failed, reload, refresh, retry } =
    useSchedule();

  const days = useMemo(() => buildDays(14), []);
  const [selected, setSelected] = useState(days[0].key);

  const byDay = useMemo(() => {
    const map = new Map<string, ClassItem[]>();
    for (const c of classes) {
      const key = dayKey(c.starts_at);
      const list = map.get(key);
      if (list) {
        list.push(c);
      } else {
        map.set(key, [c]);
      }
    }
    return map;
  }, [classes]);

  // Open on the first day that has classes.
  const initialised = useRef(false);
  useEffect(() => {
    if (loading || initialised.current || classes.length === 0) return;
    initialised.current = true;
    if (!byDay.has(days[0].key)) {
      const first = days.find((d) => byDay.has(d.key));
      if (first) setSelected(first.key);
    }
  }, [loading, classes.length, byDay, days]);

  // Refetch quietly when the screen regains focus (for example after the sheet closes).
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

  const todays = byDay.get(selected) ?? [];
  const nextDay = days.find((d) => d.key > selected && byDay.has(d.key));
  const count = todays.length === 1 ? "1 class" : `${todays.length} classes`;
  const isToday = selected === days[0].key;

  return (
    <View style={styles.screen}>
      <View
        style={{
          paddingTop: insets.top + spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <Text style={styles.title}>Schedule</Text>
      </View>
      <OfflineBanner onReconnect={reload} />
      <View style={styles.strip}>
        <DayStrip days={days} selected={selected} onSelect={setSelected} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
            progressBackgroundColor={colors.elevated}
          />
        }
      >
        {loading ? (
          <ScheduleSkeleton />
        ) : failed && classes.length === 0 ? (
          <EmptyState
            icon="alert-circle"
            message="Something went wrong. Please try again."
            actionLabel="Try again"
            onAction={retry}
          />
        ) : (
          <>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {formatDay(`${selected}T12:00:00Z`)}
              </Text>
              <Text style={styles.caption}>
                {todays.length > 0
                  ? `${count} · New York time`
                  : "New York time"}
              </Text>
            </View>

            {todays.length === 0 ? (
              <EmptyState
                icon="calendar"
                message={
                  isToday ? "No more classes today." : "No classes on this day."
                }
                actionLabel={nextDay ? "See next day with classes" : undefined}
                onAction={nextDay ? () => setSelected(nextDay.key) : undefined}
              />
            ) : (
              todays.map((c, i) => (
                <FadeInView key={`${selected}-${c.id}`} index={i}>
                  <ClassCard
                    item={c}
                    onPress={() =>
                      router.push({
                        pathname: "/class/[id]",
                        params: { id: c.id },
                      })
                    }
                  />
                </FadeInView>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { ...type.h1, color: colors.foreground },
  strip: { marginTop: spacing.lg },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  dayHeader: { gap: spacing.xs, marginBottom: spacing.xs },
  dayTitle: { ...type.h2, color: colors.foreground },
  caption: { ...type.caption, color: colors.muted },
});
