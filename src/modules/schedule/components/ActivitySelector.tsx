import { Plus, Check } from "lucide-react";
import { cn } from "@lib/utils";
import { ActivityCard } from "./ActivityCard";
import type { Activity, ActivityPreset } from "../types";

interface ActivitySelectorProps {
  presets: ActivityPreset[];
  activities: Activity[];
  onAddPreset: (preset: ActivityPreset) => void;
  onAddCustom: () => void;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Activity>) => void;
  onRemove: (id: string) => void;
  label: string;
}

export function ActivitySelector({
  presets,
  activities,
  onAddPreset,
  onAddCustom,
  onToggleExpand,
  onUpdate,
  onRemove,
  label,
}: ActivitySelectorProps) {
  const selectedNames = new Set(activities.map(a => a.name));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">{label}</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map(preset => {
            const selected = selectedNames.has(preset.name);
            return (
              <button key={preset.name} type="button"
                onClick={() => selected ? onRemove(activities.find(a => a.name === preset.name)!.id) : onAddPreset(preset)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                  selected ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-primary/5")}>
                <span>{preset.emoji}</span>
                <span>{preset.name}</span>
                {selected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {activities.length > 0 && (
        <div className="space-y-3">
          {activities.map(activity => (
            <ActivityCard key={activity.id} activity={activity}
              onToggleExpand={() => onToggleExpand(activity.id)}
              onUpdate={u => onUpdate(activity.id, u)}
              onRemove={() => onRemove(activity.id)} />
          ))}
        </div>
      )}

      {activities.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Nenhuma atividade adicionada ainda.</p>
        </div>
      )}

      <button type="button" onClick={onAddCustom}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium">
        <Plus className="w-4 h-4" />
        Adicionar atividade personalizada
      </button>
    </div>
  );
}
