import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  customFetch,
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
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Wand2,
  ListChecks,
  CalendarCheck2,
  CalendarDays,
  RefreshCw,
  Sunrise,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@lib/utils";

// ─── List management hook ─────────────────────────────────────────────────────
function useActivityList(
  setList: React.Dispatch<React.SetStateAction<Activity[]>>,
  withSchedule = true,
) {
  return {
    addPreset: (p: ActivityPreset) =>
      setList((prev) =>
        prev.some((a) => !a.custom && a.name === p.name)
          ? prev
          : [...prev, makeActivity(p, withSchedule)],
      ),
    addCustom: () => setList((prev) => [...prev, makeCustomActivity(withSchedule)]),
    toggle: (id: string) =>
      setList((prev) => prev.map((a) => (a.id === id ? { ...a, expanded: !a.expanded } : a))),
    update: (id: string, u: Partial<Activity>) =>
      setList((prev) => prev.map((a) => (a.id === id ? { ...a, ...u } : a))),
    remove: (id: string) => setList((prev) => prev.filter((a) => a.id !== id)),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoutineFormPage() {
  const { t } = useTranslation("schedule");
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
  const [wakeTime, setWakeTime] = useState(draft?.wakeTime ?? "");
  const [sleepTime, setSleepTime] = useState(draft?.sleepTime ?? "");

  useEffect(() => {
    saveDraft({ currentActs, newActs, isDynamic, goals, wakeTime, sleepTime });
  }, [currentActs, newActs, isDynamic, goals, wakeTime, sleepTime]);

  const queryClient = useQueryClient();
  const createConv = useCreateOpenaiConversation();
  const createProposal = useCreateScheduleProposal();
  const { data: existingProposals } = useListScheduleProposals();
  const { sendMessage } = useChatStream(undefined);
  const isFirstGeneration = (existingProposals?.length ?? 0) === 0;

  const current = useActivityList(setCurrentActs);
  const newList = useActivityList(setNewActs, false);

  const handleGoogleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await customFetch<{
        activities: { name: string; days: string[]; startTime: string; endTime: string }[];
      }>("/api/calendar/import");
      if (data.activities.length === 0) {
        toast({
          title: t("routineForm.googleSync.noEventsTitle"),
          description: t("routineForm.googleSync.noEventsDescription"),
        });
        return;
      }
      const imported: Activity[] = data.activities.map((ev) => ({
        id: makeId(),
        name: ev.name,
        emoji: guessEmoji(ev.name),
        days: ev.days as Day[],
        startTime: ev.startTime,
        endTime: ev.endTime,
        expanded: false,
        custom: true,
        note: "",
      }));
      setCurrentActs((prev) => {
        const existing = new Set(prev.map((a) => a.name.toLowerCase()));
        return [...prev, ...imported.filter((a) => !existing.has(a.name.toLowerCase()))];
      });
      toast({
        title: t("routineForm.googleSync.importedTitle", { count: imported.length }),
        description: t("routineForm.googleSync.importedDescription"),
      });
    } catch {
      toast({
        title: t("routineForm.googleSync.errorTitle"),
        description: t("routineForm.googleSync.errorDescription"),
        variant: "destructive",
      });
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
        createConv.mutate(
          { data: { title: t("routineForm.conversationTitle") } },
          { onSuccess: resolve, onError: reject },
        ),
      );
      const prompt = buildSchedulePrompt(
        currentActs,
        newActs,
        isDynamic,
        goals,
        wakeTime,
        sleepTime,
      );
      await sendMessage(prompt, conv.id);
      await new Promise<void>((resolve, reject) =>
        createProposal.mutate(
          { data: { conversationId: conv.id, userId: "current", events: [] } },
          {
            onSuccess: (p) => {
              clearDraft();
              queryClient.invalidateQueries({ queryKey: ["/api/schedule/proposals"] });
              // A successful generation may have spent credits (see
              // GENERATION_COST in schedule.service.ts) — the header badge
              // reads from this same cache key, so without invalidating it
              // here it keeps showing the pre-generation balance until its
              // 30s staleTime lapses, making it look like nothing was charged.
              queryClient.invalidateQueries({ queryKey: ["credits-balance"] });
              setLocation(`/proposal/${p.uuid}`);
              resolve();
            },
            onError: reject,
          },
        ),
      );
    } catch (err) {
      const isNoEvents = err instanceof ApiError && err.status === 422;
      toast({
        title: isNoEvents
          ? t("routineForm.generateError.noEventsTitle")
          : t("routineForm.generateError.genericTitle"),
        description:
          (err instanceof ApiError && typeof err.data === "object" && err.data
            ? (err.data as { error?: string }).error
            : undefined) ??
          (isNoEvents
            ? t("routineForm.generateError.noEventsDescription")
            : t("routineForm.generateError.genericDescription")),
        variant: "destructive",
      });
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
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            {t("routineForm.generating.title")}
          </h2>
          <p className="text-slate-500">{t("routineForm.generating.description")}</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const approvedCount = existingProposals?.filter((p) => p.status === "approved").length ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* A real, personal stat instead of a marketing-style vanity metric —
          computed straight from this user's own proposals, shown only once
          they actually have some. Nothing to fabricate on a first visit. */}
      {!isFirstGeneration && (
        <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>
            {t("routineForm.stats.createdCount", { count: existingProposals!.length })}
            {approvedCount > 0 && (
              <> {t("routineForm.stats.syncedSuffix", { count: approvedCount })}</>
            )}
          </span>
        </div>
      )}
      <StepIndicator current={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-3xl font-bold text-slate-900">
                  {t("routineForm.step1.title")}
                </h1>
                <p className="text-slate-500 mt-2">
                  {t("routineForm.step1.descriptionPrefix")}{" "}
                  <strong>{t("routineForm.step1.descriptionEmphasis")}</strong>{" "}
                  {t("routineForm.step1.descriptionSuffix")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoogleSync}
                disabled={isSyncing}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap text-slate-500 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CalendarDays className="w-3.5 h-3.5" />
                )}
                {isSyncing ? t("routineForm.googleSync.syncing") : t("routineForm.googleSync.label")}
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                {t("routineForm.step1.essentialInfo")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5" /> {t("routineForm.step1.wakeTimeLabel")}
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" /> {t("routineForm.step1.sleepTimeLabel")}
                  </label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
            <ActivitySelector
              presets={CURRENT_PRESETS}
              activities={currentActs}
              onAddPreset={current.addPreset}
              onAddCustom={current.addCustom}
              onToggleExpand={current.toggle}
              onUpdate={current.update}
              onRemove={current.remove}
              label={t("routineForm.step1.activitiesLabel")}
            />
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                onClick={() => {
                  if (!wakeTime || !sleepTime) {
                    toast({
                      title: t("routineForm.step1.validation.missingTimesTitle"),
                      description: t("routineForm.step1.validation.missingTimesDescription"),
                      variant: "destructive",
                    });
                    return;
                  }
                  if (currentActs.length === 0) {
                    toast({
                      title: t("routineForm.step1.validation.noActivitiesTitle"),
                      description: t("routineForm.step1.validation.noActivitiesDescription"),
                      variant: "destructive",
                    });
                    return;
                  }
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="h-12 px-8 rounded-2xl text-base"
              >
                {t("routineForm.step1.next")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">
                {t("routineForm.step2.title")}
              </h1>
              <p className="text-slate-500 mt-2">{t("routineForm.step2.description")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: false,
                  Icon: ListChecks,
                  title: t("routineForm.step2.options.manual.title"),
                  desc: t("routineForm.step2.options.manual.description"),
                },
                {
                  value: true,
                  Icon: Wand2,
                  title: t("routineForm.step2.options.ai.title"),
                  desc: t("routineForm.step2.options.ai.description"),
                },
              ].map(({ value, Icon, title, desc }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setIsDynamic(value)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all",
                    isDynamic === value
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isDynamic === value ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
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
              <div className="space-y-3">
                <ActivitySelector
                  presets={NEW_PRESETS}
                  activities={newActs}
                  onAddPreset={newList.addPreset}
                  onAddCustom={newList.addCustom}
                  onToggleExpand={newList.toggle}
                  onUpdate={newList.update}
                  onRemove={newList.remove}
                  label={t("routineForm.step2.activitiesLabel")}
                  showSchedule={false}
                  allowNotes
                />
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 shrink-0" />
                  {t("routineForm.step2.aiHelperText")}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                {isDynamic
                  ? t("routineForm.step2.goalsLabelDynamic")
                  : t("routineForm.step2.goalsLabelManual")}
              </label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder={
                  isDynamic
                    ? t("routineForm.step2.goalsPlaceholderDynamic")
                    : t("routineForm.step2.goalsPlaceholderManual")
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[90px] resize-none"
              />
            </div>
            {/* flex-col below sm: "Voltar" + o texto de créditos + o CTA não
                cabem numa linha só em telas de iPhone (~375px) — empilhar
                evita que o botão "Gerar minha agenda" espreme/quebre. */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-slate-500 w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> {t("routineForm.step2.back")}
              </Button>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                {!isFirstGeneration && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      (creditsData?.credits ?? 0) < GENERATION_COST
                        ? "text-red-500"
                        : "text-slate-500",
                    )}
                  >
                    {t("routineForm.step2.creditsCost", { count: GENERATION_COST })}
                  </span>
                )}
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="h-12 px-8 rounded-2xl text-base bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 shadow-xl shadow-primary/20"
                >
                  <CalendarCheck2 className="w-5 h-5 mr-2" /> {t("routineForm.step2.generate")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditsModal
        open={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        currentCredits={creditsData?.credits ?? 0}
        requiredCredits={GENERATION_COST}
        action={t("routineForm.creditsModalAction")}
      />
    </div>
  );
}
