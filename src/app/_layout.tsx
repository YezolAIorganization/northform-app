import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/auth";
import { OnboardingProvider, useOnboarding } from "../lib/onboarding";
import { ScheduleProvider } from "../lib/schedule";
import { ToastProvider } from "../lib/toast";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { ready, seen } = useOnboarding();
  const { loading } = useAuth();
  const booting = !ready || loading;

  useEffect(() => {
    if (!booting) {
      SplashScreen.hideAsync();
    }
  }, [booting]);

  if (booting) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={seen}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="class/[id]"
          options={{
            presentation: "transparentModal",
            animation: "none",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="auth"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!seen}>
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
  });

  if (!loaded && !error) {
    return null;
  }

  return (
    <OnboardingProvider>
      <AuthProvider>
        <ScheduleProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <Navigator />
          </ToastProvider>
        </ScheduleProvider>
      </AuthProvider>
    </OnboardingProvider>
  );
}
