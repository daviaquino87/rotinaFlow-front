import type { CalEvent } from "@modules/proposals/utils/calendar";

export function AllDayBar({ events }: { events: CalEvent[] }) {
  if (!events.length) return null;
  return (
    <div className="flex flex-wrap gap-1 p-1.5">
      {events.map(ev => (
        <span key={ev.id} className="text-xs font-medium px-1.5 py-0.5 rounded text-white truncate max-w-[90%]"
          style={{ backgroundColor: ev.color }}>
          {ev.title}
        </span>
      ))}
    </div>
  );
}
