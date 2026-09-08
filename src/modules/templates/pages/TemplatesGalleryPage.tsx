import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Coins, ListChecks, ArrowRight } from "lucide-react";
import { Card, Skeleton } from "@/components/ui-elements";
import { cn } from "@lib/utils";
import { useTemplates } from "../hooks/use-templates";

const ALL_CATEGORY = "Todos";

export default function TemplatesGalleryPage() {
  const { data: templates, isLoading } = useTemplates();
  const [category, setCategory] = useState(ALL_CATEGORY);

  const categories = useMemo(() => {
    if (!templates) return [ALL_CATEGORY];
    const unique = Array.from(new Set(templates.map((t) => t.category))).sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
    return [ALL_CATEGORY, ...unique];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    if (category === ALL_CATEGORY) return templates;
    return templates.filter((t) => t.category === category);
  }, [templates, category]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Templates de Rotina</h1>
        <p className="text-slate-500 mt-2">
          Rotinas prontas, criadas por especialistas. Compre uma com seus créditos e ela vira sua —
          totalmente editável, sem afetar o template original.
        </p>
      </div>

      {!isLoading && templates && templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                category === c
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Nenhum template disponível no momento.</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">Nenhum template na categoria "{category}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Link key={template.uuid} href={`/templates/${template.uuid}`}>
              <Card className="p-6 h-full flex flex-col cursor-pointer group">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                    {template.emoji}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-full whitespace-nowrap">
                    {template.category}
                  </span>
                </div>
                <h2 className="font-display font-bold text-lg text-slate-900 mt-4">
                  {template.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 flex-1 line-clamp-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <ListChecks className="w-3.5 h-3.5" />
                    {template.eventCount} atividades semanais
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
                    <Coins className="w-4 h-4" />
                    {template.priceCredits}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary mt-4 group-hover:gap-2.5 transition-all">
                  Ver rotina <ArrowRight className="w-4 h-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
