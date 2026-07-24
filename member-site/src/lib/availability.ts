import type { BookingSettings } from "@/types/database";

type Ymd = { year: number; month: number; day: number };

function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

export function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const approxUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMinutes = getTimezoneOffsetMinutes(new Date(approxUtcMs), timeZone);
  return new Date(approxUtcMs - offsetMinutes * 60000);
}

export function getZonedNowParts(timeZone: string): Ymd {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function addDays({ year, month, day }: Ymd, days: number): Ymd {
  const d = new Date(Date.UTC(year, month - 1, day) + days * 86400000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function weekdayOf({ year, month, day }: Ymd): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function generateCandidateSlots(
  settings: BookingSettings,
  fromDate: Ymd
): { starts_at: string; ends_at: string }[] {
  const slots: { starts_at: string; ends_at: string }[] = [];
  const totalDays = settings.sync_weeks_ahead * 7;
  const startOfDayMinutes = settings.weekday_start_hour * 60;
  const endOfDayMinutes = settings.weekday_end_hour * 60;

  for (let i = 0; i < totalDays; i++) {
    const ymd = addDays(fromDate, i);
    const weekday = weekdayOf(ymd);
    if (weekday === 0 || weekday === 6) continue;

    let cursor = startOfDayMinutes;
    while (cursor + settings.slot_duration_minutes <= endOfDayMinutes) {
      const startHour = Math.floor(cursor / 60);
      const startMinute = cursor % 60;
      const endCursor = cursor + settings.slot_duration_minutes;
      const endHour = Math.floor(endCursor / 60);
      const endMinute = endCursor % 60;

      const start = zonedWallTimeToUtc(ymd.year, ymd.month, ymd.day, startHour, startMinute, settings.timezone);
      const end = zonedWallTimeToUtc(ymd.year, ymd.month, ymd.day, endHour, endMinute, settings.timezone);

      slots.push({ starts_at: start.toISOString(), ends_at: end.toISOString() });
      cursor = endCursor;
    }
  }

  return slots;
}
