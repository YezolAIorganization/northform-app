import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

export type BookingItem = {
  booking_id: string;
  status: "booked" | "cancelled";
  booked_at: string;
  cancelled_at: string | null;
  class_id: string;
  starts_at: string;
  duration_min: number;
  class_name: string;
  trainer_name: string;
};

const COLUMNS =
  "booking_id, status, booked_at, cancelled_at, class_id, starts_at, duration_min, class_name, trainer_name";

export function useBookings() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setFailed(false);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data, error } = await supabase
      .from("my_bookings")
      .select(COLUMNS)
      .eq("status", "booked")
      .order("starts_at", { ascending: true });

    if (error) {
      console.log("Bookings error:", error.message);
      setFailed(true);
    } else {
      setBookings((data ?? []) as BookingItem[]);
      setFailed(false);
    }
    setLoading(false);
    setRefreshing(false);
  }, [userId]);

  // Loads on first use and again whenever the signed-in user changes.
  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    reload();
  }, [reload]);

  const retry = useCallback(() => {
    setLoading(true);
    reload();
  }, [reload]);

  // Optimistic cancel: remove now, restore if the server refuses.
  const removeLocal = useCallback((bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
  }, []);

  const restoreLocal = useCallback((item: BookingItem) => {
    setBookings((prev) =>
      [...prev, item].sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      ),
    );
  }, []);

  return {
    bookings,
    loading,
    refreshing,
    failed,
    reload,
    refresh,
    retry,
    removeLocal,
    restoreLocal,
  };
}
