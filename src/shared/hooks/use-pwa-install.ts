import { useState, useEffect } from "react";

let deferredPrompt: unknown = null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("pwa-install-dismissed") === "true"; } catch { return false; }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setCanInstall(false); deferredPrompt = null; });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt as BeforeInstallPromptEvent;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { deferredPrompt = null; setCanInstall(false); }
  };

  const dismiss = () => {
    try { localStorage.setItem("pwa-install-dismissed", "true"); } catch {}
    setDismissed(true);
  };

  return { canInstall: canInstall && !dismissed, install, dismiss };
}
