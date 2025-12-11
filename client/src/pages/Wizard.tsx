import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { WizardQuestion } from "@/components/WizardQuestion";
import { DecisionSummary } from "@/components/DecisionSummary";
import { wizardSteps, getRecommendedTests } from "@/lib/statsData";
import { ArrowLeft, ArrowRight, RotateCcw, BarChart3 } from "lucide-react";

export default function Wizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

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
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>StatGuide</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} data-testid="button-start-over">
              <RotateCcw className="w-4 h-4 mr-1" />
              Start Over
            </Button>
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

            <div className="lg:col-span-1">
              <DecisionSummary steps={wizardSteps} selections={selections} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
