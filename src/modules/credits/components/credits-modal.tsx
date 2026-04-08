import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Zap, Star, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui-elements";
import { useToast } from "@hooks/use-toast";

interface Package {
  credits: number;
  priceLabel: string;
  amountCents: number;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
}

const PACKAGES: Package[] = [
  {
    credits: 3,
    priceLabel: "R$ 3,00",
    amountCents: 300,
    icon: <Zap className="w-5 h-5" />,
    description: "1 geração + 1 sincronização",
  },
  {
    credits: 5,
    priceLabel: "R$ 5,00",
    amountCents: 500,
    popular: true,
    icon: <Star className="w-5 h-5" />,
    description: "2 gerações + 1 sync, sobra 0",
  },
  {
    credits: 10,
    priceLabel: "R$ 10,00",
    amountCents: 1000,
    icon: <Rocket className="w-5 h-5" />,
    description: "4 gerações + 1 sync com troco",
  },
];

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredCredits?: number;
  action?: string;
}

export function CreditsModal({ open, onClose, currentCredits, requiredCredits, action }: CreditsModalProps) {
  const [loading, setLoading] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) setLoading(null);
  }, [open]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(null);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleBuy = async (credits: number) => {
    setLoading(credits);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credits, returnPath: window.location.pathname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar checkout");
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar checkout";
      toast({ title: "Erro", description: message, variant: "destructive" });
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="bg-gradient-to-br from-primary to-purple-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Adicionar Créditos</h2>
                  <p className="text-white/80 text-sm">1 crédito = R$ 1,00</p>
                </div>
              </div>

              <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-white/80">Seu saldo atual</span>
                <span className="font-bold text-xl">{currentCredits} crédito{currentCredits !== 1 ? "s" : ""}</span>
              </div>

              {requiredCredits !== undefined && requiredCredits > currentCredits && (
                <div className="mt-3 bg-white/10 rounded-xl p-3 text-sm text-white/90">
                  Você precisa de <strong>{requiredCredits} créditos</strong> para {action ?? "esta ação"}.
                  Você tem <strong>{currentCredits}</strong>.
                </div>
              )}
            </div>

            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Custo por ação</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-blue-50 rounded-lg p-2.5 text-center">
                  <div className="text-blue-600 font-bold text-lg">2</div>
                  <div className="text-blue-700 text-xs">créditos</div>
                  <div className="text-slate-500 text-xs mt-0.5">Gerar rotina</div>
                </div>
                <div className="flex-1 bg-purple-50 rounded-lg p-2.5 text-center">
                  <div className="text-purple-600 font-bold text-lg">3</div>
                  <div className="text-purple-700 text-xs">créditos</div>
                  <div className="text-slate-500 text-xs mt-0.5">Sincronizar</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escolha um pacote</p>
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    pkg.popular
                      ? "border-primary bg-primary/5"
                      : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Mais popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pkg.popular ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>
                        {pkg.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {pkg.credits} crédito{pkg.credits > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-slate-500">{pkg.description}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy(pkg.credits)}
                      disabled={loading !== null}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        pkg.popular
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                      } disabled:opacity-60`}
                    >
                      {loading === pkg.credits ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        pkg.priceLabel
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 pb-5">
              <p className="text-center text-xs text-slate-400">
                Pagamento seguro via Stripe • Créditos não expiram
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { CreditsModalProps };
