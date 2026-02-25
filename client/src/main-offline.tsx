import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import { NavProvider } from "@/contexts/NavContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Wizard from "@/pages/Wizard";
import Results from "@/pages/Results";
import AllTests from "@/pages/AllTests";
import CascadingFlow from "@/pages/CascadingFlow";
import Glossary from "@/pages/Glossary";
import "./index.css";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wizard" component={Wizard} />
      <Route path="/results" component={Results} />
      <Route path="/browse" component={AllTests} />
      <Route path="/tree" component={CascadingFlow} />
      <Route path="/glossary" component={Glossary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WizardProvider>
          <NavProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <Routes />
            </Router>
          </NavProvider>
        </WizardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
