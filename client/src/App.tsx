import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import { NavProvider } from "@/contexts/NavContext";
import { useHashLocation, isOfflineMode } from "@/lib/useHashLocation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Wizard from "@/pages/Wizard";
import Results from "@/pages/Results";
import AllTests from "@/pages/AllTests";
import Flowchart from "@/pages/Flowchart";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wizard" component={Wizard} />
      <Route path="/results" component={Results} />
      <Route path="/tests" component={AllTests} />
      <Route path="/flowchart" component={Flowchart} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const offlineMode = isOfflineMode();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WizardProvider>
          <NavProvider>
            <Toaster />
            {offlineMode ? (
              <WouterRouter hook={useHashLocation}>
                <Routes />
              </WouterRouter>
            ) : (
              <Routes />
            )}
          </NavProvider>
        </WizardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
