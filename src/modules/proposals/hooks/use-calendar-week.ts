import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@hooks/use-mobile";
import { fetchCalendarEvents, getWeekMonday, toDateStr, type CalEvent } from "@modules/proposals/utils/calendar";

export function useCalendarWeek() {
  const isMobile = useIsMobile();
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekMonday(new Date()));
  const [mobileDayIdx, setMobileDayIdx] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["calendar-events", weekStart.toISOString()],
    queryFn: () => fetchCalendarEvents(weekStart),
    retry: false,
  });
  const noToken = isError && (error as Error)?.message === "NO_TOKEN";

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleDays = isMobile ? [days[mobileDayIdx]] : days;

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const day of days) {
      const key = toDateStr(day);
      map[key] = (data?.events ?? []).filter(ev => ev.start && isSameDay(parseISO(ev.start), day));
    }
    return map;
  }, [data, days]);

  const allDayByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const day of days) {
      const key = toDateStr(day);
      map[key] = (data?.events ?? []).filter(ev => ev.isAllDay && ev.start === key);
    }
    return map;
  }, [data, days]);

  const weekLabel = `${format(weekStart, "d 'de' MMMM", { locale: ptBR })} – ${format(addDays(weekStart, 6), "d 'de' MMMM", { locale: ptBR })}`;

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => {
    setWeekStart(getWeekMonday(new Date()));
    const d = new Date().getDay();
    setMobileDayIdx(d === 0 ? 6 : d - 1);
  };

  return {
    isMobile,
    days,
    visibleDays,
    mobileDayIdx,
    setMobileDayIdx,
    eventsByDay,
    allDayByDay,
    weekLabel,
    isLoading,
    isFetching,
    isError,
    noToken,
    refetch,
    prevWeek,
    nextWeek,
    goToday,
  };
}
