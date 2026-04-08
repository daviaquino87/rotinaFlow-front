import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/landing";
import RoutineForm from "@/pages/routine-form";
import ProposalsList from "@/pages/proposals-list";
import ProposalView from "@/pages/proposal-view";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import { AppLayout } from "@/components/layout";

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
    <Switch>
      <Route path="/" component={Landing} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/routine">
        <AppLayout><RoutineForm /></AppLayout>
      </Route>
      <Route path="/proposals">
        <AppLayout><ProposalsList /></AppLayout>
      </Route>
      <Route path="/proposal/:uuid">
        <AppLayout><ProposalView /></AppLayout>
      </Route>

      <Route path="/privacidade" component={PrivacyPolicy} />
      <Route path="/termos" component={TermsOfService} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
