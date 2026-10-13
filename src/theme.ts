import type { TextStyle } from "react-native";

export const colors = {
  background: "#0E0E10",
  surface: "#18181B",
  elevated: "#1F1F23",
  border: "#27272A",
  borderSoft: "rgba(255,255,255,0.07)",
  foreground: "#F4F4F6",
  muted: "#9CA3AF",
  accent: "#FF5B2E",
  accentPressed: "#E04E24",
  onAccent: "#0E0E10",
  success: "#22C55E",
  danger: "#EF4444",
  accentSoft: "rgba(255,91,46,0.14)",
  successSoft: "rgba(34,197,94,0.14)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  card: 16,
  control: 12,
  pill: 999,
} as const;

export const sizes = {
  control: 48,
} as const;

export const fonts = {
  heading: "BricolageGrotesque_700Bold",
  headingSemi: "BricolageGrotesque_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
} as const;

export const type = {
  display: { fontFamily: fonts.heading, fontSize: 36, lineHeight: 40 },
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 32 },
  h2: { fontFamily: fonts.headingSemi, fontSize: 22, lineHeight: 28 },
  title: { fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;
