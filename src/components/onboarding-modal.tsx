import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Sparkles, CalendarCheck2, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";

const STORAGE_KEY = "rotinaflow_onboarding_seen";

const STEPS = [
  {
    icon: ClipboardList,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    textColor: "text-violet-700",
    num: "1",
    title: "Descreva sua rotina",
    description: "Informe as atividades que você já faz e o que quer incluir no seu dia a dia.",
  },
  {
    icon: Sparkles,
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    textColor: "text-blue-700",
    num: "2",
    title: "A IA gera sua agenda",
    description: "Nossa IA analisa suas informações e monta uma rotina semanal personalizada para você.",
  },
  {
    icon: CalendarCheck2,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    textColor: "text-emerald-700",
    num: "3",
    title: "Sincronize com o Google",
    description: "Exporte sua rotina direto para o Google Agenda com um clique.",
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setVisible(false);
  };

  const start = () => {
    dismiss();
    setLocation("/routine");
  };

  return (
    <AnimatePresence>
      {visible && (
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
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-8 pb-2 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/30 mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                Bem-vindo ao rotinaFlow!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                Organize sua semana com inteligência artificial em <strong className="text-slate-700">3 passos simples</strong>.
              </p>
            </div>

            <div className="px-6 py-6 space-y-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.1, duration: 0.3 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${step.bg} ${step.border}`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step.textColor}`}>
                          Passo {step.num}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.description}</p>
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
                Começar agora
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Sua primeira rotina é <span className="font-semibold text-emerald-600">gratuita</span> 🎉
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
