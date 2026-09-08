import React from "react";
import { Edit2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@lib/utils";
import type { ScheduleEvent } from "@/api-client";
import { getCategory } from "@modules/proposals/utils/event-category";

export function TimelineEventCard({
  event,
  onEdit,
  onMoveUp,
  onMoveDown,
  isDragging,
  isOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  event: ScheduleEvent;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
  isOver?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
}) {
  const cat = getCategory(event);
  return (
    <div
      className={cn(
        "flex items-start gap-3 sm:gap-4 w-full transition-all duration-200",
        isDragging && "opacity-40 scale-95",
      )}
    >
      {/* Rail: a single column of connector line + category dot, in
          chronological order — replaces the old alternating left/right
          layout, which forced the eye to zigzag instead of reading top to
          bottom and left a large empty gap on whichever side had the
          shorter card. */}
      <div className="hidden sm:block relative w-4 self-stretch shrink-0">
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-slate-100" />
        <div
          className={cn(
            "absolute top-5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md z-10 transition-transform duration-150",
            isOver && "scale-125",
          )}
          style={{ backgroundColor: isOver ? "var(--color-primary, #c904bc)" : cat.color }}
        />
      </div>

      {/* Content */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart?.();
        }}
        onDragEnd={() => {
          onDragEnd?.();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onDragOver?.(e);
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          onDrop?.();
        }}
        className={cn(
          "flex-1 min-w-0 bg-white rounded-2xl p-4 shadow-sm border-2 transition-all duration-150 group select-none text-left",
          isOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]"
            : "border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-200",
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-slate-800">
            {event.startTime.substring(0, 5)} – {event.endTime.substring(0, 5)}
          </span>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: cat.bg, color: cat.textColor }}
          >
            {cat.label}
          </span>
        </div>
        <p className="font-bold text-slate-900 text-base">{event.title}</p>
        {event.description && (
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{event.description}</p>
        )}

        {/* Actions row */}
        {onEdit && (
          <div className="flex items-center gap-1 mt-2.5 justify-start">
            {/* Edit — always visible on mobile, hover-only on desktop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary hover:bg-primary/8 px-2 py-1 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Edit2 className="w-3 h-3" /> Editar
            </button>
            {/* Up/down — only on mobile */}
            {(onMoveUp || onMoveDown) && (
              <div className="flex sm:hidden items-center gap-0.5 ml-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.();
                  }}
                  disabled={!onMoveUp}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/8 disabled:opacity-20 transition-all"
                  title="Mover para cima"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.();
                  }}
                  disabled={!onMoveDown}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/8 disabled:opacity-20 transition-all"
                  title="Mover para baixo"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
