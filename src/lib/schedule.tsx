import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

export type ClassItem = {
  id: string;
  starts_at: string;
  duration_min: number;
  capacity: number;
  class_type_id: string;
  class_name: string;
  class_description: string | null;
  trainer_id: string;
  trainer_name: string;
  spots_left: number;
  booked_by_me: boolean;
};

const COLUMNS =
  "id, starts_at, duration_min, capacity, class_type_id, class_name, class_description, trainer_id, trainer_name, spots_left, booked_by_me";

type ScheduleValue = {
  classes: ClassItem[];
  loading: boolean;
  refreshing: boolean;
  failed: boolean;
  reload: () => Promise<void>;
  refresh: () => void;
  retry: () => void;
  getClass: (id: string) => ClassItem | undefined;
  setBooked: (id: string, booked: boolean) => void;
};

const ScheduleContext = createContext<ScheduleValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("class_schedule")
      .select(COLUMNS)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    if (error) {
      console.log("Schedule error:", error.message);
      setFailed(true);
    } else {
      setClasses((data ?? []) as ClassItem[]);
      setFailed(false);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Loads on start and again whenever the signed-in user changes.
  useEffect(() => {
    reload();
  }, [reload, userId]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    reload();
  }, [reload]);

  const retry = useCallback(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const getClass = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  // Optimistic local patch. Calling it again with the opposite value rolls it back.
  const setBooked = useCallback((id: string, booked: boolean) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.booked_by_me === booked) return c;
        const delta = booked ? -1 : 1;
        return {
          ...c,
          booked_by_me: booked,
          spots_left: Math.min(c.capacity, Math.max(0, c.spots_left + delta)),
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      classes,
      loading,
      refreshing,
      failed,
      reload,
      refresh,
      retry,
      getClass,
      setBooked,
    }),
    [
      classes,
      loading,
      refreshing,
      failed,
      reload,
      refresh,
      retry,
      getClass,
      setBooked,
    ],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleValue {
  const value = useContext(ScheduleContext);
  if (!value) {
    throw new Error("useSchedule must be used inside ScheduleProvider");
  }
  return value;
}
