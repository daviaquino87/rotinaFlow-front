import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();
  if (!canInstall) return null;

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Download className="w-4 h-4 shrink-0" />
        <p className="text-sm font-medium truncate">
          <span className="hidden sm:inline">Instale o rotinaFlow no seu celular para acesso rápido — </span>
          <span className="sm:hidden">Instale o app para acesso rápido — </span>
          <button onClick={install} className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity">
            Instalar agora
          </button>
        </p>
      </div>
      <button onClick={dismiss} className="p-1 rounded-lg hover:bg-white/20 transition-colors shrink-0" aria-label="Fechar">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
