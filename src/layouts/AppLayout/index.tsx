import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Loader2, Sparkles, ClipboardList, CalendarDays, Coins } from "lucide-react";
import { useGetSession, useLogout } from "@/api-client";
import { CreditsModal } from "@modules/credits/components/credits-modal";
import { useCredits } from "@modules/credits/hooks/use-credits";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { OnboardingModal } from "@/components/onboarding-modal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_LINKS = [
  { href: "/routine",   icon: ClipboardList, label: "Nova Rotina",  match: (l: string) => l.startsWith("/routine") },
  { href: "/proposals", icon: CalendarDays,  label: "Minha Rotina", match: (l: string) => l.startsWith("/proposal") },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: session, isLoading, isFetching } = useGetSession({
    query: { refetchOnMount: "always" },
  });
  const logoutMut = useLogout();
  const { data: creditsData } = useCredits();
  const [showCredits, setShowCredits] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  if (!session || session.authenticated === false) {
    window.location.href = "/";
    return null;
  }

  const handleLogout = () => {
    setShowUserMenu(false);
    try { localStorage.removeItem("rotinaflow_form_draft"); } catch {}
    logoutMut.mutate(undefined, {
      onSuccess: () => { window.location.href = "/"; },
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
      title="Ver meus créditos"
    >
      <Coins className={`w-4 h-4 ${
        !firstSyncDone ? "text-emerald-600" : credits <= 2 ? "text-red-500" : "text-amber-600"
      }`} />
      {!firstSyncDone ? (
        <span className="text-sm font-semibold text-emerald-700">Grátis</span>
      ) : (
        <span className={`text-sm font-semibold ${credits <= 2 ? "text-red-600" : "text-amber-700"}`}>
          {credits}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <PwaInstallBanner />
      {isLoggedIn && <OnboardingModal />}

      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 shrink-0 z-10">

        <Link href="/routine" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-slate-900">rotinaFlow</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {NAV_LINKS.map(({ href, icon: Icon, label, match }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                match(location)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {isLoggedIn && <CreditsBadge />}

        {isLoggedIn && (
          <div className="hidden sm:flex items-center gap-2">
            <img
              src={session.user!.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user!.name)}&background=random`}
              alt={session.user!.name}
              className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
            />
            <span className="text-sm font-medium text-slate-700 hidden md:block truncate max-w-[160px]">
              {session.user!.name}
            </span>
            <button
              onClick={handleLogout}
              title="Sair"
              className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              {logoutMut.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <LogOut className="w-4 h-4" />}
            </button>
          </div>
        )}

        {isLoggedIn && (
          <div className="sm:hidden relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="relative w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <img
                src={session.user!.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user!.name)}&background=random`}
                alt={session.user!.name}
                className="w-full h-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-slate-100 w-48 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{session.user!.name}</p>
                  <p className="text-xs text-slate-400 truncate">{session.user!.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={logoutMut.isPending}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  {logoutMut.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <LogOut className="w-4 h-4" />}
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
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 flex-1 py-2"
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  active ? "bg-primary/10" : "hover:bg-slate-100"
                )}>
                  <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "text-slate-400")} />
                </div>
                <span className={cn("text-[10px] font-semibold transition-colors", active ? "text-primary" : "text-slate-400")}>
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
