import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck2, CalendarDays, Loader2, Trash2, History, Eye, Pencil, Check, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui-elements";
import { useToast } from "@hooks/use-toast";
import { customFetch, type ScheduleProposal } from "@/api-client";
import { proposalUuid } from "@modules/proposals/utils/calendar";

export function HistoryPanel({
  proposals,
  onSync,
  syncingUuid,
  onDelete,
  deletingUuid,
}: {
  proposals: ScheduleProposal[];
  onSync: (uuid: string) => void;
  syncingUuid: string | null;
  onDelete: (uuid: string) => void;
  deletingUuid: string | null;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const renameMut = useMutation({
    mutationFn: ({ uuid, title }: { uuid: string; title: string }) =>
      customFetch(`/api/schedule/proposals/${uuid}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/proposals"] });
      setEditingUuid(null);
      setEditValue("");
    },
    onError: () => toast({ title: "Erro ao renomear", variant: "destructive" }),
  });

  const startEdit = (p: ScheduleProposal, fallbackLabel: string) => {
    setEditingUuid(proposalUuid(p));
    setEditValue(p.title || fallbackLabel);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => { setEditingUuid(null); setEditValue(""); };

  const saveEdit = (uuid: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) { cancelEdit(); return; }
    renameMut.mutate({ uuid, title: trimmed });
  };

  if (!proposals.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <History className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Nenhuma rotina salva</p>
        <p className="text-xs text-slate-400">Gere sua primeira rotina para ver o histórico aqui.</p>
        <Link href="/routine">
          <Button variant="outline" className="text-xs h-8 px-3 gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Criar Rotina
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50 sticky top-0">
        <History className="w-4 h-4 text-slate-500" />
        <h2 className="text-sm font-bold text-slate-700">Histórico de Rotinas</h2>
        <span className="ml-auto text-xs text-slate-400 bg-slate-200 rounded-full px-2 py-0.5">{proposals.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {proposals.map((p, idx) => {
          const isApproved = p.status === "approved";
          const pUuid = proposalUuid(p);
          const isSyncing = syncingUuid === pUuid;
          const isDeleting = deletingUuid === pUuid;
          const isEditing = editingUuid === pUuid;
          const isSaving = renameMut.isPending && editingUuid === pUuid;
          const date = new Date(p.createdAt);
          const fallbackLabel = `Rotina ${proposals.length - idx}`;
          const displayTitle = p.title || fallbackLabel;
          return (
            <div key={pUuid} className="px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") saveEdit(pUuid);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="flex-1 min-w-0 text-xs font-semibold text-slate-800 bg-slate-100 border border-primary/40 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/30"
                        maxLength={60}
                        disabled={isSaving}
                      />
                      <button
                        onClick={() => saveEdit(pUuid)}
                        disabled={isSaving}
                        className="p-1 rounded-lg text-green-600 hover:bg-green-50 transition-all"
                        title="Salvar"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-all"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(p, fallbackLabel)}
                      className="group flex items-center gap-1 max-w-full text-left"
                      title="Clique para renomear"
                    >
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {displayTitle}
                      </p>
                      <Pencil className="w-3 h-3 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                    </button>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {format(date, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isApproved ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CalendarCheck2 className="w-3 h-3" /> Sincronizada
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Pendente
                    </span>
                  )}
                  <button
                    onClick={() => onDelete(pUuid)}
                    disabled={isDeleting}
                    className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    title="Excluir rotina"
                  >
                    {isDeleting
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/proposal/${pUuid}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                    <Eye className="w-3.5 h-3.5" /> Visualizar
                  </button>
                </Link>
                <button
                  onClick={() => onSync(pUuid)}
                  disabled={isSyncing || isDeleting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <CalendarCheck2 className="w-3.5 h-3.5" />
                  }
                  {isApproved ? "Re-sincronizar" : "Sincronizar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-slate-100">
        <Link href="/routine">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
            <CalendarDays className="w-3.5 h-3.5" /> Nova Rotina
          </button>
        </Link>
      </div>
    </div>
  );
}
