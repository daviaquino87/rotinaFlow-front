import type { ScheduleProposal } from "@/api-client";

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
  const res = await fetch(`/api/calendar/events?weekStart=${weekStart.toISOString()}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.noToken) throw new Error("NO_TOKEN");
    throw new Error("Erro ao buscar eventos");
  }
  return res.json() as Promise<{ events: CalEvent[]; weekStart: string }>;
}

// ─── Day-grid layout constants ─────────────────────────────────────────────
export const HOUR_HEIGHT = 52;
export const START_HOUR = 6;
export const END_HOUR = 23;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
