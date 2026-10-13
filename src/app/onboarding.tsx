import { Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { useOnboarding } from "../lib/onboarding";
import { colors, radius, spacing, type } from "../theme";

const slides = [
  {
    key: "book",
    icon: "calendar",
    title: "Book in\nthree taps.",
    body: "Browse classes, pick a time,\nyou're in.",
  },
  {
    key: "track",
    icon: "check-circle",
    title: "Know where\nyou stand.",
    body: "Your upcoming sessions,\nalways one tab away.",
  },
] as const;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { complete } = useOnboarding();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const last = index === slides.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (last) {
      complete();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={complete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Skip"
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.tile}>
              <Feather name={item.icon} size={40} color={colors.foreground} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View
              key={s.key}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Button label={last ? "Get started" : "Next"} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: {
    height: 56,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  skip: {
    minHeight: 48,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: { ...type.title, color: colors.muted },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
    gap: spacing.md,
  },
  tile: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { ...type.display, color: colors.foreground },
  body: { ...type.body, color: colors.muted, maxWidth: 300 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  dots: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { width: 24, backgroundColor: colors.foreground },
});
