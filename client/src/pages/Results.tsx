import { useState, useMemo } from "react";
import { useSearch, useLocation } from "wouter";
import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestResultCard } from "@/components/TestResultCard";
import { TestTile } from "@/components/TestTile";
import { TestDetailSheet } from "@/components/TestDetailSheet";
import { DecisionSummary } from "@/components/DecisionSummary";
import { CompareSheet } from "@/components/CompareSheet";
import { statisticalTests, StatTest } from "@/lib/statsData";
import { wizardLogic } from "@/lib/wizardKeys";
import { RotateCcw, DraftingCompass } from "lucide-react";
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
  const selections: Record<string, string> = JSON.parse(
    decodeURIComponent(params.get("selections") || "{}")
  );

  let primaryTests: StatTest[] = [];
  let alternativeTests: StatTest[] = [];
  let companionTests: StatTest[] = [];

  if (hasNewFormat) {
    primaryTests = resolveTests((params.get("primary") || "").split(",").filter(Boolean));
    alternativeTests = resolveTests((params.get("alt") || "").split(",").filter(Boolean));
    companionTests = resolveTests((params.get("comp") || "").split(",").filter(Boolean));
  } else {
    // Backward compat: old ?tests= format → all are primaries
    primaryTests = resolveTests((params.get("tests") || "").split(",").filter(Boolean));
  }

  // Trace the valid path from "goal" to ensure steps are ordered correctly
  // and exclude any "ghost" selections from abandonded paths.
  const visibleSteps = useMemo(() => {
    const list: any[] = [];
    let simStepId = "goal";
    let stepsProcessed = 0;
    const maxSteps = 100; // Safety break

    while (stepsProcessed < maxSteps) {
      const stepDef = wizardLogic.steps.find((s) => s.id === simStepId);
      if (!stepDef) break;

      const selectedValue = selections[simStepId];
      if (!selectedValue) break; // Path ends here (or incomplete)

      const option = stepDef.options.find((o) => o.value === selectedValue);
      if (!option) break;

      list.push(stepDef);

      if (option.next === "leaf") {
        break;
      }
      simStepId = option.next;
      stepsProcessed++;
    }
    return list;
  }, [selections]);

  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [currentBaseTest, setCurrentBaseTest] = useState<StatTest | null>(null);
  const [alternativesList, setAlternativesList] = useState<string[]>([]);
  const [currentAltIndex, setCurrentAltIndex] = useState(0);
  const [selectedTest, setSelectedTest] = useState<StatTest | null>(null);

  const handleStepClick = (stepIndex: number) => {
    // visibleSteps contains the subset of steps that have been selected.
    // The index passed here corresponds to the index in visibleSteps.
    const targetStep = visibleSteps[stepIndex];
    if (targetStep) {
      setLocation(
        `/wizard?step=${targetStep.id}&selections=${encodeURIComponent(JSON.stringify(selections))}`
      );
    }
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
      const altTest = statisticalTests.find((t) => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const handleNextAlt = () => {
    if (currentAltIndex < alternativesList.length - 1 && currentBaseTest) {
      const newIndex = currentAltIndex + 1;
      const altTest = statisticalTests.find((t) => t.id === alternativesList[newIndex]);
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
    primaryTests.length === 0 && alternativeTests.length === 0 && companionTests.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <DraftingCompass className="w-5 h-5 text-primary" />
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
              Based on your selections, here are the statistical tests that best fit your analysis
              needs.
            </p>
          </div>

          {/* Compact Summary at Top */}
          <DecisionSummary
            variant="compact"
            steps={visibleSteps}
            selections={selections}
            onStepClick={handleStepClick}
          />

          <div className="space-y-12">
            {allEmpty ? (
              <div className="bg-card rounded-xl border shadow-sm p-12 text-center max-w-2xl mx-auto">
                <div className="mb-4 text-4xl">🤔</div>
                <h3 className="text-xl font-semibold mb-2">No exact matches found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find a test that perfectly matches all your criteria. Try adjusting
                  your last few selections or browse the full library.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/wizard" data-testid="button-try-again">
                      Adjust Selections
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/tests" data-testid="button-view-all-tests">
                      Browse All Tests
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Primary Recommendations ─────────────────────── */}
                {primaryTests.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-blue-500 rounded-full" />
                      <div>
                        <h2 className="text-2xl font-semibold">Best Matches</h2>
                        <p className="text-sm text-muted-foreground">
                          Recommended based on your specific scenario
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {primaryTests.map((test, idx) => (
                        <TestResultCard
                          key={test.id}
                          test={test}
                          isPrimary={idx === 0}
                          onAlternativeClick={(altId) => handleAlternativeClick(test, altId)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Alternatives ───────────────────────────────── */}
                {alternativeTests.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-green-500 rounded-full" />
                      <div>
                        <h2 className="text-xl font-semibold">Worth Considering</h2>
                        <p className="text-sm text-muted-foreground">
                          Good alternatives if assumptions aren't met
                        </p>
                      </div>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        alternativeTests.length === 1
                          ? "grid-cols-1 max-w-md"
                          : alternativeTests.length === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {alternativeTests.map((test) => (
                        <TestTile
                          key={test.id}
                          test={test}
                          onClick={() => setSelectedTest(test)}
                          hoverColor="green"
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Companions ─────────────────────────────────── */}
                {companionTests.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-amber-500 rounded-full" />
                      <div>
                        <h2 className="text-xl font-semibold">Useful Companions</h2>
                        <p className="text-sm text-muted-foreground">
                          Post-hoc tests, effect sizes, and diagnostics
                        </p>
                      </div>
                    </div>

                    <div
                      className={`grid gap-4 ${
                        companionTests.length === 1
                          ? "grid-cols-1 max-w-md"
                          : companionTests.length === 2
                            ? "grid-cols-1 md:grid-cols-2"
                            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {companionTests.slice(0, 8).map((test) => (
                        <TestTile
                          key={test.id}
                          test={test}
                          onClick={() => setSelectedTest(test)}
                          hoverColor="amber"
                        />
                      ))}
                    </div>
                  </section>
                )}

                <div className="flex justify-center pt-8 gap-4 border-t">
                  <Button variant="outline" asChild>
                    <Link href="/wizard" data-testid="button-reset-wizard">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart Analysis
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/tests">View All Tests →</Link>
                  </Button>
                </div>
              </>
            )}
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

      <TestDetailSheet
        test={selectedTest}
        onClose={() => setSelectedTest(null)}
        onAlternativeClick={(altId) => {
          if (selectedTest) {
            handleAlternativeClick(selectedTest, altId);
            setSelectedTest(null);
          }
        }}
        showWizardButton={false}
      />
    </div>
  );
}
