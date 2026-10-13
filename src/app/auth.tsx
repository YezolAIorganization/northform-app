import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { useAuth } from "../lib/auth";
import { colors, radius, sizes, spacing, type } from "../theme";

type Mode = "login" | "signup";
type Errors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const isSignup = mode === "signup";

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (isSignup && name.trim().length < 2) {
      found.name = "Enter your name.";
    }
    if (!EMAIL_RE.test(email.trim())) {
      found.email = "Enter a valid email.";
    }
    if (isSignup && password.length < 8) {
      found.password = "Password must be at least 8 characters.";
    }
    if (!isSignup && password.length === 0) {
      found.password = "Enter your password.";
    }
    return found;
  };

  const submit = async () => {
    if (busy) return;

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setErrors({});
    setBusy(true);
    const message = isSignup
      ? await signUp(name, email, password)
      : await signIn(email, password);
    setBusy(false);

    if (message) {
      setErrors({ form: message });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    close();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}
        >
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>

        <Text style={styles.title}>
          {isSignup ? "Create account." : "Log in."}
        </Text>
        <Text style={styles.subtitle}>
          {isSignup
            ? "Create an account to book classes."
            : "Log in to book and manage classes."}
        </Text>

        <View style={styles.segment}>
          {(["login", "signup"] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {m === "login" ? "Log in" : "Sign up"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          {isSignup && (
            <TextField
              label="Name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}
          <TextField
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secure
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isSignup ? "new-password" : "current-password"}
            textContentType={isSignup ? "newPassword" : "password"}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>

        {!!errors.form && (
          <View style={styles.formError} accessibilityRole="alert">
            <Feather name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        )}

        <View style={styles.action}>
          <Button
            label={isSignup ? "Create account" : "Log in"}
            onPress={submit}
            loading={busy}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  close: {
    alignSelf: "flex-end",
    width: sizes.control,
    height: sizes.control,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -spacing.md,
  },
  title: { ...type.display, color: colors.foreground, marginTop: spacing.sm },
  subtitle: { ...type.body, color: colors.muted, marginTop: spacing.sm },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    padding: spacing.xs,
    marginTop: spacing.xxl,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segmentText: { ...type.title, fontSize: 15, color: colors.muted },
  segmentTextActive: { color: colors.foreground },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
  formError: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  formErrorText: { ...type.caption, color: colors.danger, flex: 1 },
  action: { marginTop: spacing.xxl },
});
