import { Link } from "wouter";
import { CalendarX2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/30 mb-5">
          <CalendarX2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
          Página não encontrada
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          Esse link não existe ou mudou de endereço. Talvez a rotina que você procura tenha sido
          movida ou removida.
        </p>
        <Link
          href="/routine"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para minha rotina
        </Link>
      </div>
    </div>
  );
}
