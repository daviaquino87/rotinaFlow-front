import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LogOut,
  Loader2,
  ClipboardList,
  CalendarDays,
  Coins,
  AlertTriangle,
  HelpCircle,
  LayoutTemplate,
} from "lucide-react";
import { useGetSession, useLogout } from "@/api-client";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { OnboardingModal, ONBOARDING_SEEN_KEY } from "@/components/onboarding-modal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  {
    href: "/routine",
    icon: ClipboardList,
    label: "Nova Rotina",
    shortLabel: "Nova",
    match: (l: string) => l.startsWith("/routine"),
  },
  {
    href: "/proposals",
    icon: CalendarDays,
    label: "Minha Rotina",
    shortLabel: "Minha",
    match: (l: string) => l.startsWith("/proposal"),
  },
  {
    href: "/templates",
    icon: LayoutTemplate,
    label: "Templates",
    shortLabel: "Templates",
    match: (l: string) => l.startsWith("/templates"),
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const {
    data: session,
    isLoading,
    isFetching,
    isError,
  } = useGetSession({
    query: { refetchOnMount: "always" },
  });
  const logoutMut = useLogout();
  const { data: creditsData } = useCredits();
  const [showCredits, setShowCredits] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // First-visit onboarding — shown once per browser (see ONBOARDING_SEEN_KEY)
  // and reopenable any time from "Como funciona" in the user menu below.
  useEffect(() => {
    if (!session?.user) return;
    try {
      if (!localStorage.getItem(ONBOARDING_SEEN_KEY)) setShowOnboarding(true);
    } catch {
      // localStorage unavailable
    }
  }, [session?.user]);

  // Show spinner during initial load OR while refetching stale unauthenticated data.
  // The second condition prevents a premature redirect when the landing page left
  // { authenticated: false } in the cache and the fresh refetch hasn't resolved yet.
  if (isLoading || (isFetching && !session?.authenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Network / server error: don't redirect — the user may be authenticated but
  // temporarily unreachable. Show a recoverable error screen instead.
  if (isError && !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-slate-600 text-sm">Não foi possível verificar sua sessão.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!session || session.authenticated === false) {
    window.location.href = "/";
    return null;
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    try {
      localStorage.removeItem("rotinaflow_form_draft");
    } catch {}
    logoutMut.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const credits = creditsData?.credits ?? 0;
  const firstSyncDone = creditsData?.firstSyncDone ?? false;
  const isLoggedIn = !!session?.user;

  const CreditsBadge = () => (
    <button
      onClick={() => setShowCredits(true)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
        !firstSyncDone
          ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
          : credits <= 2
            ? "bg-red-50 border-red-200 hover:bg-red-100"
            : "bg-amber-50 border-amber-200 hover:bg-amber-100"
      }`}
      title={
        !firstSyncDone
          ? "Ver meus créditos"
          : credits <= 2
            ? "Créditos baixos — ver meus créditos"
            : "Ver meus créditos"
      }
    >
      {/* An icon shape change (not just a color change) on low balance so the
          warning doesn't rely on distinguishing amber from red alone. */}
      {firstSyncDone && credits <= 2 ? (
        <AlertTriangle className="w-4 h-4 text-red-500" />
      ) : (
        <Coins className={`w-4 h-4 ${!firstSyncDone ? "text-emerald-600" : "text-amber-600"}`} />
      )}
      {!firstSyncDone ? (
        <span className="text-sm font-semibold text-emerald-700">Grátis</span>
      ) : (
        <span
          className={`text-sm font-semibold ${credits <= 2 ? "text-red-600" : "text-amber-700"}`}
        >
          {credits}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <PwaInstallBanner />
      {isLoggedIn && (
        <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      )}

      {/* safe-area-pt: with viewport-fit=cover (needed for the bottom nav's
          safe-area-pb below to work at all) the whole layout viewport can
          extend under the status bar/notch in standalone PWA mode — this is
          the first element on every authenticated screen, so it needs the
          same top clearance as the landing page's fixed navbar. */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 shrink-0 z-10 safe-area-pt">
        <Link href="/routine" className="flex items-center gap-2 shrink-0">
          <img
            src="/images/icon-192.png"
            alt="rotinaFlow"
            className="w-8 h-8 rounded-lg shadow shadow-primary/20"
          />
          <span className="font-display font-bold text-lg tracking-tight text-slate-900">
            rotinaFlow
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {NAV_LINKS.map(({ href, icon: Icon, label, shortLabel, match }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                match(location)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {/* Between sm (640px) and lg (1024px) there isn't enough room
                  for the full labels alongside the logo, credits badge and
                  user menu on one line — show the short form there and the
                  full label once the header has real breathing room. */}
              <span className="hidden lg:inline">{label}</span>
              <span className="lg:hidden">{shortLabel}</span>
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {isLoggedIn && <CreditsBadge />}

        {isLoggedIn && (
          <div className="hidden sm:flex items-center gap-2">
            <img
              src={
                session.user!.picture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user!.name)}&background=random`
              }
              alt={session.user!.name}
              className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
            />
            <span className="text-sm font-medium text-slate-700 hidden md:block truncate max-w-[160px]">
              {session.user!.name}
            </span>
            <button
              onClick={() => setShowOnboarding(true)}
              title="Como funciona"
              className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              {logoutMut.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {isLoggedIn && (
          <div className="sm:hidden relative" ref={userMenuRef}>
            {/* The visible avatar stays 32px so it doesn't outgrow the header,
                but the button itself is a 44px hit area (WCAG 2.2 §2.5.8) —
                otherwise this is the smallest tap target on the whole
                mobile UI for an action (checking who's logged in, signing
                out) used on every visit. */}
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="relative w-11 h-11 -m-1.5 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <img
                src={
                  session.user!.picture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user!.name)}&background=random`
                }
                alt={session.user!.name}
                className="w-8 h-8 rounded-full border-2 border-slate-200 object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-slate-100 w-48 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {session.user!.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{session.user!.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowOnboarding(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <HelpCircle className="w-4 h-4" />
                  Como funciona
                </button>
                <button
                  onClick={handleLogout}
                  disabled={logoutMut.isPending}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  {logoutMut.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {isLoggedIn && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-4 safe-area-pb">
          {NAV_LINKS.map(({ href, icon: Icon, label, match }) => {
            const active = match(location);
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 flex-1 py-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                    active ? "bg-primary/10" : "hover:bg-slate-100",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      active ? "text-primary" : "text-slate-500",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors",
                    active ? "text-primary" : "text-slate-500",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      <CreditsModal
        open={showCredits}
        onClose={() => setShowCredits(false)}
        currentCredits={credits}
      />
    </div>
  );
}
