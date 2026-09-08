import React, { useState } from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import type { ScheduleEvent } from "@/api-client";
import { DAYS_OF_WEEK, cn } from "@lib/utils";
import { Button, Skeleton, Input } from "@/components/ui-elements";
import { Save, Trash2, CalendarCheck2, RefreshCw, Check, Plus, ArrowLeft } from "lucide-react";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { SyncConfirmModal } from "@modules/proposals/components/sync-confirm-modal";
import { DonutChart } from "@modules/proposals/components/donut-chart";
import { ProgressBar } from "@modules/proposals/components/progress-bar";
import { TimelineEventCard } from "@modules/proposals/components/timeline-event-card";
import { Modal } from "@modules/proposals/components/modal";
import { PromptHistoryModal } from "@modules/proposals/components/prompt-history-modal";
import { AddBetweenButton } from "@modules/proposals/components/add-between-button";
import { getCategory } from "@modules/proposals/utils/event-category";
import { useProposalEvents } from "@modules/proposals/hooks/use-proposal-events";
import { useProposalSync } from "@modules/proposals/hooks/use-proposal-sync";
import { useProposalStats } from "@modules/proposals/hooks/use-proposal-stats";

export default function ProposalViewPage() {
  const [, params] = useRoute("/proposal/:uuid");
  const proposalUuid = params?.uuid ?? "";

  const {
    proposal,
    isLoading,
    refetch,
    localEvents,
    selectedDayId,
    setSelectedDayId,
    hasUnsavedChanges,
    handleSaveEvents,
    handleSwapTimes,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent,
  } = useProposalEvents(proposalUuid);

  const {
    creditsData,
    isSyncing,
    showSyncModal,
    setShowSyncModal,
    showCreditsModal,
    setShowCreditsModal,
    creditsRequired,
    handleApprove,
    handleSyncConfirm,
  } = useProposalSync(proposalUuid, refetch);

  const { eventsByDay, selectedDayEvents, equilibrio, distribuicaoSegments } = useProposalStats(
    localEvents,
    selectedDayId,
  );

  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [showPromptHistory, setShowPromptHistory] = useState(false);

  const normalizeTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

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
        addLocalEvent(updated);
      } else {
        updateLocalEvent(updated);
      }
    }
    setEditingEvent(null);
    setIsAddingNew(false);
  };

  const deleteEvent = (id: number) => {
    deleteLocalEvent(id);
    setEditingEvent(null);
  };

  const handleAddEvent = (afterTime?: string) => {
    const tempId = -Date.now();
    const startTime = afterTime || "09:00:00";
    const [h, m] = startTime.split(":").map(Number);
    const endH = Math.min(h + 1, 23);
    const endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
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

  const isApproved = proposal?.status === "approved";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Skeleton className="w-full max-w-5xl h-[500px] rounded-3xl" />
      </div>
    );
  }

  if (!proposal)
    return <div className="p-8 text-center text-slate-500">Proposta não encontrada.</div>;

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
            <p className="text-slate-300 text-sm mt-1">
              Aguarde, isso pode levar alguns segundos...
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
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
          <p className="text-slate-500 mt-1">
            Gerada com análise de IA com base nas suas preferências
            {proposal.conversationId != null && (
              <>
                {" · "}
                <button
                  onClick={() => setShowPromptHistory(true)}
                  className="text-primary font-medium hover:underline"
                >
                  Ver o que eu pedi
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveEvents}
              className="gap-2 bg-white"
            >
              <Save className="w-4 h-4" /> Salvar
            </Button>
          )}
          {!isApproved && (
            <Link href="/routine?step=2">
              <Button variant="outline" size="sm" className="gap-2 bg-white">
                <RefreshCw className="w-4 h-4" /> Regerar
              </Button>
            </Link>
          )}
          {!isApproved && (
            <Button
              onClick={handleApprove}
              isLoading={isSyncing}
              disabled={isSyncing}
              size="lg"
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              <CalendarCheck2 className="w-5 h-5" />
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
              <button
                onClick={() => setViewMode("dia")}
                className={cn(
                  "px-4 py-1.5 font-medium transition-all",
                  viewMode === "dia"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode("semana")}
                className={cn(
                  "px-4 py-1.5 font-medium transition-all",
                  viewMode === "semana"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                Semana
              </button>
            </div>
          </div>

          {viewMode === "dia" ? (
            <>
              {/* Day tabs */}
              <div className="flex flex-wrap gap-1 px-3 py-3 border-b border-slate-100">
                {DAYS_OF_WEEK.filter((d) => eventsByDay[d.id]?.length > 0).map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                      selectedDayId === day.id
                        ? "bg-indigo-600 text-white"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Timeline */}
              <div className="px-3 sm:px-6 py-6">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 text-sm mb-4">Nenhuma atividade para este dia.</p>
                    {!isApproved && (
                      <button
                        onClick={() => handleAddEvent()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold"
                      >
                        <Plus className="w-4 h-4" /> Adicionar atividade
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2">
                      {!isApproved && (
                        <AddBetweenButton
                          onClick={() => handleAddEvent()}
                          label="Adicionar no início"
                        />
                      )}
                      {selectedDayEvents.map((event, i) => (
                        <React.Fragment key={event.id}>
                          <TimelineEventCard
                            event={event}
                            onEdit={() => {
                              setIsAddingNew(false);
                              setEditingEvent(event);
                            }}
                            onMoveUp={
                              i > 0
                                ? () => handleSwapTimes(event.id, selectedDayEvents[i - 1].id)
                                : undefined
                            }
                            onMoveDown={
                              i < selectedDayEvents.length - 1
                                ? () => handleSwapTimes(event.id, selectedDayEvents[i + 1].id)
                                : undefined
                            }
                            isDragging={draggedId === event.id}
                            isOver={dragOverId === event.id && draggedId !== event.id}
                            onDragStart={() => setDraggedId(event.id)}
                            onDragEnd={() => {
                              setDraggedId(null);
                              setDragOverId(null);
                            }}
                            onDragOver={() => draggedId !== event.id && setDragOverId(event.id)}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={() =>
                              draggedId !== null &&
                              draggedId !== event.id &&
                              handleSwapTimes(draggedId, event.id)
                            }
                          />
                          {!isApproved && (
                            <AddBetweenButton
                              onClick={() => handleAddEvent(event.endTime)}
                              label={`Adicionar após ${event.startTime.substring(0, 5)}`}
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
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.id} className="border-r border-slate-100 last:border-r-0">
                    <div className="text-center py-3 text-sm font-semibold text-slate-600 border-b border-slate-100 bg-slate-50">
                      {day.label.substring(0, 3)}
                    </div>
                    <div className="p-2 space-y-2 min-h-[200px]">
                      {eventsByDay[day.id].map((event) => {
                        const cat = getCategory(event);
                        return (
                          <div
                            key={event.id}
                            onClick={() => setEditingEvent(event)}
                            className={cn(
                              "p-2 rounded-xl text-xs cursor-pointer hover:opacity-80 transition-all",
                            )}
                            style={{ backgroundColor: cat.bg, color: cat.textColor }}
                          >
                            <p className="font-bold truncate">{event.title}</p>
                            <p className="mt-0.5 opacity-80">{event.startTime.substring(0, 5)}</p>
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
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
          >
            <h3 className="font-bold text-white text-base">Equilíbrio do Dia</h3>
            <ProgressBar label="Produtividade" value={equilibrio.produtividade} color="#818CF8" />
            <ProgressBar label="Bem-estar" value={equilibrio.bemEstar} color="#34D399" />
            <ProgressBar label="Lazer" value={equilibrio.lazer} color="#FCD34D" />
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
                  <p className="text-xs text-slate-500 mt-0.5">IA processou suas preferências.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Sincronizar</p>
                  <p className="text-xs text-slate-500 mt-0.5">Conecte-se com Google Agenda.</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              <span className="hidden sm:inline">
                Passe o mouse sobre um evento para editá-lo, ou arraste para trocar horários.
              </span>
              <span className="sm:hidden">
                Toque em "Editar" no card ou use as setas ↑↓ para reordenar.
              </span>
            </p>
          </div>

          {/* Distribuição Semanal */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Distribuição Semanal</h3>
            <div className="flex items-center justify-between gap-4">
              <DonutChart segments={distribuicaoSegments} />
              <div className="space-y-2 flex-1">
                {distribuicaoSegments.slice(0, 5).map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs text-slate-600 truncate">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit / Add Event Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => {
          setEditingEvent(null);
          setIsAddingNew(false);
        }}
        title={isAddingNew ? "Nova Atividade" : "Editar Atividade"}
      >
        {editingEvent && (
          <form onSubmit={saveEditedEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <Input
                name="title"
                defaultValue={editingEvent.title}
                required
                className="bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                <Input
                  type="time"
                  name="startTime"
                  defaultValue={editingEvent.startTime.substring(0, 5)}
                  required
                  className="bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                <Input
                  type="time"
                  name="endTime"
                  defaultValue={editingEvent.endTime.substring(0, 5)}
                  required
                  className="bg-slate-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                name="description"
                defaultValue={editingEvent.description || ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              />
            </div>
            {/* flex-col below sm: the 3 buttons (Excluir/Cancelar/Salvar)
                don't fit on one row under ~320-375px — stacking avoids
                cramped/overflowing buttons on small phones. */}
            <div className="pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-slate-100">
              {!isAddingNew && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteEvent(editingEvent.id);
                    setIsAddingNew(false);
                  }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-0 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              )}
              {/* sm:justify-between needs a second flex item to push the
                  Cancelar/Salvar group right when there's no Excluir button
                  (isAddingNew) — hidden (not just empty) so it doesn't add
                  stray vertical space in the stacked mobile layout. */}
              {isAddingNew && <div className="hidden sm:block" />}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setEditingEvent(null);
                    setIsAddingNew(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none">
                  Salvar
                </Button>
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

      <PromptHistoryModal
        open={showPromptHistory}
        onClose={() => setShowPromptHistory(false)}
        conversationId={proposal.conversationId}
      />
    </div>
  );
}
