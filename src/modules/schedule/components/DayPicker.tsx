import { cn } from "@lib/utils";
import { ALL_DAYS } from "../constants";
import type { Day } from "../types";

interface DayPickerProps {
  days: Day[];
  onChange: (days: Day[]) => void;
}

export function DayPicker({ days, onChange }: DayPickerProps) {
  const toggle = (d: Day) => onChange(days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
  return (
    <div className="flex gap-1.5 flex-wrap">
      {ALL_DAYS.map(day => (
        <button key={day.id} type="button" onClick={() => toggle(day.id)}
          className={cn("px-2.5 h-9 rounded-xl text-xs font-bold transition-all",
            days.includes(day.id) ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
          title={day.label}>
          {day.abbr}
        </button>
      ))}
      <button type="button"
        onClick={() => onChange(days.length === 7 ? [] : ALL_DAYS.map(d => d.id))}
        className="px-2.5 h-9 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all">
        {days.length === 7 ? "Nenhum" : "Todos"}
      </button>
    </div>
  );
}
