import React, { useState, useEffect, useRef } from "react";
import { useGetSession } from "@/api-client";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Calendar, Brain, Zap, Clock, Target,
  CheckCircle2, Loader2, Star, TrendingUp, Shield, RefreshCw,
  CalendarCheck2, LayoutGrid, ChevronRight, User
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiUrl } from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// ─── Animated Section Wrapper ─────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Fake Schedule Preview ─────────────────────────────────────────────────────
const SCHEDULE_BLOCKS = [
  { time: "06:30", label: "Academia", color: "#10B981", cat: "Saúde", width: "75%" },
  { time: "08:00", label: "Foco Profundo", color: "#3B82F6", cat: "Trabalho", width: "90%" },
  { time: "10:30", label: "Reunião de equipe", color: "#3B82F6", cat: "Trabalho", width: "55%" },
  { time: "12:00", label: "Almoço", color: "#F59E0B", cat: "Refeição", width: "40%" },
  { time: "14:00", label: "Leitura & Estudo", color: "#06B6D4", cat: "Novo Hábito", width: "70%" },
  { time: "16:00", label: "Bloco de Tarefas", color: "#3B82F6", cat: "Trabalho", width: "80%" },
  { time: "19:00", label: "Caminhada", color: "#10B981", cat: "Saúde", width: "45%" },
  { time: "21:00", label: "Leitura noturna", color: "#8B5CF6", cat: "Lazer", width: "60%" },
];

function SchedulePreview() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-sm">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />)}
        </div>
        <span className="text-slate-300 text-xs font-mono ml-2">Segunda-feira • rotinaFlow</span>
      </div>
      <div className="p-4 space-y-2.5">
        {SCHEDULE_BLOCKS.map((block, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{block.time}</span>
            <div className="flex-1 relative h-7 rounded-lg overflow-hidden bg-slate-50">
              <motion.div
                initial={{ width: 0 }} animate={{ width: block.width }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-lg flex items-center px-2.5"
                style={{ backgroundColor: block.color + "22" }}>
                <span className="text-xs font-semibold truncate" style={{ color: block.color }}>{block.label}</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">Sincronizado com Google Agenda</span>
        </div>
        <CalendarCheck2 className="w-4 h-4 text-green-500" />
      </div>
    </div>
  );
}

// ─── Benefit Card ─────────────────────────────────────────────────────────────
function BenefitCard({ icon: Icon, title, desc, color, delay }: {
  icon: LucideIcon; title: string; desc: string; color: string; delay: number;
}) {
  return (
    <FadeIn delay={delay} className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-default">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: color + "18" }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </FadeIn>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, icon: Icon, color, delay }: {
  num: string; title: string; desc: string; icon: LucideIcon; color: string; delay: number;
}) {
  return (
    <FadeIn delay={delay} className="relative flex flex-col items-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-extrabold text-slate-500">
        {num}
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </FadeIn>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { data: session, isLoading } = useGetSession();
  const [waitingForLogin, setWaitingForLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) return <div className="min-h-screen bg-white" />;

  if (session?.authenticated) {
    window.location.replace("/routine");
    return <div className="min-h-screen bg-white" />;
  }

  const handleLogin = () => {
    setWaitingForLogin(true);
    window.location.href = apiUrl("/api/auth/google");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow shadow-primary/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">rotinaFlow</span>
          </div>
          <button onClick={handleLogin} disabled={waitingForLogin}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-60">
            {waitingForLogin
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Aguardando...</>
              : <><User className="w-3.5 h-3.5" /> Entrar com Google</>}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary/8 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-violet-300/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-6 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> Inteligência Artificial aplicada à sua rotina
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
              Pare de improvisar.{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-blue-500">
                  Viva com intenção.
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 via-violet-400/20 to-blue-400/20 blur-sm rounded-full" />
              </span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
              Descreva seus objetivos e deixe a IA montar uma rotina semanal personalizada, sincronizada com seu Google Agenda em segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleLogin} disabled={waitingForLogin}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60">
                {waitingForLogin
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Conclua o login na aba aberta...</>
                  : <><span>Começar grátis com Google</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-all">
                Como funciona <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {["#c904bc","#3B82F6","#10B981","#F59E0B"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-500">Primeira rotina <strong className="text-slate-700">100% gratuita</strong></p>
              </div>
            </div>
          </motion.div>

          {/* Right — Schedule Preview */}
          <motion.div initial={{ opacity: 0, x: 30, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end">
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">IA analisando...</p>
                <p className="text-[11px] text-slate-400">Otimizando sua semana</p>
              </div>
            </motion.div>

            <SchedulePreview />

            {/* Floating stats */}
            <motion.div
              animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -right-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">+34% produtividade</p>
                <p className="text-[11px] text-slate-400">Média dos usuários</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── Benefits ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 font-semibold text-xs mb-4 border border-violet-200">
              <Zap className="w-3.5 h-3.5" /> Por que o rotinaFlow funciona
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Sua semana, otimizada pela IA
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Mais do que um calendário — um sistema inteligente que aprende com você e monta a semana ideal para atingir seus objetivos.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard delay={0} icon={Brain} color="#c904bc" title="IA que entende seu estilo"
              desc="Analisa sua rotina atual, seus objetivos e preferências para criar uma agenda que realmente se encaixa na sua vida — não um template genérico." />
            <BenefitCard delay={0.05} icon={CalendarCheck2} color="#3B82F6" title="Sincronização em 1 clique"
              desc="Aprovou a rotina? Em segundos ela aparece no seu Google Agenda com todos os eventos, horários e recorrências configurados automaticamente." />
            <BenefitCard delay={0.1} icon={Target} color="#10B981" title="Foco nos seus objetivos"
              desc="Quer aprender um idioma, malhar 4x por semana, ler mais livros? A IA aloca blocos estratégicos para cada meta — sem esquecer o descanso." />
            <BenefitCard delay={0.15} icon={Clock} color="#F59E0B" title="Elimine decisões diárias"
              desc="Chega de perguntar 'o que devo fazer agora?'. Com a rotina pronta, você acorda sabendo exatamente como aproveitar cada hora do dia." />
            <BenefitCard delay={0.2} icon={LayoutGrid} title="Equilíbrio real entre áreas" color="#8B5CF6"
              desc="Trabalho, saúde, lazer e desenvolvimento pessoal distribuídos de forma inteligente — garantindo produtividade sem burnout." />
            <BenefitCard delay={0.25} icon={RefreshCw} color="#06B6D4" title="Ajuste a qualquer momento"
              desc="A vida muda. Edite eventos, troque horários com drag & drop e re-sincronize quando quiser. Sua agenda, no seu ritmo." />
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── How it works ── */}
      <section id="como-funciona" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs mb-4 border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Simples assim
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              De zero a rotina em 3 passos
            </h2>
            <p className="text-slate-500 text-lg">Leva menos de 5 minutos do início ao Google Agenda.</p>
          </FadeIn>

          {/* Steps */}
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* connector lines */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-slate-200 via-primary/30 to-slate-200" />

            <StepCard num="1" delay={0} icon={User} color="#c904bc" title="Conte sua rotina"
              desc="Informe o que você já faz hoje — atividades, horários e hábitos. O formulário inteligente extrai tudo em minutos." />
            <StepCard num="2" delay={0.1} icon={Brain} color="#3B82F6" title="IA cria sua agenda"
              desc="Nossa IA analisa seus dados e monta uma proposta semanal completa, com equilíbrio entre trabalho, saúde e lazer." />
            <StepCard num="3" delay={0.2} icon={CalendarCheck2} color="#10B981" title="Aprove e sincronize"
              desc="Revise, ajuste se quiser, e sincronize direto com o Google Agenda — com recorrência e tudo configurado automaticamente." />
          </div>
        </div>
      </section>

      {/* ── Feature highlight ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 font-semibold text-xs mb-6 border border-white/20">
                <Shield className="w-3.5 h-3.5" /> Dados seguros e privados
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Conectado ao Google,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">100% sob seu controle</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Login e sincronização via OAuth oficial do Google. Seus eventos vão para o Google Agenda com recorrência configurada — você pode editar ou cancelar quando quiser, sem dependências.
              </p>
              <div className="space-y-3">
                {[
                  "Login seguro via Google OAuth",
                  "Sincronização bidirecional com Google Agenda",
                  "Sem acesso a dados sensacionais além do necessário",
                  "Cancele e remova quando quiser",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15} className="relative">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <CalendarCheck2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Rotina da Semana</p>
                    <p className="text-xs text-slate-400">Segunda a Domingo • Sincronizada</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Trabalho & Foco", pct: 38, color: "#3B82F6" },
                    { label: "Saúde & Exercício", pct: 22, color: "#10B981" },
                    { label: "Aprendizado", pct: 20, color: "#06B6D4" },
                    { label: "Lazer & Família", pct: 12, color: "#8B5CF6" },
                    { label: "Refeições", pct: 8, color: "#F59E0B" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-bold text-white">{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div className="h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-xs mb-4 border border-green-200">
              <Sparkles className="w-3.5 h-3.5" /> Preço justo e transparente
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Comece de graça</h2>
            <p className="text-slate-500 text-lg mb-12">Sem assinatura, sem pegadinhas. Pague só quando precisar de mais.</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              {/* Free */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Começar</p>
                <p className="text-4xl font-extrabold text-slate-900 mb-1">Grátis</p>
                <p className="text-slate-500 text-sm mb-6">Para sua primeira rotina</p>
                <div className="space-y-3 mb-8">
                  {["1 rotina gerada pela IA", "Sincronização com Google Agenda", "Edição manual dos eventos", "Drag & drop para ajustar horários"].map(item => (
                    <div key={item} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogin}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors">
                  Criar minha rotina grátis
                </button>
              </div>

              {/* Credits */}
              <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">MAIS POPULAR</div>
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-2">Créditos</p>
                <p className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">R$1</span>
                  <span className="text-white/70 text-sm">/ crédito</span>
                </p>
                <p className="text-white/70 text-sm mb-6">Gerar custa 2 créditos · Sync custa 3 créditos</p>
                <div className="space-y-3 mb-4">
                  {["Tudo do plano gratuito", "Créditos nunca expiram", "Pacotes de 3, 5 ou 10 créditos", "Múltiplas rotinas ilimitadas"].map(item => (
                    <div key={item} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-white/80 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-6">
                  {[{c:3,p:"R$3"},{c:5,p:"R$5"},{c:10,p:"R$10"}].map(pkg => (
                    <div key={pkg.c} className="flex-1 bg-white/10 rounded-xl p-2 text-center border border-white/20">
                      <div className="font-bold text-sm">{pkg.c} créd.</div>
                      <div className="text-white/70 text-xs">{pkg.p}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-colors">
                  Começar agora
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-white">
        <FadeIn className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary/30" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Sua melhor semana começa hoje
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">
            Junte-se a quem já parou de improvisar e passou a viver com intenção. Primeira rotina totalmente grátis.
          </p>
          <button onClick={handleLogin} disabled={waitingForLogin}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60">
            {waitingForLogin
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Conclua o login na aba aberta...</>
              : <><Sparkles className="w-5 h-5" /> Criar minha rotina grátis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          </button>
          <p className="text-sm text-slate-400 mt-4">Sem cartão de crédito. Sem assinatura. Começa em minutos.</p>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-700">rotinaFlow</span>
          </div>
          <p className="text-sm text-slate-400">© 2025 rotinaFlow. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-sm text-slate-400">
            <a href="/privacidade" className="hover:text-slate-600 transition-colors">Política de Privacidade</a>
            <a href="/termos" className="hover:text-slate-600 transition-colors">Termos de Serviço</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
