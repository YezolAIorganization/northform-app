import type { AuthError, Session } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { supabase } from "./supabase";

type AuthValue = {
  session: Session | null;
  loading: boolean;
  name: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function friendly(error: AuthError, mode: "signin" | "signup"): string {
  const text = error.message.toLowerCase();

  if (error.name === "AuthRetryableFetchError" || text.includes("network")) {
    return "Can't connect. Check your connection and try again.";
  }
  if (
    mode === "signin" &&
    (error.code === "invalid_credentials" || text.includes("invalid login"))
  ) {
    return "Incorrect email or password.";
  }
  if (
    mode === "signup" &&
    (error.code === "user_already_exists" ||
      text.includes("already registered"))
  ) {
    return "That email is already registered. Try logging in.";
  }
  if (error.code === "weak_password") {
    return "Password must be at least 8 characters.";
  }
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error ? friendly(error, "signin") : null;
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      return error ? friendly(error, "signup") : null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const name = useMemo(() => {
    const meta = session?.user.user_metadata?.full_name;
    if (typeof meta === "string" && meta.trim()) return meta.trim();
    return session?.user.email?.split("@")[0] ?? "";
  }, [session]);

  const value = useMemo(
    () => ({ session, loading, name, signIn, signUp, signOut }),
    [session, loading, name, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
