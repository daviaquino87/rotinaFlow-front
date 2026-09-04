import { format } from "date-fns";
import {
  timeToMinutes,
  START_HOUR,
  TOTAL_HOURS,
  type CalEvent,
} from "@modules/proposals/utils/calendar";

export function EventBlock({ event }: { event: CalEvent }) {
  if (!event.start || event.isAllDay) return null;
  const startMins = timeToMinutes(event.start);
  const endMins = event.end ? timeToMinutes(event.end) : startMins + 60;
  const topPct = ((startMins / 60 - START_HOUR) / TOTAL_HOURS) * 100;
  const heightPct = ((endMins - startMins) / 60 / TOTAL_HOURS) * 100;
  if (topPct < 0 || topPct > 100) return null;
  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1 overflow-hidden text-white text-xs leading-tight cursor-default select-none"
      style={{
        top: `${topPct}%`,
        height: `${Math.max(heightPct, 2.5)}%`,
        backgroundColor: event.color,
        opacity: 0.92,
        minHeight: 22,
      }}
      title={`${event.title}${event.description ? "\n" + event.description : ""}`}
    >
      <p className="font-semibold truncate">{event.title}</p>
      {heightPct > 5 && (
        <p className="opacity-80 truncate">
          {format(new Date(event.start), "HH:mm")}
          {event.end ? ` – ${format(new Date(event.end), "HH:mm")}` : ""}
        </p>
      )}
    </div>
  );
}
