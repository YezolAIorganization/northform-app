import { Feather } from "@expo/vector-icons";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, type } from "../theme";

type Tone = "success" | "error" | "info";

type ToastValue = {
  show: (message: string, tone?: Tone) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

const icons = {
  success: { name: "check-circle", color: colors.success },
  error: { name: "alert-circle", color: colors.danger },
  info: { name: "info", color: colors.muted },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; tone: Tone } | null>(
    null,
  );
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [progress]);

  const show = useCallback(
    (message: string, tone: Tone = "info") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, tone });
      progress.setValue(0);
      Animated.spring(progress, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        mass: 0.8,
        overshootClamping: true,
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(hide, 3200);
    },
    [hide, progress],
  );

  const value = useMemo(() => ({ show }), [show]);
  const icon = toast ? icons[toast.tone] : icons.info;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast && (
          <Animated.View
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              {
                top: insets.top + spacing.md,
                opacity: progress,
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Feather name={icon.name} size={18} color={icon.color} />
            <Text style={styles.text}>{toast.message}</Text>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return value;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toast: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.elevated,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: { ...type.body, color: colors.foreground, flex: 1 },
});
