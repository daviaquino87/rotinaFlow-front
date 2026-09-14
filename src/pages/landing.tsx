import React, { useState, useEffect, useRef } from "react";
import { useGetSession } from "@/api-client";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
  Shield,
  RefreshCw,
  CalendarCheck2,
  LayoutGrid,
  ChevronRight,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { LanguageSwitcher } from "@/components/language-switcher";

// ─── Helpers ──────────────────────────────────────────────────────────────────
// ─── Animated Section Wrapper ─────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Fake Schedule Preview ─────────────────────────────────────────────────────
const SCHEDULE_BLOCKS = [
  { time: "06:30", labelKey: "gym", color: "#10B981", width: "75%" },
  { time: "08:00", labelKey: "deepFocus", color: "#3B82F6", width: "90%" },
  { time: "10:30", labelKey: "teamMeeting", color: "#3B82F6", width: "55%" },
  { time: "12:00", labelKey: "lunch", color: "#F59E0B", width: "40%" },
  { time: "14:00", labelKey: "readingStudy", color: "#06B6D4", width: "70%" },
  { time: "16:00", labelKey: "taskBlock", color: "#3B82F6", width: "80%" },
  { time: "19:00", labelKey: "walk", color: "#10B981", width: "45%" },
  { time: "21:00", labelKey: "nightReading", color: "#8B5CF6", width: "60%" },
];

function SchedulePreview() {
  const { t } = useTranslation("landing");
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden w-full max-w-sm">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-slate-300 text-xs font-mono ml-2">{t("schedulePreview.windowLabel")}</span>
      </div>
      <div className="p-4 space-y-2.5">
        {SCHEDULE_BLOCKS.map((block, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span className="text-xs font-mono text-slate-500 w-10 shrink-0">{block.time}</span>
            <div className="flex-1 relative h-7 rounded-lg overflow-hidden bg-slate-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: block.width }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-lg flex items-center px-2.5"
                style={{ backgroundColor: block.color + "22" }}
              >
                <span className="text-xs font-semibold truncate" style={{ color: block.color }}>
                  {t(`schedulePreview.blocks.${block.labelKey}`)}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">{t("schedulePreview.syncedLabel")}</span>
        </div>
        <CalendarCheck2 className="w-4 h-4 text-green-500" />
      </div>
    </div>
  );
}

// ─── Benefit Card ─────────────────────────────────────────────────────────────
function BenefitCard({
  icon: Icon,
  title,
  desc,
  color,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  delay: number;
}) {
  return (
    <FadeIn
      delay={delay}
      className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-default"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </FadeIn>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({
  num,
  title,
  desc,
  icon: Icon,
  color,
  delay,
}: {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} className="relative flex flex-col items-center text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
      >
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
  const { t } = useTranslation("landing");
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
      <nav
        // safe-area-pt: this is the app's start_url ("/") for the installed
        // PWA — the first fixed element a standalone-mode user sees — so it
        // needs the same notch clearance as AppLayout's header.
        className={`fixed top-0 left-0 right-0 z-50 safe-area-pt transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/icon-192.png"
              alt={t("nav.logoAlt")}
              className="w-8 h-8 rounded-lg shadow shadow-primary/30"
            />
            <span className="font-display font-bold text-lg tracking-tight">rotinaFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={handleLogin}
              disabled={waitingForLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-60"
            >
              {waitingForLogin ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("nav.loginWaiting")}
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" /> {t("nav.loginButton")}
                </>
              )}
            </button>
          </div>
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
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-6 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> {t("hero.badge")}
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
              {t("hero.titlePrefix")}{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-blue-500">
                  {t("hero.titleHighlight")}
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 via-violet-400/20 to-blue-400/20 blur-sm rounded-full" />
              </span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">{t("hero.subtitle")}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogin}
                disabled={waitingForLogin}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
              >
                {waitingForLogin ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> {t("hero.ctaPrimaryWaiting")}
                  </>
                ) : (
                  <>
                    <span>{t("hero.ctaPrimary")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <a
                href="#como-funciona"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 transition-all"
              >
                {t("hero.ctaSecondary")} <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {t("hero.trustNoCard")}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {t("hero.trustFreeRoutinePrefix")}{" "}
                <strong className="text-slate-700">{t("hero.trustFreeRoutineStrong")}</strong>
              </span>
            </div>
          </motion.div>

          {/* Right — Schedule Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{t("hero.floatingAiAnalyzingTitle")}</p>
                <p className="text-[11px] text-slate-500">{t("hero.floatingAiAnalyzingSubtitle")}</p>
              </div>
            </motion.div>

            <SchedulePreview />

            {/* Floating stats */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -right-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{t("hero.floatingBalanceTitle")}</p>
                <p className="text-[11px] text-slate-500">{t("hero.floatingBalanceSubtitle")}</p>
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
              <Zap className="w-3.5 h-3.5" /> {t("benefits.badge")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {t("benefits.title")}
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">{t("benefits.subtitle")}</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              delay={0}
              icon={Brain}
              color="#c904bc"
              title={t("benefits.items.aiStyle.title")}
              desc={t("benefits.items.aiStyle.desc")}
            />
            <BenefitCard
              delay={0.05}
              icon={CalendarCheck2}
              color="#3B82F6"
              title={t("benefits.items.oneClickSync.title")}
              desc={t("benefits.items.oneClickSync.desc")}
            />
            <BenefitCard
              delay={0.1}
              icon={Target}
              color="#10B981"
              title={t("benefits.items.focusOnGoals.title")}
              desc={t("benefits.items.focusOnGoals.desc")}
            />
            <BenefitCard
              delay={0.15}
              icon={Clock}
              color="#F59E0B"
              title={t("benefits.items.eliminateDecisions.title")}
              desc={t("benefits.items.eliminateDecisions.desc")}
            />
            <BenefitCard
              delay={0.2}
              icon={LayoutGrid}
              title={t("benefits.items.realBalance.title")}
              color="#8B5CF6"
              desc={t("benefits.items.realBalance.desc")}
            />
            <BenefitCard
              delay={0.25}
              icon={RefreshCw}
              color="#06B6D4"
              title={t("benefits.items.adjustAnytime.title")}
              desc={t("benefits.items.adjustAnytime.desc")}
            />
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* ── How it works ── */}
      <section id="como-funciona" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs mb-4 border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t("howItWorks.badge")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {t("howItWorks.title")}
            </h2>
            <p className="text-slate-500 text-lg">{t("howItWorks.subtitle")}</p>
          </FadeIn>

          {/* Steps */}
          <div className="relative grid md:grid-cols-3 gap-8">
            {/* connector lines */}
            <div className="hidden md:block absolute top-8 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-slate-200 via-primary/30 to-slate-200" />

            <StepCard
              num="1"
              delay={0}
              icon={User}
              color="#c904bc"
              title={t("howItWorks.steps.describe.title")}
              desc={t("howItWorks.steps.describe.desc")}
            />
            <StepCard
              num="2"
              delay={0.1}
              icon={Brain}
              color="#3B82F6"
              title={t("howItWorks.steps.generate.title")}
              desc={t("howItWorks.steps.generate.desc")}
            />
            <StepCard
              num="3"
              delay={0.2}
              icon={CalendarCheck2}
              color="#10B981"
              title={t("howItWorks.steps.sync.title")}
              desc={t("howItWorks.steps.sync.desc")}
            />
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
                <Shield className="w-3.5 h-3.5" /> {t("security.badge")}
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                {t("security.titlePrefix")}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">
                  {t("security.titleHighlight")}
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">{t("security.subtitle")}</p>
              <div className="space-y-3">
                {[
                  t("security.list.oauthLogin"),
                  t("security.list.bidirectionalSync"),
                  t("security.list.noExtraAccess"),
                  t("security.list.cancelAnytime"),
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
                    <p className="font-bold text-white">{t("security.widget.title")}</p>
                    <p className="text-xs text-slate-400">{t("security.widget.subtitle")}</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: t("security.widget.categories.workFocus"), pct: 38, color: "#3B82F6" },
                    { label: t("security.widget.categories.healthExercise"), pct: 22, color: "#10B981" },
                    { label: t("security.widget.categories.learning"), pct: 20, color: "#06B6D4" },
                    { label: t("security.widget.categories.leisureFamily"), pct: 12, color: "#8B5CF6" },
                    { label: t("security.widget.categories.meals"), pct: 8, color: "#F59E0B" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="font-bold text-white">{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
                        />
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
              <Sparkles className="w-3.5 h-3.5" /> {t("pricing.badge")}
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-slate-500 text-lg mb-12">{t("pricing.subtitle")}</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              {/* Free */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  {t("pricing.free.label")}
                </p>
                <p className="text-4xl font-extrabold text-slate-900 mb-1">{t("pricing.free.price")}</p>
                <p className="text-slate-500 text-sm mb-6">{t("pricing.free.caption")}</p>
                <div className="space-y-3 mb-8">
                  {[
                    t("pricing.free.features.oneRoutine"),
                    t("pricing.free.features.googleSync"),
                    t("pricing.free.features.manualEdit"),
                    t("pricing.free.features.dragDrop"),
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors"
                >
                  {t("pricing.free.cta")}
                </button>
              </div>

              {/* Credits */}
              <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
                  {t("pricing.credits.mostPopular")}
                </div>
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-2">
                  {t("pricing.credits.label")}
                </p>
                <p className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">{t("pricing.credits.priceValue")}</span>
                  <span className="text-white/70 text-sm">{t("pricing.credits.priceUnit")}</span>
                </p>
                <p className="text-white/70 text-sm mb-6">{t("pricing.credits.caption")}</p>
                <div className="space-y-3 mb-4">
                  {[
                    t("pricing.credits.features.everythingFree"),
                    t("pricing.credits.features.creditsNeverExpire"),
                    t("pricing.credits.features.packages"),
                    t("pricing.credits.features.unlimitedRoutines"),
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-white/80 shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-6">
                  {[3, 5, 10].map((c) => (
                    <div
                      key={c}
                      className="flex-1 bg-white/10 rounded-xl p-2 text-center border border-white/20"
                    >
                      <div className="font-bold text-sm">
                        {c} {t("pricing.credits.packageUnit")}
                      </div>
                      <div className="text-white/70 text-xs">
                        {t("pricing.credits.currencyPrefix")}
                        {c}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-colors"
                >
                  {t("pricing.credits.cta")}
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border-2 border-dashed border-primary/30"
            />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t("finalCta.title")}
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto">{t("finalCta.subtitle")}</p>
          <button
            onClick={handleLogin}
            disabled={waitingForLogin}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {waitingForLogin ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {t("finalCta.ctaWaiting")}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> {t("finalCta.cta")}{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-sm text-slate-500 mt-4">{t("finalCta.footnote")}</p>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/icon-192.png" alt={t("footer.logoAlt")} className="w-6 h-6 rounded-md" />
            <span className="font-bold text-slate-700">rotinaFlow</span>
          </div>
          <p className="text-sm text-slate-500">{t("footer.copyright")}</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="/privacidade" className="hover:text-slate-600 transition-colors">
              {t("footer.privacyPolicy")}
            </a>
            <a href="/termos" className="hover:text-slate-600 transition-colors">
              {t("footer.termsOfService")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
