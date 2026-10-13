const TZ = "America/New_York";

function parts(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    ...options,
  }).formatToParts(date);
}

function pick(list: Intl.DateTimeFormatPart[], type: string) {
  return list.find((p) => p.type === type)?.value ?? "";
}

/** "6:30 PM" in studio time */
export function formatTime(iso: string): string {
  const text = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
  return text.replace(/\u202f/g, " ");
}

/** "Monday, Oct 12" in studio time */
export function formatDay(iso: string): string {
  const p = parts(new Date(iso), {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return `${pick(p, "weekday")}, ${pick(p, "month")} ${pick(p, "day")}`;
}

/** "2026-10-12" in studio time. Use it to group classes by day. */
export function dayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const p = parts(date, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${pick(p, "year")}-${pick(p, "month")}-${pick(p, "day")}`;
}

export type DayInfo = {
  key: string;
  weekday: string;
  date: number;
  label: string;
  isToday: boolean;
};

/** The next `count` days starting today in studio time. */
export function buildDays(count: number): DayInfo[] {
  const [y, m, d] = dayKey(new Date()).split("-").map(Number);
  const base = Date.UTC(y, m - 1, d, 12);
  const weekdayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
  });
  const labelFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(base + i * 86400000);
    return {
      key: date.toISOString().slice(0, 10),
      weekday: weekdayFmt.format(date),
      date: date.getUTCDate(),
      label: labelFmt.format(date),
      isToday: i === 0,
    };
  });
}
