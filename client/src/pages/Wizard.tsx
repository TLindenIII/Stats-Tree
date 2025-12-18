import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { WizardQuestion } from "@/components/WizardQuestion";
import { DecisionSummary } from "@/components/DecisionSummary";
import { NavLinks } from "@/components/NavLinks";
import { wizardSteps, getRecommendedTests } from "@/lib/statsData";
import { ArrowLeft, ArrowRight, RotateCcw, Route } from "lucide-react";

export default function Wizard() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  // Initialize from URL params if coming from Results page
  const initialStep = parseInt(params.get("step") || "0", 10);
  const initialSelections = params.get("selections") 
    ? JSON.parse(decodeURIComponent(params.get("selections")!)) 
    : {};
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);

  const step = wizardSteps[currentStep];
  const isLastStep = currentStep === wizardSteps.length - 1;
  const canProceed = selections[step.id] !== undefined;

  const handleSelect = (value: string) => {
    setSelections((prev) => ({ ...prev, [step.id]: value }));
    
    // Auto-advance to next step after selection (with small delay for visual feedback)
    // Check against wizardSteps length directly since isLastStep uses stale closure
    setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev < wizardSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 150);
  };

  const handleNext = () => {
    if (isLastStep) {
      const tests = getRecommendedTests(selections);
      const testIds = tests.map((t) => t.id).join(",");
      setLocation(`/results?tests=${testIds}&selections=${encodeURIComponent(JSON.stringify(selections))}`);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelections({});
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Route className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
          </Link>
          <div className="flex items-center gap-2">
            <NavLinks currentPage="wizard" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <StepProgress
            steps={wizardSteps.map((s) => ({ id: s.id, title: s.title }))}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-md border p-8">
                <WizardQuestion
                  question={step.question}
                  options={step.options}
                  selectedValue={selections[step.id] ?? null}
                  onSelect={handleSelect}
                />
              </div>

              <div className="flex justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  data-testid="button-next"
                >
                  {isLastStep ? "Get Recommendations" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <DecisionSummary steps={wizardSteps} selections={selections} onStepClick={handleStepClick} />
              
              {Object.keys(selections).length > 0 && (
                <Button variant="outline" className="w-full" onClick={handleReset} data-testid="button-reset-wizard">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Wizard
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
