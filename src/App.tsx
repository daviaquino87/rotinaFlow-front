import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/error-boundary";

// Pages — lazy-loaded so each route only pulls its own code into the initial bundle
const Landing = lazy(() => import("@/pages/landing"));
const RoutineForm = lazy(() => import("@/pages/routine-form"));
const ProposalsList = lazy(() => import("@/pages/proposals-list"));
const ProposalView = lazy(() => import("@/pages/proposal-view"));
const TemplatesGallery = lazy(() => import("@/pages/templates"));
const TemplateView = lazy(() => import("@/pages/template-view"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Landing} />

        {/* Protected Routes wrapped in Layout */}
        <Route path="/routine">
          <AppLayout>
            <RoutineForm />
          </AppLayout>
        </Route>
        <Route path="/proposals">
          <AppLayout>
            <ProposalsList />
          </AppLayout>
        </Route>
        <Route path="/proposal/:uuid">
          <AppLayout>
            <ProposalView />
          </AppLayout>
        </Route>
        <Route path="/templates">
          <AppLayout>
            <TemplatesGallery />
          </AppLayout>
        </Route>
        <Route path="/templates/:uuid">
          <AppLayout>
            <TemplateView />
          </AppLayout>
        </Route>

        <Route path="/privacidade" component={PrivacyPolicy} />
        <Route path="/termos" component={TermsOfService} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
