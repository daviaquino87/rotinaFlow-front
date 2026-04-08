import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateOpenaiConversation,
  useCreateScheduleProposal,
  useListScheduleProposals,
} from "@/api-client";
import { useChatStream } from "../hooks/use-chat-stream";
import { Button } from "@/components/ui-elements";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { useToast } from "@hooks/use-toast";
import { StepIndicator } from "../components/StepIndicator";
import { ActivitySelector } from "../components/ActivitySelector";
import { loadDraft, saveDraft, clearDraft } from "../hooks/use-draft-storage";
import { CURRENT_PRESETS, NEW_PRESETS, GENERATION_COST } from "../constants";
import { buildSchedulePrompt } from "../utils/prompt-builder";
import { makeActivity, makeCustomActivity, makeId, guessEmoji } from "../utils/activity-factory";
import type { Activity, ActivityPreset, Day } from "../types";
import { Sparkles, Check, ArrowRight, ArrowLeft, Wand2, ListChecks, CalendarCheck2, CalendarDays, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@lib/utils";

// ─── List management hook ─────────────────────────────────────────────────────
function useActivityList(setList: React.Dispatch<React.SetStateAction<Activity[]>>) {
  return {
    addPreset: (p: ActivityPreset) => setList(prev =>
      prev.some(a => !a.custom && a.name === p.name) ? prev : [...prev, makeActivity(p)]),
    addCustom: () => setList(prev => [...prev, makeCustomActivity()]),
    toggle: (id: string) => setList(prev => prev.map(a => a.id === id ? { ...a, expanded: !a.expanded } : a)),
    update: (id: string, u: Partial<Activity>) => setList(prev => prev.map(a => a.id === id ? { ...a, ...u } : a)),
    remove: (id: string) => setList(prev => prev.filter(a => a.id !== id)),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoutineFormPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const { data: creditsData } = useCredits();
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const initialStep = new URLSearchParams(search).get("step") === "2" ? 2 : 1;
  const [step, setStep] = useState<1 | 2>(initialStep as 1 | 2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const draft = loadDraft();
  const [currentActs, setCurrentActs] = useState<Activity[]>(draft?.currentActs ?? []);
  const [newActs, setNewActs] = useState<Activity[]>(draft?.newActs ?? []);
  const [isDynamic, setIsDynamic] = useState(draft?.isDynamic ?? false);
  const [goals, setGoals] = useState(draft?.goals ?? "");

  useEffect(() => {
    saveDraft({ currentActs, newActs, isDynamic, goals });
  }, [currentActs, newActs, isDynamic, goals]);

  const queryClient = useQueryClient();
  const createConv = useCreateOpenaiConversation();
  const createProposal = useCreateScheduleProposal();
  const { data: existingProposals } = useListScheduleProposals();
  const { sendMessage } = useChatStream(undefined);
  const isFirstGeneration = (existingProposals?.length ?? 0) === 0;

  const current = useActivityList(setCurrentActs);
  const newList = useActivityList(setNewActs);

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/calendar/import", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        activities: { name: string; days: string[]; startTime: string; endTime: string }[];
      };
      if (data.activities.length === 0) {
        toast({ title: "Nenhum evento encontrado", description: "Não encontramos eventos agendados nos próximos 14 dias." });
        return;
      }
      const imported: Activity[] = data.activities.map(ev => ({
        id: makeId(), name: ev.name, emoji: guessEmoji(ev.name),
        days: ev.days as Day[], startTime: ev.startTime, endTime: ev.endTime,
        expanded: false, custom: true,
      }));
      setCurrentActs(prev => {
        const existing = new Set(prev.map(a => a.name.toLowerCase()));
        return [...prev, ...imported.filter(a => !existing.has(a.name.toLowerCase()))];
      });
      toast({ title: `${imported.length} evento(s) importado(s)`, description: "Revise os horários e dias abaixo antes de continuar." });
    } catch {
      toast({ title: "Erro ao sincronizar", description: "Não foi possível acessar o Google Agenda.", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerate = async () => {
    if (!isFirstGeneration && (creditsData?.credits ?? 0) < GENERATION_COST) {
      setShowCreditsModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const conv = await new Promise<{ id: number }>((resolve, reject) =>
        createConv.mutate({ data: { title: "Rotina — formulário" } }, { onSuccess: resolve, onError: reject }));
      const prompt = buildSchedulePrompt(currentActs, newActs, isDynamic, goals);
      await sendMessage(prompt, conv.id);
      await new Promise<void>((resolve, reject) =>
        createProposal.mutate(
          { data: { conversationId: conv.id, userId: "current", events: [] } },
          {
            onSuccess: (p) => {
              clearDraft();
              queryClient.invalidateQueries({ queryKey: ["/api/schedule/proposals"] });
              const path = (p as { uuid?: string; id: number }).uuid ?? String(p.id);
              setLocation(`/proposal/${path}`);
              resolve();
            },
            onError: reject,
          }
        )
      );
    } catch {
      toast({ title: "Erro ao gerar proposta", description: "Tente novamente.", variant: "destructive" });
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-2xl shadow-primary/30">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Criando sua proposta...</h2>
          <p className="text-slate-500">A IA está analisando sua rotina e montando uma agenda personalizada.</p>
        </div>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <StepIndicator current={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-3xl font-bold text-slate-900">Minha Rotina Atual</h1>
                <p className="text-slate-500 mt-2">Selecione as atividades que você <strong>já faz</strong> com regularidade e configure os dias e horários.</p>
              </div>
              <button type="button" onClick={handleGoogleSync} disabled={isSyncing}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed")}>
                {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CalendarDays className="w-3.5 h-3.5" />}
                {isSyncing ? "Sincronizando..." : "Sincronizar Google Agenda"}
              </button>
            </div>
            <ActivitySelector presets={CURRENT_PRESETS} activities={currentActs}
              onAddPreset={current.addPreset} onAddCustom={current.addCustom}
              onToggleExpand={current.toggle} onUpdate={current.update} onRemove={current.remove}
              label="Atividades comuns — clique para adicionar" />
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => {
                if (currentActs.length === 0) {
                  toast({ title: "Adicione pelo menos uma atividade", description: "Selecione o que você já faz no dia a dia.", variant: "destructive" });
                  return;
                }
                setStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} className="h-12 px-8 rounded-2xl text-base">
                Próximo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="space-y-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">O que você quer melhorar?</h1>
              <p className="text-slate-500 mt-2">Escolha as novas atividades ou deixe a IA decidir o que é melhor para você.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, Icon: ListChecks, title: "Escolho eu mesmo", desc: "Seleciono as atividades que quero adicionar" },
                { value: true,  Icon: Wand2,      title: "IA decide para mim", desc: "Sugestão inteligente baseada na minha rotina" },
              ].map(({ value, Icon, title, desc }) => (
                <button key={String(value)} type="button" onClick={() => setIsDynamic(value)}
                  className={cn("flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all",
                    isDynamic === value ? "border-primary bg-primary/5 shadow-md shadow-primary/10" : "border-slate-200 bg-white hover:border-slate-300")}>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                    isDynamic === value ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{title}</p>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </div>
                  {isDynamic === value && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
            {!isDynamic && (
              <ActivitySelector presets={NEW_PRESETS} activities={newActs}
                onAddPreset={newList.addPreset} onAddCustom={newList.addCustom}
                onToggleExpand={newList.toggle} onUpdate={newList.update} onRemove={newList.remove}
                label="Atividades que quero incluir" />
            )}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                {isDynamic ? "Quais são seus objetivos ou preferências? (opcional)" : "Observações adicionais (opcional)"}
              </label>
              <textarea value={goals} onChange={e => setGoals(e.target.value)}
                placeholder={isDynamic
                  ? "Ex: quero melhorar minha saúde, ter mais tempo para a família, aprender inglês..."
                  : "Ex: prefiro fazer exercícios de manhã, não tenho tempo às terças-feiras..."}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[90px] resize-none" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Button variant="ghost" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-slate-500">
                <ArrowLeft className="mr-2 w-4 h-4" /> Voltar
              </Button>
              <Button onClick={handleGenerate} isLoading={isGenerating}
                className="h-12 px-8 rounded-2xl text-base bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 shadow-xl shadow-primary/20">
                <CalendarCheck2 className="w-5 h-5 mr-2" /> Gerar minha agenda
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditsModal open={showCreditsModal} onClose={() => setShowCreditsModal(false)}
        currentCredits={creditsData?.credits ?? 0} requiredCredits={GENERATION_COST} action="gerar uma nova rotina" />
    </div>
  );
}
