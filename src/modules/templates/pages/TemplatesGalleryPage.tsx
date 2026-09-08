import { Link } from "wouter";
import { Coins, ListChecks, ArrowRight } from "lucide-react";
import { Card, Skeleton } from "@/components/ui-elements";
import { useTemplates } from "../hooks/use-templates";

export default function TemplatesGalleryPage() {
  const { data: templates, isLoading } = useTemplates();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Templates de Rotina</h1>
        <p className="text-slate-500 mt-2">
          Rotinas prontas, criadas por especialistas. Compre uma com seus créditos e ela vira sua
          — totalmente editável, sem afetar o template original.
        </p>
      </div>

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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Link key={template.uuid} href={`/templates/${template.uuid}`}>
              <Card className="p-6 h-full flex flex-col cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  {template.emoji}
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
