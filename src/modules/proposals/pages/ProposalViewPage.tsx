import React, { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ScheduleEvent
} from "@/api-client";
import { useQuery } from "@tanstack/react-query";
import { DAYS_OF_WEEK, formatTime, cn } from "@lib/utils";
import { Button, Badge, Skeleton, Input } from "@/components/ui-elements";
import {
  Save, Trash2, Edit2, CalendarCheck2,
  RefreshCw, Check, Plus, ArrowLeft, ChevronUp, ChevronDown
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { SyncConfirmModal } from "@modules/proposals/components/sync-confirm-modal";
import { useCredits, useVerifyCreditPayment } from "@modules/credits/hooks/use-credits";

// ─── Category helpers ─────────────────────────────────────────────────────────
interface Category { label: string; color: string; bg: string; textColor: string }

function getCategory(event: ScheduleEvent): Category {
  const t = event.title.toLowerCase();
  if (/trabalho|reunião|meeting|foco|bloco|office|job|project/.test(t))
    return { label: "Trabalho",    color: "#3B82F6", bg: "#DBEAFE", textColor: "#1D4ED8" };
  if (/academia|corrida|yoga|saúde|exercício|gym|treino|despertar|natação|musculação|caminhada/.test(t))
    return { label: "Saúde",       color: "#10B981", bg: "#D1FAE5", textColor: "#065F46" };
  if (/almoço|jantar|refeição|café|lanche|alimentação|lunch|dinner|breakfast/.test(t))
    return { label: "Refeição",    color: "#F59E0B", bg: "#FEF3C7", textColor: "#92400E" };
  if (/estudo|idioma|leitura|curso|aprender|habit|journal|anotação|meditação|mindful/.test(t))
    return { label: "Novo Hábito", color: "#06B6D4", bg: "#CFFAFE", textColor: "#0E7490" };
  if (/lazer|hobby|game|música|arte|cinema|lúdic|família|social|amigo/.test(t))
    return { label: "Lazer",       color: "#8B5CF6", bg: "#EDE9FE", textColor: "#5B21B6" };
  return { label: "Geral", color: event.color || "#6366F1", bg: "#E0E7FF", textColor: "#3730A3" };
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function eventDuration(ev: ScheduleEvent): number {
  const start = parseMinutes(ev.startTime);
  let end = parseMinutes(ev.endTime);
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}

type ProposalWithEvents = {
  uuid: string;
  status: string;
  title?: string;
  events: ScheduleEvent[];
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">Sem dados</div>;

  const r = 50, cx = 60, cy = 60, stroke = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circumference * pct;
        const gap = circumference - dash;
        const rotation = -90 + (offset / total) * 360;
        offset += seg.value;
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Timeline Event Card ──────────────────────────────────────────────────────
function TimelineEventCard({ event, side, onEdit, onMoveUp, onMoveDown, isDragging, isOver, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }: {
  event: ScheduleEvent;
  side: "left" | "right";
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
    <div className={cn(
      "flex items-start gap-0 w-full transition-all duration-200 flex-row",
      side === "left" ? "sm:flex-row" : "sm:flex-row-reverse",
      isDragging && "opacity-40 scale-95",
    )}>
      {/* Content */}
      <div
        draggable
        onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart?.(); }}
        onDragEnd={() => { onDragEnd?.(); }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onDragOver?.(e); }}
        onDragLeave={onDragLeave}
        onDrop={e => { e.preventDefault(); onDrop?.(); }}
        className={cn(
          "flex-1 min-w-0 bg-white rounded-2xl p-4 shadow-sm border-2 transition-all duration-150 group select-none",
          "ml-4 text-left",
          side === "left" ? "sm:mr-6 sm:ml-0 sm:text-right" : "sm:ml-6 sm:text-left",
          isOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.02]"
            : "border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-200",
        )}
      >
        <div className={cn(
          "flex items-center gap-2 mb-2 justify-start",
          side === "left" ? "sm:justify-end" : "sm:justify-start",
        )}>
          <span className="text-sm font-bold text-slate-800">{event.startTime.substring(0,5)} – {event.endTime.substring(0,5)}</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: cat.bg, color: cat.textColor }}>
            {cat.label}
          </span>
        </div>
        <p className="font-bold text-slate-900 text-base">{event.title}</p>
        {event.description && <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{event.description}</p>}

        {/* Actions row */}
        {onEdit && (
          <div className={cn(
            "flex items-center gap-1 mt-2.5 justify-start",
            side === "left" ? "sm:justify-end" : "sm:justify-start",
          )}>
            {/* Edit — always visible on mobile, hover-only on desktop */}
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              onMouseDown={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-primary hover:bg-primary/8 px-2 py-1 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Edit2 className="w-3 h-3" /> Editar
            </button>
            {/* Up/down — only on mobile */}
            {(onMoveUp || onMoveDown) && (
              <div className="flex sm:hidden items-center gap-0.5 ml-auto">
                <button
                  onClick={e => { e.stopPropagation(); onMoveUp?.(); }}
                  disabled={!onMoveUp}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-primary hover:bg-primary/8 disabled:opacity-20 transition-all"
                  title="Mover para cima"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onMoveDown?.(); }}
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

      {/* Dot on the center line */}
      <div className="relative flex flex-col items-center">
        <div className={cn("w-4 h-4 rounded-full border-2 border-white shadow-md z-10 transition-transform duration-150",
          isOver && "scale-125")}
          style={{ backgroundColor: isOver ? "var(--color-primary, #c904bc)" : cat.color }} />
      </div>

      {/* Spacer for the other side — hidden on mobile */}
      <div className="hidden sm:block sm:flex-1" />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}


// ─── Add-between button ───────────────────────────────────────────────────────
function AddBetweenButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="group w-full flex items-center gap-2 py-1.5 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-150"
    >
      <div className="flex-1 h-px bg-slate-200 group-hover:bg-primary/30 transition-colors" />
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-primary px-2 py-0.5 rounded-full group-hover:bg-primary/10 transition-all whitespace-nowrap">
        <Plus className="w-3 h-3" /> Adicionar
      </span>
      <div className="flex-1 h-px bg-slate-200 group-hover:bg-primary/30 transition-colors" />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProposalViewPage() {
  const [, params] = useRoute("/proposal/:uuid");
  const [location] = useLocation();
  const proposalUuid = params?.uuid ?? "";
  const { toast } = useToast();

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const creditSession = searchParams.get("credit_session");
  const creditCancelled = searchParams.get("credit_cancelled");

  const { data: proposal, isLoading, refetch } = useQuery<ProposalWithEvents>({
    queryKey: ["proposal-by-uuid", proposalUuid],
    queryFn: async () => {
      const res = await fetch(`/api/schedule/proposals/${proposalUuid}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load proposal");
      }
      return res.json() as Promise<ProposalWithEvents>;
    },
    enabled: Boolean(proposalUuid),
  });
  const { data: creditsData, refetch: refetchCredits } = useCredits();
  const verifyCredit = useVerifyCreditPayment();

  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([]);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState<number | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia");
  const [selectedDayId, setSelectedDayId] = useState("seg");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => {
    if (proposal?.events) {
      setLocalEvents(proposal.events);
      const firstDay = DAYS_OF_WEEK.find(d => proposal.events.some(e => e.dayOfWeek === d.id));
      if (firstDay) setSelectedDayId(firstDay.id);
    }
  }, [proposal?.events]);

  // Handle returning from Stripe credit purchase
  useEffect(() => {
    if (creditSession) {
      verifyCredit(creditSession).then(data => {
        if (data.paid) {
          toast({ title: "Créditos adicionados!", description: `+${data.added} crédito${(data.added ?? 0) > 1 ? "s" : ""} na sua conta.` });
          refetchCredits();
        }
      }).catch(() => {});
      window.history.replaceState({}, "", `/proposal/${proposalUuid}`);
    } else if (creditCancelled) {
      toast({ title: "Compra cancelada", description: "Nenhum crédito foi adicionado.", variant: "destructive" });
      window.history.replaceState({}, "", `/proposal/${proposalUuid}`);
    }
  }, [creditSession, creditCancelled]);

  const handleSaveEvents = () => {
    fetch(`/api/schedule/proposals/${proposalUuid}/events`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: localEvents }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("save-failed");
        toast({ title: "Salvo!" });
        await refetch();
      })
      .catch(() => {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      });
  };

  const handleApprove = () => {
    if (isSyncing) return;
    setShowSyncModal(true);
  };

  const handleSyncConfirm = async (clearBefore: boolean) => {
    setShowSyncModal(false);
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/schedule/proposals/${proposalUuid}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearBefore }),
      });
      const body = await res.json();
      if (res.status === 402) {
        setCreditsRequired(body.required);
        setShowCreditsModal(true);
        return;
      }
      if (!res.ok) {
        toast({ title: "Erro ao sincronizar", description: "Não foi possível sincronizar. Tente novamente.", variant: "destructive" });
        return;
      }
      toast({ title: "Sincronizado!", description: `${body.createdCount} eventos adicionados ao Google Agenda.` });
      refetch();
      refetchCredits();
    } catch {
      toast({ title: "Erro ao sincronizar", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSwapTimes = (idA: number, idB: number) => {
    setLocalEvents(prev => {
      const evA = prev.find(e => e.id === idA);
      const evB = prev.find(e => e.id === idB);
      if (!evA || !evB) return prev;
      return prev.map(ev => {
        if (ev.id === idA) return { ...ev, startTime: evB.startTime, endTime: evB.endTime };
        if (ev.id === idB) return { ...ev, startTime: evA.startTime, endTime: evA.endTime };
        return ev;
      });
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  const normalizeTime = (t: string) => t.length === 5 ? `${t}:00` : t;

  const saveEditedEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editingEvent) {
      const updated = {
        ...editingEvent,
        title: fd.get("title") as string,
        startTime: normalizeTime(fd.get("startTime") as string),
        endTime: normalizeTime(fd.get("endTime") as string),
        description: (fd.get("description") as string) || undefined,
      };
      if (isAddingNew) {
        setLocalEvents(prev => [...prev, updated]);
      } else {
        setLocalEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
      }
    }
    setEditingEvent(null);
    setIsAddingNew(false);
  };

  const deleteEvent = (id: number) => {
    setLocalEvents(prev => prev.filter(ev => ev.id !== id));
    setEditingEvent(null);
  };

  const handleAddEvent = (afterTime?: string) => {
    const tempId = -(Date.now());
    const startTime = afterTime || "09:00:00";
    const [h, m] = startTime.split(":").map(Number);
    const endH = Math.min(h + 1, 23);
    const endTime = `${String(endH).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`;
    const newEv: ScheduleEvent = {
      id: tempId,
      title: "",
      startTime,
      endTime,
      dayOfWeek: selectedDayId,
      recurrence: "weekly",
    };
    setEditingEvent(newEv);
    setIsAddingNew(true);
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const eventsByDay = useMemo(() => DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.id] = localEvents
      .filter(e => e.dayOfWeek === day.id)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, ScheduleEvent[]>), [localEvents]);

  const selectedDayEvents = eventsByDay[selectedDayId] ?? [];

  const equilibrio = useMemo(() => {
    const mins = { produtividade: 0, bemEstar: 0, lazer: 0 };
    selectedDayEvents.forEach(ev => {
      const cat = getCategory(ev).label;
      const dur = eventDuration(ev);
      if (cat === "Trabalho" || cat === "Novo Hábito") mins.produtividade += dur;
      else if (cat === "Saúde" || cat === "Refeição") mins.bemEstar += dur;
      else if (cat === "Lazer") mins.lazer += dur;
    });
    const total = mins.produtividade + mins.bemEstar + mins.lazer || 1;
    return {
      produtividade: Math.round(mins.produtividade / total * 100),
      bemEstar: Math.round(mins.bemEstar / total * 100),
      lazer: Math.round(mins.lazer / total * 100),
    };
  }, [selectedDayEvents]);

  const distribuicaoSegments = useMemo(() => {
    const totals: Record<string, { value: number; color: string }> = {};
    localEvents.forEach(ev => {
      const cat = getCategory(ev);
      const dur = eventDuration(ev);
      if (!totals[cat.label]) totals[cat.label] = { value: 0, color: cat.color };
      totals[cat.label].value += dur;
    });
    return Object.entries(totals).map(([label, info]) => ({ label, ...info }));
  }, [localEvents]);

  const isApproved = proposal?.status === "approved";
  const hasUnsavedChanges = JSON.stringify(localEvents) !== JSON.stringify(proposal?.events);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Skeleton className="w-full max-w-5xl h-[500px] rounded-3xl" />
      </div>
    );
  }

  if (!proposal) return <div className="p-8 text-center text-slate-500">Proposta não encontrada.</div>;

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-6 space-y-6 relative">
      {/* ── Full-screen sync overlay ──────────────────────────────────────────── */}
      {isSyncing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-pulse">
            <CalendarCheck2 className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-xl">Sincronizando com Google Agenda</p>
            <p className="text-slate-300 text-sm mt-1">Aguarde, isso pode levar alguns segundos...</p>
          </div>
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link href="/proposals">
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Minhas Rotinas
            </button>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900">Sua Rotina Sugerida</h1>
          <p className="text-slate-500 mt-1">Gerada com análise de IA com base nas suas preferências</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Button variant="outline" onClick={handleSaveEvents}
              className="gap-2 bg-white">
              <Save className="w-4 h-4" /> Salvar
            </Button>
          )}
          {!isApproved && (
            <Link href="/routine?step=2">
              <Button variant="outline" className="gap-2 bg-white">
                <RefreshCw className="w-4 h-4" /> Regerar
              </Button>
            </Link>
          )}
          {!isApproved && (
            <Button onClick={handleApprove} isLoading={isSyncing} disabled={isSyncing}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <CalendarCheck2 className="w-4 h-4" />
              {isSyncing ? "Sincronizando..." : "Sincronizar Agenda"}
            </Button>
          )}
          {isApproved && (
            <span className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <Check className="w-4 h-4" /> Sincronizada
            </span>
          )}
        </div>
      </div>


      {/* ── Main layout ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: Timeline ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Linha do Tempo Diária</h2>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 text-sm">
              <button onClick={() => setViewMode("dia")}
                className={cn("px-4 py-1.5 font-medium transition-all", viewMode === "dia" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50")}>
                Dia
              </button>
              <button onClick={() => setViewMode("semana")}
                className={cn("px-4 py-1.5 font-medium transition-all", viewMode === "semana" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50")}>
                Semana
              </button>
            </div>
          </div>

          {viewMode === "dia" ? (
            <>
              {/* Day tabs */}
              <div className="flex flex-wrap gap-1 px-3 py-3 border-b border-slate-100">
                {DAYS_OF_WEEK.filter(d => eventsByDay[d.id]?.length > 0).map(day => (
                  <button key={day.id} onClick={() => setSelectedDayId(day.id)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                      selectedDayId === day.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100")}>
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Timeline */}
              <div className="px-3 sm:px-6 py-6">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400 text-sm mb-4">Nenhuma atividade para este dia.</p>
                    {!isApproved && (
                      <button onClick={() => handleAddEvent()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold">
                        <Plus className="w-4 h-4" /> Adicionar atividade
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Center vertical line — hidden on mobile */}
                    <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2" />
                    <div className="space-y-2">
                      {!isApproved && (
                        <AddBetweenButton onClick={() => handleAddEvent()} label="Adicionar no início" />
                      )}
                      {selectedDayEvents.map((event, i) => (
                        <React.Fragment key={event.id}>
                          <TimelineEventCard
                            event={event}
                            side={i % 2 === 0 ? "right" : "left"}
                            onEdit={() => { setIsAddingNew(false); setEditingEvent(event); }}
                            onMoveUp={i > 0 ? () => handleSwapTimes(event.id, selectedDayEvents[i - 1].id) : undefined}
                            onMoveDown={i < selectedDayEvents.length - 1 ? () => handleSwapTimes(event.id, selectedDayEvents[i + 1].id) : undefined}
                            isDragging={draggedId === event.id}
                            isOver={dragOverId === event.id && draggedId !== event.id}
                            onDragStart={() => setDraggedId(event.id)}
                            onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                            onDragOver={() => draggedId !== event.id && setDragOverId(event.id)}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={() => draggedId !== null && draggedId !== event.id && handleSwapTimes(draggedId, event.id)}
                          />
                          {!isApproved && (
                            <AddBetweenButton
                              onClick={() => handleAddEvent(event.endTime)}
                              label={`Adicionar após ${event.startTime.substring(0,5)}`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Semana (week grid) */
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 min-w-[700px]">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day.id} className="border-r border-slate-100 last:border-r-0">
                    <div className="text-center py-3 text-sm font-semibold text-slate-600 border-b border-slate-100 bg-slate-50">
                      {day.label.substring(0, 3)}
                    </div>
                    <div className="p-2 space-y-2 min-h-[200px]">
                      {eventsByDay[day.id].map(event => {
                        const cat = getCategory(event);
                        return (
                          <div key={event.id} onClick={() => setEditingEvent(event)}
                            className={cn("p-2 rounded-xl text-xs cursor-pointer hover:opacity-80 transition-all")}
                            style={{ backgroundColor: cat.bg, color: cat.textColor }}>
                            <p className="font-bold truncate">{event.title}</p>
                            <p className="mt-0.5 opacity-80">{event.startTime.substring(0,5)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar cards ────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Equilíbrio do Dia */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}>
            <h3 className="font-bold text-white text-base">Equilíbrio do Dia</h3>
            <ProgressBar label="Produtividade" value={equilibrio.produtividade} color="#818CF8" />
            <ProgressBar label="Bem-estar"     value={equilibrio.bemEstar}     color="#34D399" />
            <ProgressBar label="Lazer"         value={equilibrio.lazer}        color="#FCD34D" />
          </div>

          {/* Próximos Passos */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Próximos Passos</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Rotina Gerada</p>
                  <p className="text-xs text-slate-400 mt-0.5">IA processou suas preferências.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Sincronizar</p>
                  <p className="text-xs text-slate-400 mt-0.5">Conecte-se com Google Agenda.</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              <span className="hidden sm:inline">Passe o mouse sobre um evento para editá-lo, ou arraste para trocar horários.</span>
              <span className="sm:hidden">Toque em "Editar" no card ou use as setas ↑↓ para reordenar.</span>
            </p>
          </div>

          {/* Distribuição Semanal */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Distribuição Semanal</h3>
            <div className="flex items-center justify-between gap-4">
              <DonutChart segments={distribuicaoSegments} />
              <div className="space-y-2 flex-1">
                {distribuicaoSegments.slice(0, 5).map(seg => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs text-slate-600 truncate">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Edit / Add Event Modal ───────────────────────────────────────────── */}
      <Modal isOpen={!!editingEvent} onClose={() => { setEditingEvent(null); setIsAddingNew(false); }} title={isAddingNew ? "Nova Atividade" : "Editar Atividade"}>
        {editingEvent && (
          <form onSubmit={saveEditedEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <Input name="title" defaultValue={editingEvent.title} required className="bg-slate-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                <Input type="time" name="startTime" defaultValue={editingEvent.startTime.substring(0, 5)} required className="bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                <Input type="time" name="endTime" defaultValue={editingEvent.endTime.substring(0, 5)} required className="bg-slate-50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea name="description" defaultValue={editingEvent.description || ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" />
            </div>
            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              {!isAddingNew && (
                <Button type="button" variant="destructive" size="sm" onClick={() => { deleteEvent(editingEvent.id); setIsAddingNew(false); }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-0">
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              )}
              {isAddingNew && <div />}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => { setEditingEvent(null); setIsAddingNew(false); }}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      <CreditsModal
        open={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        currentCredits={creditsData?.credits ?? 0}
        requiredCredits={creditsRequired}
        action="sincronizar com Google Agenda"
      />

      <SyncConfirmModal
        open={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSyncConfirm}
        loading={isSyncing}
      />
    </div>
  );
}
