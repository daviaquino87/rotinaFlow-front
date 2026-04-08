import { CalendarCheck2, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
interface SyncConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (clearBefore: boolean) => void;
  loading?: boolean;
}

export function SyncConfirmModal({ open, onClose, onConfirm, loading }: SyncConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v && !loading) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-1">
            <CalendarCheck2 className="w-6 h-6 text-violet-600" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-slate-900">
            Sincronizar com Google Agenda
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 leading-relaxed">
            Deseja limpar os eventos anteriores desta rotina antes de adicionar os novos?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(true)}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-orange-600" />
            </span>
            <span>
              <p className="text-sm font-semibold text-slate-800">Limpar e sincronizar</p>
              <p className="text-xs text-slate-500">Remove eventos anteriores e adiciona os novos</p>
            </span>
          </button>

          <button
            onClick={() => onConfirm(false)}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4 text-violet-600" />
            </span>
            <span>
              <p className="text-sm font-semibold text-slate-800">Apenas adicionar</p>
              <p className="text-xs text-slate-500">Mantém eventos existentes e adiciona os novos</p>
            </span>
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { SyncConfirmModalProps };
