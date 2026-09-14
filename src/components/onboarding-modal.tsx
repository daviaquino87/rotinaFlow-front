import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Sparkles, CalendarCheck2, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

// Exported so AppLayout can decide whether to show this on first login and
// reset it when the user reopens onboarding from the "How it works" menu.
export const ONBOARDING_SEEN_KEY = "rotinaflow_onboarding_seen";

const STEP_STYLES = [
  {
    icon: ClipboardList,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    textColor: "text-violet-700",
    num: "1",
    key: "describe",
  },
  {
    icon: Sparkles,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    textColor: "text-blue-700",
    num: "2",
    key: "generate",
  },
  {
    icon: CalendarCheck2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    textColor: "text-emerald-700",
    num: "3",
    key: "sync",
  },
] as const;

export function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const dismiss = () => {
    try {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    } catch {}
    onClose();
  };

  const start = () => {
    dismiss();
    setLocation("/routine");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Sibling of (not inside) the scrollable div below, so it stays
                reachable even when the content scrolls on short viewports. */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-2.5 -m-1 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
              aria-label={t("onboarding.close")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="px-8 pt-8 pb-2 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/30 mb-5">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                  {t("onboarding.welcomeTitle")}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                  {t("onboarding.welcomeSubtitlePrefix")}{" "}
                  <strong className="text-slate-700">{t("onboarding.welcomeSubtitleStrong")}</strong>.
                </p>
              </div>

              <div className="px-6 py-6 space-y-3">
                {STEP_STYLES.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + idx * 0.1, duration: 0.3 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${step.bg} ${step.border}`}
                    >
                      <div
                        className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${step.textColor}`}
                          >
                            {t("onboarding.step", { num: step.num })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {t(`onboarding.steps.${step.key}.title`)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {t(`onboarding.steps.${step.key}.description`)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-6 pb-6">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.25 }}
                  onClick={start}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
                >
                  {t("onboarding.startNow")}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  {t("onboarding.firstRoutineFreePrefix")}{" "}
                  <span className="font-semibold text-emerald-600">
                    {t("onboarding.firstRoutineFreeStrong")}
                  </span>{" "}
                  🎉
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
