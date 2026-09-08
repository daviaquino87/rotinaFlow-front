import { Plus } from "lucide-react";

export function AddBetweenButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      // opacity-0 by default only made sense for :hover, which doesn't exist
      // on touch — that hid this control (and the "add between" feature
      // entirely) on every mobile device. Visible-but-subtle below sm:,
      // hover-reveal preserved on pointer devices.
      className="group w-full flex items-center gap-2 py-2 opacity-40 sm:opacity-0 sm:hover:opacity-100 focus:opacity-100 transition-opacity duration-150"
    >
      <div className="flex-1 h-px bg-slate-200 group-hover:bg-primary/30 transition-colors" />
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-primary px-2 py-0.5 rounded-full group-hover:bg-primary/10 transition-all whitespace-nowrap">
        <Plus className="w-3 h-3" /> Adicionar
      </span>
      <div className="flex-1 h-px bg-slate-200 group-hover:bg-primary/30 transition-colors" />
    </button>
  );
}
