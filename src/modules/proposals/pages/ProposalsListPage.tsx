import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarCheck2,
  CalendarDays,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui-elements";
import { useListScheduleProposals } from "@/api-client";
import { Link } from "wouter";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { SyncConfirmModal } from "@modules/proposals/components/sync-confirm-modal";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { apiUrl } from "@lib/api";
import { DayColumn } from "@modules/proposals/components/day-column";
import { AllDayBar } from "@modules/proposals/components/all-day-bar";
import { HistoryPanel } from "@modules/proposals/components/history-panel";
import {
  proposalUuid,
  toDateStr,
  HOUR_HEIGHT,
  START_HOUR,
  TOTAL_HOURS,
} from "@modules/proposals/utils/calendar";
import { useCalendarWeek } from "@modules/proposals/hooks/use-calendar-week";
import { useCalendarActions } from "@modules/proposals/hooks/use-calendar-actions";

export default function ProposalsListPage() {
  const {
    days,
    visibleDays,
    mobileDayIdx,
    setMobileDayIdx,
    eventsByDay,
    allDayByDay,
    weekLabel,
    isLoading,
    isFetching,
    isError,
    noToken,
    refetch,
    prevWeek,
    nextWeek,
    goToday,
  } = useCalendarWeek();

  const { data: creditsData, refetch: refetchCredits } = useCredits();
  const { data: proposals } = useListScheduleProposals();

  const {
    showCreditsModal,
    setShowCreditsModal,
    creditsRequired,
    showSyncModal,
    setShowSyncModal,
    setPendingSyncProposalId,
    showClearConfirm,
    setShowClearConfirm,
    syncMutation,
    clearCalendarMutation,
    deleteProposalMutation,
    handleOpenSyncModal,
    handleSyncConfirm,
    handleClearCalendar,
  } = useCalendarActions(refetch, refetchCredits);

  const colCount = visibleDays.length;
  const latestProposal = proposals?.[0] ?? null;
  const today = new Date();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-2 px-4 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-bold text-slate-900 flex-1 min-w-0 truncate">
            Minha Rotina
          </h1>
          <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden">
            <button onClick={prevWeek} className="p-2 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
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
            {clearCalendarMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {latestProposal && latestProposal.status !== "approved" && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 sm:px-4 shadow-md shadow-indigo-400/30">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarCheck2 className="w-4 h-4 text-white shrink-0" />
              <p className="text-xs sm:text-sm text-white font-semibold truncate">
                Sua rotina foi gerada e ainda não está no Google Agenda?
              </p>
            </div>
            <Button
              onClick={() => handleOpenSyncModal(proposalUuid(latestProposal))}
              isLoading={syncMutation.isPending}
              disabled={syncMutation.isPending}
              className="gap-1.5 bg-white text-indigo-700 hover:bg-white/90 hover:-translate-y-0 text-xs sm:text-sm h-9 px-4 shrink-0 font-bold shadow-none"
            >
              Sincronizar agora
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400 flex-1 min-w-0 truncate capitalize">{weekLabel}</p>
          {latestProposal?.status === "approved" ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-xl shrink-0">
              <CalendarCheck2 className="w-3 h-3" /> Sincronizada
            </span>
          ) : !latestProposal ? (
            <Link href="/routine">
              <Button variant="outline" className="gap-1.5 text-xs h-8 px-3 shrink-0">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Criar Rotina IA</span>
                <span className="sm:hidden">Nova Rotina</span>
              </Button>
            </Link>
          ) : null}
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
                isSelected
                  ? "bg-primary text-white"
                  : isToday
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase">
                {format(day, "EEE", { locale: ptBR })}
              </span>
              <span className="text-base font-bold leading-tight">{format(day, "d")}</span>
              {hasEvents && (
                <div
                  className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-primary"}`}
                />
              )}
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
            <p className="text-slate-500 max-w-sm text-sm">
              Para ver sua agenda, faça login novamente com sua conta Google para autorizar o acesso
              ao Google Calendar.
            </p>
            <a
              href={apiUrl("/api/auth/google")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Reconectar com Google
            </a>
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-slate-600 font-medium">Erro ao carregar calendário</p>
              <p className="text-slate-400 text-sm mt-1">
                Não foi possível carregar os eventos. Tente novamente.
              </p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4 gap-2">
                <RefreshCw className="w-4 h-4" /> Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div
              className="sticky top-0 bg-white z-10 border-b border-slate-100"
              style={{
                display: "grid",
                gridTemplateColumns: `52px repeat(${colCount}, 1fr)`,
              }}
            >
              <div />
              {visibleDays.map((day) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={day.toISOString()}
                    className="text-center py-2 border-l border-slate-100"
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? "text-primary" : "text-slate-400"}`}
                    >
                      {format(day, "EEE", { locale: ptBR })}
                    </p>
                    <div
                      className={`mx-auto mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isToday ? "bg-primary text-white" : "text-slate-800"}`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleDays.some((d) => allDayByDay[toDateStr(d)]?.length > 0) && (
              <div
                className="border-b border-slate-100 bg-slate-50"
                style={{
                  display: "grid",
                  gridTemplateColumns: `52px repeat(${colCount}, 1fr)`,
                }}
              >
                <div className="flex items-center justify-end pr-2 text-[10px] text-slate-400 font-medium">
                  tudo
                </div>
                {visibleDays.map((day) => (
                  <div key={day.toISOString()} className="border-l border-slate-100 min-h-[28px]">
                    <AllDayBar events={allDayByDay[toDateStr(day)] ?? []} />
                  </div>
                ))}
              </div>
            )}

            <div
              className="relative"
              style={{
                display: "grid",
                gridTemplateColumns: `52px repeat(${colCount}, 1fr)`,
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              <div className="flex flex-col" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
                {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-end pr-2 pt-0"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span
                      className={`text-[10px] text-slate-400 font-medium ${i === 0 ? "" : "-translate-y-2"}`}
                    >
                      {String(START_HOUR + i).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>
              {visibleDays.map((day) => (
                <DayColumn
                  key={toDateStr(day)}
                  events={eventsByDay[toDateStr(day)] ?? []}
                  isToday={isSameDay(day, today)}
                />
              ))}
            </div>

            <div className="lg:hidden border-t border-slate-100 bg-white">
              <HistoryPanel
                proposals={proposals ?? []}
                onSync={handleOpenSyncModal}
                syncingUuid={
                  syncMutation.isPending ? (syncMutation.variables?.proposalUuid ?? null) : null
                }
                onDelete={(uuid) => deleteProposalMutation.mutate(uuid)}
                deletingUuid={
                  deleteProposalMutation.isPending
                    ? (deleteProposalMutation.variables ?? null)
                    : null
                }
              />
            </div>
          </div>
        )}

        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-slate-100 overflow-y-auto bg-white">
          <HistoryPanel
            proposals={proposals ?? []}
            onSync={handleOpenSyncModal}
            syncingUuid={
              syncMutation.isPending ? (syncMutation.variables?.proposalUuid ?? null) : null
            }
            onDelete={(uuid) => deleteProposalMutation.mutate(uuid)}
            deletingUuid={
              deleteProposalMutation.isPending ? (deleteProposalMutation.variables ?? null) : null
            }
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
        onClose={() => {
          setShowSyncModal(false);
          setPendingSyncProposalId(null);
        }}
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
                Isso vai remover <strong>todos os eventos</strong> que o rotinaFlow sincronizou no
                seu Google Agenda. Os eventos que você criou manualmente não serão afetados.
              </p>
              <p className="text-slate-400 text-xs mt-2">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClearConfirm(false)}
              >
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
