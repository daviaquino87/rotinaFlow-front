import { Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@lib/utils";
import { DayPicker } from "./DayPicker";
import type { Activity } from "../types";

const CUSTOM_EMOJIS = ["⭐","📌","🎯","💡","🔔","🏊","🚴","🎨","🎵","📷","✈️","🐾","🌿","💪","📝"];

function formatDayList(days: Activity["days"]): string {
  const ordered: Activity["days"][number][] = ["seg","ter","qua","qui","sex","sab","dom"];
  const sorted = ordered.filter(d => days.includes(d));
  if (sorted.length === 7) return "todos os dias";
  if (JSON.stringify(sorted) === JSON.stringify(["seg","ter","qua","qui","sex"])) return "dias úteis";
  if (JSON.stringify(sorted) === JSON.stringify(["sab","dom"])) return "fim de semana";
  const labels: Record<string, string> = {
    seg: "Segunda", ter: "Terça", qua: "Quarta",
    qui: "Quinta",  sex: "Sexta", sab: "Sábado", dom: "Domingo"
  };
  return sorted.map(d => labels[d]).join(", ");
}

interface ActivityCardProps {
  activity: Activity;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<Activity>) => void;
  onRemove: () => void;
}

export function ActivityCard({ activity, onToggleExpand, onUpdate, onRemove }: ActivityCardProps) {
  return (
    <div className={cn("border rounded-2xl overflow-hidden transition-all duration-200",
      activity.expanded ? "border-primary/30 shadow-md shadow-primary/5" : "border-slate-200")}>
      <div className={cn("flex items-center gap-3 px-4 py-3 cursor-pointer select-none",
        activity.expanded ? "bg-primary/5" : "bg-white hover:bg-slate-50")} onClick={onToggleExpand}>
        <span className="text-2xl">{activity.emoji}</span>
        <div className="flex-1 min-w-0">
          {activity.custom
            ? <input className="font-semibold text-slate-800 bg-transparent border-none outline-none w-full text-sm"
                value={activity.name} onChange={e => onUpdate({ name: e.target.value })}
                onClick={e => e.stopPropagation()} placeholder="Nome da atividade..." />
            : <p className="font-semibold text-slate-800 text-sm">{activity.name}</p>}
          {!activity.expanded && activity.days.length > 0 && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              <Clock className="inline w-3 h-3 mr-1" />
              {formatDayList(activity.days)} · {activity.startTime}–{activity.endTime}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="text-slate-300 hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
          {activity.expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      {activity.expanded && (
        <div className="px-4 pb-4 pt-2 bg-white space-y-4 border-t border-slate-100">
          {activity.custom && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Ícone</label>
              <div className="flex gap-2 flex-wrap">
                {CUSTOM_EMOJIS.map(em => (
                  <button key={em} type="button" onClick={() => onUpdate({ emoji: em })}
                    className={cn("w-9 h-9 rounded-xl text-lg transition-all",
                      activity.emoji === em ? "bg-primary/20 ring-2 ring-primary" : "bg-slate-100 hover:bg-slate-200")}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Dias</label>
            <DayPicker days={activity.days} onChange={days => onUpdate({ days })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Início</label>
              <input type="time" value={activity.startTime} onChange={e => onUpdate({ startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Fim</label>
              <input type="time" value={activity.endTime} onChange={e => onUpdate({ endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
