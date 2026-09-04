import { EventBlock } from "@modules/proposals/components/event-block";
import { HOUR_HEIGHT, START_HOUR, TOTAL_HOURS, type CalEvent } from "@modules/proposals/utils/calendar";

export function DayColumn({ day, events, isToday }: { day: Date; events: CalEvent[]; isToday: boolean }) {
  return (
    <div
      className={`relative border-l border-slate-100 ${isToday ? "bg-primary/[0.02]" : ""}`}
      style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
    >
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${(i / TOTAL_HOURS) * 100}%` }} />
      ))}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={`h-${i}`} className="absolute w-full border-t border-slate-50" style={{ top: `${((i + 0.5) / TOTAL_HOURS) * 100}%` }} />
      ))}
      {isToday && (() => {
        const now = new Date();
        const pct = ((now.getHours() * 60 + now.getMinutes()) / 60 - START_HOUR) / TOTAL_HOURS * 100;
        if (pct < 0 || pct > 100) return null;
        return (
          <div className="absolute w-full z-10" style={{ top: `${pct}%` }}>
            <div className="relative">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-primary -translate-y-1" />
              <div className="border-t-2 border-primary w-full" />
            </div>
          </div>
        );
      })()}
      {events.filter(ev => !ev.isAllDay).map(ev => <EventBlock key={ev.id} event={ev} />)}
    </div>
  );
}
