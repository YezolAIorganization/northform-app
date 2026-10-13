import { supabase } from "./supabase";

export type BookingResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const MESSAGES: Record<string, string> = {
  not_authenticated: "Log in to book classes.",
  class_not_found: "That class is no longer available.",
  class_started: "This class has already started.",
  too_far_ahead: "You can book up to 14 days ahead.",
  already_booked: "You're already booked into this class.",
  class_full: "This class is full.",
  booking_not_found: "We couldn't find that booking.",
  too_late: "Too late to cancel. Classes lock 2 hours before start.",
};

function toResult(error: { message?: string } | null): BookingResult {
  if (!error) return { ok: true };

  const text = (error.message ?? "").toLowerCase();
  const code = Object.keys(MESSAGES).find((c) => text.includes(c));
  if (code) {
    return { ok: false, code, message: MESSAGES[code] };
  }
  if (text.includes("network") || text.includes("fetch")) {
    return {
      ok: false,
      code: "offline",
      message: "You're offline. Reconnect to book classes.",
    };
  }
  console.log("Booking error:", error.message);
  return {
    ok: false,
    code: "unknown",
    message: "Something went wrong. Please try again.",
  };
}

export async function bookClass(classId: string): Promise<BookingResult> {
  try {
    const { error } = await supabase.rpc("book_class", { p_class_id: classId });
    return toResult(error);
  } catch {
    return toResult({ message: "unknown" });
  }
}

export async function cancelBooking(bookingId: string): Promise<BookingResult> {
  try {
    const { error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
    });
    const result = toResult(error);
    if (!result.ok && result.code === "offline") {
      return { ...result, message: "You're offline. Reconnect to cancel." };
    }
    return result;
  } catch {
    return toResult({ message: "unknown" });
  }
}
