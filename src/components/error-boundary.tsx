import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Class component because React error boundaries only work with
// componentDidCatch/getDerivedStateFromError — there is no hook equivalent.
// Without this, an exception thrown while rendering (e.g. unexpected shape
// in an AI-generated proposal) unmounts the entire app to a blank screen
// with no way for the user to recover short of a manual reload.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive to-red-400 shadow-lg shadow-destructive/30 mb-5">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Algo deu errado</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Encontramos um erro inesperado. Recarregue a página para continuar — se o problema
            persistir, tente novamente em alguns minutos.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar página
          </button>
        </div>
      </div>
    );
  }
}
