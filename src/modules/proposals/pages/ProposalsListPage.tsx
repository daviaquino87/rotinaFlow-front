import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, RefreshCw, CalendarCheck2, CalendarDays, ExternalLink, Loader2, Trash2, History, Eye, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui-elements";
import { useToast } from "@hooks/use-toast";
import { useListScheduleProposals, type ScheduleProposal } from "@/api-client";
import { Link } from "wouter";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { SyncConfirmModal } from "@modules/proposals/components/sync-confirm-modal";
import { useCredits, useVerifyCreditPayment } from "@modules/credits/hooks/use-credits";
import { apiUrl } from "@lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  start: string | null;
  end: string | null;
  isAllDay: boolean;
  color: string;
}

const proposalUuid = (proposal: ScheduleProposal) => proposal.uuid;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

function timeToMinutes(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

async function fetchCalendarEvents(weekStart: Date) {
  const res = await fetch(`/api/calendar/events?weekStart=${weekStart.toISOString()}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.noToken) throw new Error("NO_TOKEN");
    throw new Error("Erro ao buscar eventos");
  }
  return res.json() as Promise<{ events: CalEvent[]; weekStart: string }>;
}

// ─── Calendar constants ───────────────────────────────────────────────────────
const HOUR_HEIGHT = 52;
const START_HOUR = 6;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;

// ─── Event Block ─────────────────────────────────────────────────────────────
function EventBlock({ event }: { event: CalEvent }) {
  if (!event.start || event.isAllDay) return null;
  const startMins = timeToMinutes(event.start);
  const endMins = event.end ? timeToMinutes(event.end) : startMins + 60;
  const topPct = ((startMins / 60 - START_HOUR) / TOTAL_HOURS) * 100;
  const heightPct = ((endMins - startMins) / 60 / TOTAL_HOURS) * 100;
  if (topPct < 0 || topPct > 100) return null;
  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1 overflow-hidden text-white text-xs leading-tight cursor-default select-none"
      style={{ top: `${topPct}%`, height: `${Math.max(heightPct, 2.5)}%`, backgroundColor: event.color, opacity: 0.92, minHeight: 22 }}
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

function AllDayBar({ events }: { events: CalEvent[] }) {
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

// ─── Day Column ───────────────────────────────────────────────────────────────
function DayColumn({ day, events, isToday }: { day: Date; events: CalEvent[]; isToday: boolean }) {
  return (
    <div
      className={`relative border-l border-slate-100 ${isToday ? "bg-primary/[0.02]" : ""}`}
      style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
    >
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={i} className="absolute w-full border-t border-slate-100" style={{ top: `${(i / TOTAL_HOURS) * 100}%` }} />
      ))}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={`h-${i}`} className="absolute w-full border-t border-slate-50" style={{ top: `${((i + 0.5) / TOTAL_HOURS) * 100}%` }} />
      ))}
      {isToday && (() => {
        const now = new Date();
        const pct = ((now.getHours() * 60 + now.getMinutes()) / 60 - START_HOUR) / TOTAL_HOURS * 100;
        if (pct < 0 || pct > 100) return null;
        return (
          <div className="absolute w-full z-10" style={{ top: `${pct}%` }}>
            <div className="relative">
              <div className="absolute -left-1 w-2 h-2 rounded-full bg-primary -translate-y-1" />
              <div className="border-t-2 border-primary w-full" />
            </div>
          </div>
        );
      })()}
      {events.filter(ev => !ev.isAllDay).map(ev => <EventBlock key={ev.id} event={ev} />)}
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({
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
    mutationFn: async ({ uuid, title }: { uuid: string; title: string }) => {
      const res = await fetch(`/api/schedule/proposals/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Erro ao renomear");
      return res.json();
    },
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProposalsListPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekMonday(new Date()));
  const [mobileDayIdx, setMobileDayIdx] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState<number | undefined>(undefined);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingSyncProposalId, setPendingSyncProposalId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { data: creditsData, refetch: refetchCredits } = useCredits();
  const verifyCredit = useVerifyCreditPayment();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["calendar-events", weekStart.toISOString()],
    queryFn: () => fetchCalendarEvents(weekStart),
    retry: false,
  });

  const { data: proposals } = useListScheduleProposals();
  const noToken = isError && (error as Error)?.message === "NO_TOKEN";

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const visibleDays = isMobile ? [days[mobileDayIdx]] : days;
  const colCount = visibleDays.length;

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const day of days) {
      const key = toDateStr(day);
      map[key] = (data?.events ?? []).filter(ev => {
        if (!ev.start) return false;
        return isSameDay(parseISO(ev.start.length === 10 ? ev.start : ev.start), day);
      });
    }
    return map;
  }, [data, days]);

  const allDayByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    for (const day of days) {
      const key = toDateStr(day);
      map[key] = (data?.events ?? []).filter(ev => ev.isAllDay && ev.start === key);
    }
    return map;
  }, [data, days]);

  const latestProposal = useMemo(() => proposals?.[0] ?? null, [proposals]);
  const today = new Date();
  const weekLabel = `${format(weekStart, "d 'de' MMMM", { locale: ptBR })} – ${format(addDays(weekStart, 6), "d 'de' MMMM", { locale: ptBR })}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const creditSession = params.get("credit_session");
    const cancelled = params.get("credit_cancelled");
    if (creditSession) {
      verifyCredit(creditSession).then((data) => {
        if (data.paid) toast({ title: "Créditos adicionados!", description: `+${data.added} crédito${(data.added ?? 0) > 1 ? "s" : ""} na sua conta.` });
      }).catch(() => {});
      window.history.replaceState({}, "", window.location.pathname);
    } else if (cancelled) {
      toast({ title: "Compra cancelada", description: "Nenhum crédito foi adicionado.", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const syncMutation = useMutation({
    mutationFn: async ({ proposalUuid, clearBefore }: { proposalUuid: string; clearBefore: boolean }) => {
      const res = await fetch(`/api/schedule/proposals/${proposalUuid}/approve`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearBefore }),
      });
      const body = await res.json();
      if (res.status === 402) { setCreditsRequired(body.required); setShowCreditsModal(true); throw new Error("INSUFFICIENT_CREDITS"); }
      if (!res.ok) throw new Error(body.error || "Erro ao sincronizar");
      return body;
    },
    onSuccess: (data) => {
      toast({ title: "Sincronizado!", description: data.message ?? "Rotina enviada para o Google Agenda." });
      refetchCredits();
      refetch();
    },
    onError: (err: Error) => {
      if (err.message !== "INSUFFICIENT_CREDITS") toast({ title: "Erro ao sincronizar", description: "Não foi possível sincronizar. Tente novamente.", variant: "destructive" });
    },
  });

  const clearCalendarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/schedule/calendar/events", {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erro ao limpar agenda");
      return body;
    },
    onSuccess: (data) => {
      toast({ title: "Agenda limpa!", description: data.message ?? "Eventos removidos do Google Agenda." });
      refetch();
    },
    onError: () => {
      toast({ title: "Erro ao limpar agenda", description: "Não foi possível limpar os eventos. Tente novamente.", variant: "destructive" });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await fetch(`/api/schedule/proposals/${uuid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erro ao excluir rotina");
      return body;
    },
    onSuccess: () => {
      toast({ title: "Rotina excluída!" });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/proposals"] });
    },
    onError: () => {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir a rotina. Tente novamente.", variant: "destructive" });
    },
  });

  const handleOpenSyncModal = (proposalUuid: string) => { setPendingSyncProposalId(proposalUuid); setShowSyncModal(true); };
  const handleSyncConfirm = (clearBefore: boolean) => {
    setShowSyncModal(false);
    if (pendingSyncProposalId !== null) { syncMutation.mutate({ proposalUuid: pendingSyncProposalId, clearBefore }); setPendingSyncProposalId(null); }
  };

  const handleClearCalendar = () => {
    setShowClearConfirm(false);
    clearCalendarMutation.mutate();
  };

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => { setWeekStart(getWeekMonday(new Date())); const d = new Date().getDay(); setMobileDayIdx(d === 0 ? 6 : d - 1); };

  return (
    <div className="flex flex-col h-full">

      <div className="flex flex-col gap-2 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-bold text-slate-900 flex-1 min-w-0 truncate">Minha Rotina</h1>
          <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden">
            <button onClick={prevWeek} className="p-2 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
              Hoje
            </button>
            <button onClick={nextWeek} className="p-2 hover:bg-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Atualizar calendário"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={clearCalendarMutation.isPending}
            className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpar agenda"
          >
            {clearCalendarMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2 className="w-4 h-4" />
            }
          </button>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400 flex-1 min-w-0 truncate capitalize">{weekLabel}</p>
          {latestProposal && latestProposal.status !== "approved" ? (
            <Button
              onClick={() => handleOpenSyncModal(proposalUuid(latestProposal))}
              isLoading={syncMutation.isPending}
              disabled={syncMutation.isPending}
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow shadow-indigo-400/30 text-xs h-8 px-3 shrink-0"
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar Rotina IA</span>
              <span className="sm:hidden">Sincronizar</span>
            </Button>
          ) : latestProposal?.status === "approved" ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-xl shrink-0">
              <CalendarCheck2 className="w-3 h-3" /> Sincronizada
            </span>
          ) : (
            <Link href="/routine">
              <Button variant="outline" className="gap-1.5 text-xs h-8 px-3 shrink-0">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Criar Rotina IA</span>
                <span className="sm:hidden">Nova Rotina</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="sm:hidden flex overflow-x-auto gap-1 px-3 py-2 bg-white border-b border-slate-100 shrink-0 scrollbar-hide">
        {days.map((day, idx) => {
          const isToday = isSameDay(day, today);
          const isSelected = idx === mobileDayIdx;
          const hasEvents = (eventsByDay[toDateStr(day)] ?? []).length > 0;
          return (
            <button
              key={day.toISOString()}
              onClick={() => setMobileDayIdx(idx)}
              className={`flex flex-col items-center shrink-0 px-3 py-1.5 rounded-xl transition-all min-w-[44px] ${
                isSelected ? "bg-primary text-white" : isToday ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase">{format(day, "EEE", { locale: ptBR })}</span>
              <span className="text-base font-bold leading-tight">{format(day, "d")}</span>
              {hasEvents && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-primary"}`} />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 min-h-0">
        {noToken ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Google Agenda não conectado</h3>
            <p className="text-slate-500 max-w-sm text-sm">Para ver sua agenda, faça login novamente com sua conta Google para autorizar o acesso ao Google Calendar.</p>
            <a href={apiUrl("/api/auth/google")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
              <ExternalLink className="w-4 h-4" /> Reconectar com Google
            </a>
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-slate-600 font-medium">Erro ao carregar calendário</p>
              <p className="text-slate-400 text-sm mt-1">Não foi possível carregar os eventos. Tente novamente.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4 gap-2">
                <RefreshCw className="w-4 h-4" /> Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div
              className="sticky top-0 bg-white z-10 border-b border-slate-100"
              style={{ display: "grid", gridTemplateColumns: `52px repeat(${colCount}, 1fr)` }}
            >
              <div />
              {visibleDays.map(day => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={day.toISOString()} className="text-center py-2 border-l border-slate-100">
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? "text-primary" : "text-slate-400"}`}>
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <div className={`mx-auto mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isToday ? "bg-primary text-white" : "text-slate-800"}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleDays.some(d => allDayByDay[toDateStr(d)]?.length > 0) && (
              <div
                className="border-b border-slate-100 bg-slate-50"
                style={{ display: "grid", gridTemplateColumns: `52px repeat(${colCount}, 1fr)` }}
              >
                <div className="flex items-center justify-end pr-2 text-[10px] text-slate-400 font-medium">tudo</div>
                {visibleDays.map(day => (
                  <div key={day.toISOString()} className="border-l border-slate-100 min-h-[28px]">
                    <AllDayBar events={allDayByDay[toDateStr(day)] ?? []} />
                  </div>
                ))}
              </div>
            )}

            <div className="relative" style={{ display: "grid", gridTemplateColumns: `52px repeat(${colCount}, 1fr)` }}>
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              <div className="flex flex-col" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div key={i} className="flex items-start justify-end pr-2 pt-0" style={{ height: HOUR_HEIGHT }}>
                    <span className="text-[10px] text-slate-400 font-medium -translate-y-2">
                      {String(START_HOUR + i).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>
              {visibleDays.map(day => (
                <DayColumn
                  key={toDateStr(day)}
                  day={day}
                  events={eventsByDay[toDateStr(day)] ?? []}
                  isToday={isSameDay(day, today)}
                />
              ))}
            </div>

            <div className="lg:hidden border-t border-slate-100 bg-white">
              <HistoryPanel
                proposals={proposals ?? []}
                onSync={handleOpenSyncModal}
                syncingUuid={syncMutation.isPending ? (syncMutation.variables?.proposalUuid ?? null) : null}
                onDelete={(uuid) => deleteProposalMutation.mutate(uuid)}
                deletingUuid={deleteProposalMutation.isPending ? (deleteProposalMutation.variables ?? null) : null}
              />
            </div>
          </div>
        )}

        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-slate-100 overflow-y-auto bg-white">
          <HistoryPanel
            proposals={proposals ?? []}
            onSync={handleOpenSyncModal}
            syncingUuid={syncMutation.isPending ? (syncMutation.variables?.proposalUuid ?? null) : null}
            onDelete={(uuid) => deleteProposalMutation.mutate(uuid)}
            deletingUuid={deleteProposalMutation.isPending ? (deleteProposalMutation.variables ?? null) : null}
          />
        </div>
      </div>

      <CreditsModal
        open={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        currentCredits={creditsData?.credits ?? 0}
        requiredCredits={creditsRequired}
        action="sincronizar com Google Agenda"
      />
      <SyncConfirmModal
        open={showSyncModal}
        onClose={() => { setShowSyncModal(false); setPendingSyncProposalId(null); }}
        onConfirm={handleSyncConfirm}
        loading={syncMutation.isPending}
      />

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Limpar agenda</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm">
                Isso vai remover <strong>todos os eventos</strong> que o rotinaFlow sincronizou no seu Google Agenda. Os eventos que você criou manualmente não serão afetados.
              </p>
              <p className="text-slate-400 text-xs mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearConfirm(false)}>
                Cancelar
              </Button>
              <button
                onClick={handleClearCalendar}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
