import { ApiError, customFetch, type ScheduleProposal } from "@/api-client";

export interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  start: string | null;
  end: string | null;
  isAllDay: boolean;
  color: string;
}

export const proposalUuid = (proposal: ScheduleProposal) => proposal.uuid;

export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

export function timeToMinutes(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export async function fetchCalendarEvents(weekStart: Date) {
  try {
    return await customFetch<{ events: CalEvent[]; weekStart: string }>(
      `/api/calendar/events?weekStart=${weekStart.toISOString()}`,
    );
  } catch (err) {
    if (err instanceof ApiError && (err.data as { noToken?: boolean } | null)?.noToken) {
      throw new Error("NO_TOKEN", { cause: err });
    }
    throw new Error("Erro ao buscar eventos", { cause: err });
  }
}

// ─── Day-grid layout constants ─────────────────────────────────────────────
export const HOUR_HEIGHT = 52;
export const START_HOUR = 6;
export const END_HOUR = 23;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
