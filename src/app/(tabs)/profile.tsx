import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState, type ComponentProps } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { useAuth } from "../../lib/auth";
import { useToast } from "../../lib/toast";
import { colors, fonts, radius, spacing, type } from "../../theme";

const RULES: { icon: ComponentProps<typeof Feather>["name"]; text: string }[] =
  [
    { icon: "users", text: "Up to 12 people per class" },
    { icon: "calendar", text: "Book up to 14 days ahead" },
    { icon: "clock", text: "Free cancellation until 2 hours before class" },
  ];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { session, name, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const email = session?.user.email ?? "";
  const initial = (name || email).trim().charAt(0).toUpperCase() || "?";

  const onSignOut = async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.show("Signed out.", "info");
  };

  return (
    <View style={styles.screen}>
      <View
        style={{
          paddingTop: insets.top + spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {session ? (
          <View style={styles.account}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.accountText}>
              <Text style={styles.caption}>Signed in as</Text>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.caption} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        ) : (
          <EmptyState
            icon="user"
            message="Log in to book and manage classes."
            actionLabel="Log in"
            onAction={() => router.push("/auth")}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Studio rules</Text>
          <View style={styles.rules}>
            {RULES.map((r) => (
              <View key={r.text} style={styles.rule}>
                <Feather name={r.icon} size={18} color={colors.muted} />
                <Text style={styles.ruleText}>{r.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {session && (
          <Button
            label="Sign out"
            variant="secondary"
            loading={busy}
            onPress={onSignOut}
          />
        )}

        <Text style={styles.footer}>
          Northform is a fictional concept project by Shah.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { ...type.h1, color: colors.foreground },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  account: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    color: colors.foreground,
  },
  accountText: { flex: 1, gap: 2 },
  name: { ...type.title, color: colors.foreground },
  caption: { ...type.caption, color: colors.muted },
  section: { gap: spacing.md },
  sectionLabel: { ...type.label, color: colors.muted },
  rules: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
  },
  ruleText: { ...type.body, color: colors.foreground, flex: 1 },
  footer: { ...type.caption, color: colors.muted, textAlign: "center" },
});
