import type { ReactNode } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none p-2 -m-2 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            &times;
          </button>
        </div>
        {/* flex-1 min-h-0 lets this scroll internally instead of the card
            growing past max-h-[90vh] and clipping "Salvar" under the
            virtual keyboard — a flex item won't shrink below its content
            height without min-h-0. */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
