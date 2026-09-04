import { useMemo } from "react";
import type { ScheduleEvent } from "@/api-client";
import { DAYS_OF_WEEK } from "@lib/utils";
import { getCategory, eventDuration } from "@modules/proposals/utils/event-category";

export function useProposalStats(localEvents: ScheduleEvent[], selectedDayId: string) {
  const eventsByDay = useMemo(
    () =>
      DAYS_OF_WEEK.reduce(
        (acc, day) => {
          acc[day.id] = localEvents
            .filter((e) => e.dayOfWeek === day.id)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          return acc;
        },
        {} as Record<string, ScheduleEvent[]>,
      ),
    [localEvents],
  );

  const selectedDayEvents = useMemo(
    () => eventsByDay[selectedDayId] ?? [],
    [eventsByDay, selectedDayId],
  );

  const equilibrio = useMemo(() => {
    const mins = { produtividade: 0, bemEstar: 0, lazer: 0 };
    selectedDayEvents.forEach((ev) => {
      const cat = getCategory(ev).label;
      const dur = eventDuration(ev);
      if (cat === "Trabalho" || cat === "Novo Hábito") mins.produtividade += dur;
      else if (cat === "Saúde" || cat === "Refeição") mins.bemEstar += dur;
      else if (cat === "Lazer") mins.lazer += dur;
    });
    const total = mins.produtividade + mins.bemEstar + mins.lazer || 1;
    return {
      produtividade: Math.round((mins.produtividade / total) * 100),
      bemEstar: Math.round((mins.bemEstar / total) * 100),
      lazer: Math.round((mins.lazer / total) * 100),
    };
  }, [selectedDayEvents]);

  const distribuicaoSegments = useMemo(() => {
    const totals: Record<string, { value: number; color: string }> = {};
    localEvents.forEach((ev) => {
      const cat = getCategory(ev);
      const dur = eventDuration(ev);
      if (!totals[cat.label]) totals[cat.label] = { value: 0, color: cat.color };
      totals[cat.label].value += dur;
    });
    return Object.entries(totals).map(([label, info]) => ({ label, ...info }));
  }, [localEvents]);

  return { eventsByDay, selectedDayEvents, equilibrio, distribuicaoSegments };
}
