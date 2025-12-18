import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { DecisionSummary } from "@/components/DecisionSummary";
import { CompareSheet } from "@/components/CompareSheet";
import { statisticalTests, wizardSteps, StatTest } from "@/lib/statsData";
import { RotateCcw, Route } from "lucide-react";

export default function Results() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const testIds = params.get("tests")?.split(",") || [];
  const selections = JSON.parse(decodeURIComponent(params.get("selections") || "{}"));

  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  
  const handleStepClick = (stepIndex: number) => {
    // Navigate to wizard with the step and current selections preserved
    setLocation(`/wizard?step=${stepIndex}&selections=${encodeURIComponent(JSON.stringify(selections))}`);
  };
  const [showCompare, setShowCompare] = useState(false);
  const [currentBaseTest, setCurrentBaseTest] = useState<StatTest | null>(null);
  const [alternativesList, setAlternativesList] = useState<string[]>([]);
  const [currentAltIndex, setCurrentAltIndex] = useState(0);

  const recommendedTests = testIds
    .map((id) => statisticalTests.find((t) => t.id === id))
    .filter(Boolean);

  const handleAlternativeClick = (currentTest: StatTest, altId: string) => {
    const altTest = statisticalTests.find(t => t.id === altId);
    if (altTest) {
      const alternatives = currentTest.alternativeLinks || [];
      const altIndex = alternatives.indexOf(altId);
      
      setCurrentBaseTest(currentTest);
      setAlternativesList(alternatives);
      setCurrentAltIndex(altIndex >= 0 ? altIndex : 0);
      setCompareTests([currentTest, altTest]);
      setShowCompare(true);
    }
  };

  const handlePrevAlt = () => {
    if (currentAltIndex > 0 && currentBaseTest) {
      const newIndex = currentAltIndex - 1;
      const altTest = statisticalTests.find(t => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const handleNextAlt = () => {
    if (currentAltIndex < alternativesList.length - 1 && currentBaseTest) {
      const newIndex = currentAltIndex + 1;
      const altTest = statisticalTests.find(t => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const removeFromCompare = (testId: string) => {
    const updated = compareTests.filter(t => t.id !== testId);
    setCompareTests(updated);
    if (updated.length === 0) {
      setShowCompare(false);
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/flowchart" data-testid="link-use-flowchart">
                Use Flowchart
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Recommended Statistical Tests</h1>
            <p className="text-muted-foreground">
              Based on your selections, here are the statistical tests that best fit your analysis needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {recommendedTests.length > 0 ? (
                recommendedTests.map((test, index) => (
                  <TestResultCard
                    key={test!.id}
                    test={test!}
                    isPrimary={index === 0}
                    onAlternativeClick={(altId) => handleAlternativeClick(test!, altId)}
                  />
                ))
              ) : (
                <div className="bg-card rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">
                    No specific recommendations found. Try adjusting your selections.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/wizard" data-testid="button-try-again">
                      Try Again
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <DecisionSummary steps={wizardSteps} selections={selections} onStepClick={handleStepClick} />
              
              <div className="flex flex-col gap-3">
                <Button variant="outline" asChild>
                  <Link href="/wizard" data-testid="button-reset-wizard">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Wizard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/tests" data-testid="button-view-all-tests">
                    View All Tests
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CompareSheet
        tests={compareTests}
        open={showCompare}
        onClose={() => setShowCompare(false)}
        onRemoveTest={removeFromCompare}
        onPrev={handlePrevAlt}
        onNext={handleNextAlt}
        hasPrev={currentAltIndex > 0}
        hasNext={currentAltIndex < alternativesList.length - 1}
      />
    </div>
  );
}
