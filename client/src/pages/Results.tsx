import { useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { DecisionSummary } from "@/components/DecisionSummary";
import { CompareSheet } from "@/components/CompareSheet";
import { statisticalTests, wizardSteps, StatTest } from "@/lib/statsData";
import type { WizardContext } from "@/lib/statsData";
import { RotateCcw, Route } from "lucide-react";
import { NavLinks } from "@/components/NavLinks";

function resolveTests(ids: string[]): StatTest[] {
  return ids
    .map((id) => statisticalTests.find((t) => t.id === id))
    .filter((t): t is StatTest => t !== undefined);
}

export default function Results() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  // Support both old format (?tests=) and new format (?primary=&alt=&comp=)
  const hasNewFormat = params.has("primary");
  const selections: WizardContext = JSON.parse(
    decodeURIComponent(params.get("selections") || "{}")
  );

  let primaryTests: StatTest[] = [];
  let alternativeTests: StatTest[] = [];
  let companionTests: StatTest[] = [];

  if (hasNewFormat) {
    primaryTests = resolveTests(
      (params.get("primary") || "").split(",").filter(Boolean)
    );
    alternativeTests = resolveTests(
      (params.get("alt") || "").split(",").filter(Boolean)
    );
    companionTests = resolveTests(
      (params.get("comp") || "").split(",").filter(Boolean)
    );
  } else {
    // Backward compat: old ?tests= format → all are primaries
    primaryTests = resolveTests(
      (params.get("tests") || "").split(",").filter(Boolean)
    );
  }

  // Filter visible wizard steps for decision summary
  const visibleSteps = wizardSteps.filter(
    (s) => !s.askWhen || s.askWhen(selections)
  );

  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [currentBaseTest, setCurrentBaseTest] = useState<StatTest | null>(null);
  const [alternativesList, setAlternativesList] = useState<string[]>([]);
  const [currentAltIndex, setCurrentAltIndex] = useState(0);

  const handleStepClick = (stepIndex: number) => {
    setLocation(
      `/wizard?step=${stepIndex}&selections=${encodeURIComponent(JSON.stringify(selections))}`
    );
  };

  const handleAlternativeClick = (currentTest: StatTest, altId: string) => {
    const altTest = statisticalTests.find((t) => t.id === altId);
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
      const altTest = statisticalTests.find(
        (t) => t.id === alternativesList[newIndex]
      );
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const handleNextAlt = () => {
    if (
      currentAltIndex < alternativesList.length - 1 &&
      currentBaseTest
    ) {
      const newIndex = currentAltIndex + 1;
      const altTest = statisticalTests.find(
        (t) => t.id === alternativesList[newIndex]
      );
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const removeFromCompare = (testId: string) => {
    const updated = compareTests.filter((t) => t.id !== testId);
    setCompareTests(updated);
    if (updated.length === 0) {
      setShowCompare(false);
    }
  };

  const allEmpty =
    primaryTests.length === 0 &&
    alternativeTests.length === 0 &&
    companionTests.length === 0;

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
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Recommended Statistical Tests</h1>
            <p className="text-muted-foreground">
              Based on your selections, here are the statistical tests that best
              fit your analysis needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {allEmpty ? (
                <div className="bg-card rounded-md border p-8 text-center">
                  <p className="text-muted-foreground">
                    No specific recommendations found. Try adjusting your
                    selections.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/wizard" data-testid="button-try-again">
                      Try Again
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* ── Primary Recommendations ─────────────────────── */}
                  {primaryTests.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                        Best Matches
                      </h2>
                      <div className="space-y-6">
                        {primaryTests.map((test, idx) => (
                          <TestResultCard
                            key={test.id}
                            test={test}
                            isPrimary={idx === 0}
                            onAlternativeClick={(altId) =>
                              handleAlternativeClick(test, altId)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ── Alternatives ───────────────────────────────── */}
                  {alternativeTests.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                        Worth Considering
                      </h2>
                      <div className="space-y-6">
                        {alternativeTests.map((test) => (
                          <TestResultCard
                            key={test.id}
                            test={test}
                            onAlternativeClick={(altId) =>
                              handleAlternativeClick(test, altId)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ── Companions ─────────────────────────────────── */}
                  {companionTests.length > 0 && (
                    <section>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                        Useful Companions
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Diagnostics, post-hoc tests, and effect size measures
                        that complement your primary analysis.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {companionTests.slice(0, 8).map((test) => (
                          <TestResultCard
                            key={test.id}
                            test={test}
                            onAlternativeClick={(altId) =>
                              handleAlternativeClick(test, altId)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <DecisionSummary
                steps={visibleSteps}
                selections={selections}
                onStepClick={handleStepClick}
              />

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
