import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

const KEY = "northform:onboarded";

type OnboardingValue = {
  ready: boolean;
  seen: boolean;
  complete: () => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((value) => setSeen(value === "1"))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const complete = useCallback(() => {
    setSeen(true);
    AsyncStorage.setItem(KEY, "1").catch(() => {});
  }, []);

  const reset = useCallback(() => {
    setSeen(false);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ ready, seen, complete, reset }),
    [ready, seen, complete, reset],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingValue {
  const value = useContext(OnboardingContext);
  if (!value) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }
  return value;
}
