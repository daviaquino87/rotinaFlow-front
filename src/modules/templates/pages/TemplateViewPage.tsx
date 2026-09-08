import React, { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, Coins, Check, Loader2 } from "lucide-react";
import { ApiError } from "@/api-client";
import { Button, Skeleton } from "@/components/ui-elements";
import { DAYS_OF_WEEK, cn } from "@lib/utils";
import { useToast } from "@hooks/use-toast";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { DonutChart } from "@modules/proposals/components/donut-chart";
import { ProgressBar } from "@modules/proposals/components/progress-bar";
import { TimelineEventCard } from "@modules/proposals/components/timeline-event-card";
import { useProposalStats } from "@modules/proposals/hooks/use-proposal-stats";
import { getCategory } from "@modules/proposals/utils/event-category";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { useTemplate, usePurchaseTemplate } from "../hooks/use-templates";

export default function TemplateViewPage() {
  const [, params] = useRoute("/templates/:uuid");
  const templateUuid = params?.uuid ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: template, isLoading } = useTemplate(templateUuid);
  const { data: creditsData } = useCredits();
  const purchaseTemplate = usePurchaseTemplate();

  const [selectedDayId, setSelectedDayId] = useState("monday");
  const [viewMode, setViewMode] = useState<"dia" | "semana">("dia");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState<number | undefined>(undefined);

  const events = template?.events ?? [];
  const { eventsByDay, selectedDayEvents, equilibrio, distribuicaoSegments } = useProposalStats(
    events,
    selectedDayId,
  );

  React.useEffect(() => {
    if (events.length === 0) return;
    const firstDay = DAYS_OF_WEEK.find((d) => events.some((e) => e.dayOfWeek === d.id));
    if (firstDay) setSelectedDayId(firstDay.id);
    // Runs once the template's events load — not on every selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.uuid]);

  const handlePurchase = async () => {
    if (!template) return;
    setIsPurchasing(true);
    try {
      const { proposalUuid } = await purchaseTemplate(template.uuid);
      toast({
        title: "Rotina criada!",
        description: `"${template.title}" agora é sua — edite como quiser.`,
      });
      setLocation(`/proposal/${proposalUuid}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setCreditsRequired((err.data as { required?: number } | null)?.required);
        setShowCreditsModal(true);
        return;
      }
      toast({
        title: "Erro ao comprar template",
        description: "Não foi possível criar sua rotina. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-6">
        <Skeleton className="w-full h-[500px] rounded-3xl" />
      </div>
    );
  }

  if (!template) {
    return <div className="p-8 text-center text-slate-500">Template não encontrado.</div>;
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link href="/templates">
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Templates
            </button>
          </Link>
          {/* flex-wrap + break-words: several real template titles ("Founder
              em Fase de Lançamento", "Universitário Multitarefa"...) are long
              enough to overflow a rigid single row at 320-375px, so the title
              wraps onto its own line instead, and the category badge moves
              below it rather than fighting it for space. */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-3xl shrink-0">{template.emoji}</span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 break-words">
              {template.title}
            </h1>
          </div>
          <span className="inline-block mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
            {template.category}
          </span>
          <p className="text-slate-500 mt-2 max-w-xl">{template.description}</p>
        </div>

        {template.alreadyPurchased && template.proposalUuid ? (
          <Link href={`/proposal/${template.proposalUuid}`}>
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-5 h-5" /> Ver minha rotina
            </Button>
          </Link>
        ) : template.alreadyPurchased ? (
          <Button
            onClick={handlePurchase}
            isLoading={isPurchasing}
            disabled={isPurchasing}
            size="lg"
            className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
          >
            <Check className="w-5 h-5" />
            {isPurchasing ? "Recriando..." : "Recriar minha rotina"}
          </Button>
        ) : (
          <Button
            onClick={handlePurchase}
            isLoading={isPurchasing}
            disabled={isPurchasing}
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
          >
            <Coins className="w-5 h-5" />
            {isPurchasing ? "Comprando..." : `Comprar por ${template.priceCredits} créditos`}
          </Button>
        )}
      </div>

      {/* ── Main layout — read-only preview ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">
              {viewMode === "dia" ? "Linha do Tempo Diária" : "Visão Semanal"}
            </h2>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                Somente visualização
              </span>
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
          </div>

          {viewMode === "dia" ? (
            <>
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

              <div className="px-3 sm:px-6 py-6">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400 text-sm">Nenhuma atividade para este dia.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-100 -translate-x-1/2" />
                    <div className="space-y-2">
                      {selectedDayEvents.map((event, i) => (
                        <TimelineEventCard
                          key={event.id}
                          event={event}
                          side={i % 2 === 0 ? "right" : "left"}
                        />
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
                      {(eventsByDay[day.id] ?? []).map((event) => {
                        const cat = getCategory(event);
                        return (
                          <div
                            key={event.id}
                            className="p-2 rounded-xl text-xs"
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

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)" }}
          >
            <h3 className="font-bold text-white text-base">Equilíbrio do Dia</h3>
            <ProgressBar label="Produtividade" value={equilibrio.produtividade} color="#818CF8" />
            <ProgressBar label="Bem-estar" value={equilibrio.bemEstar} color="#34D399" />
            <ProgressBar label="Lazer" value={equilibrio.lazer} color="#FCD34D" />
          </div>

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

          {!template.alreadyPurchased && (
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 space-y-3">
              <p className="text-sm text-slate-600">
                Ao comprar, esta rotina é copiada para a sua conta — você pode editar dias, horários
                e atividades livremente, sem afetar este template.
              </p>
              <Button
                onClick={handlePurchase}
                isLoading={isPurchasing}
                disabled={isPurchasing}
                className="w-full gap-2"
              >
                {isPurchasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Coins className="w-4 h-4" />
                )}
                Comprar por {template.priceCredits} créditos
              </Button>
            </div>
          )}

          {template.alreadyPurchased && !template.proposalUuid && (
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3">
              <p className="text-sm text-slate-600">
                Você já comprou este template — parece que apagou a rotina criada por ele. Sem
                problema: recriar é gratuito, você não paga de novo.
              </p>
              <Button
                onClick={handlePurchase}
                isLoading={isPurchasing}
                disabled={isPurchasing}
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {isPurchasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Recriar minha rotina
              </Button>
            </div>
          )}
        </div>
      </div>

      <CreditsModal
        open={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        currentCredits={creditsData?.credits ?? 0}
        requiredCredits={creditsRequired}
        action="comprar este template"
      />
    </div>
  );
}
