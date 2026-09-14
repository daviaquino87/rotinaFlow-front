import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "pt";

  const toggle = () => {
    const next = current === "pt" ? "en" : "pt";
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={t("language.label")}
      aria-label={t("language.label")}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all shrink-0",
        className,
      )}
    >
      <Languages className="w-4 h-4 shrink-0" />
      <span>{current === "pt" ? "PT" : "EN"}</span>
    </button>
  );
}
