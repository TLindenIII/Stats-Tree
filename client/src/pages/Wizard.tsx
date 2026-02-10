import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Link } from "@/lib/OfflineLink";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepProgress } from "@/components/StepProgress";
import { WizardQuestion } from "@/components/WizardQuestion";
import { DecisionSummary } from "@/components/DecisionSummary";
import { NavLinks } from "@/components/NavLinks";
import { wizardLogic, type WizardStep, type WizardOption } from "@/lib/wizardKeys";
import { ArrowLeft, ArrowRight, RotateCcw, Route } from "lucide-react";

// Helper to check if tags match a rule
const matchesRule = (tags: Record<string, any>, ruleCondition: Record<string, any>) => {
  for (const [key, value] of Object.entries(ruleCondition)) {
    // Handle nested objects (like assumption: { normality: "yes" })
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (!tags[key] || typeof tags[key] !== "object") return false;
      if (!matchesRule(tags[key], value)) return false;
    } else {
      if (tags[key] !== value) return false;
    }
  }
  return true;
};

export default function Wizard() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  // -- State Machine State --
  // history: stack of step IDs visited
  // tags: accumulated tags from selections
  // currentStepId: the ID of the step currently displayed

  const [history, setHistory] = useState<string[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string>("goal");
  const [tags, setTags] = useState<Record<string, any>>({});

  // Restore state from URL if present (simplified for now, mostly for results -> back)
  useEffect(() => {
    const fromTags = params.get("tags");
    const fromStep = params.get("step");
    if (fromTags) {
      try {
        setTags(JSON.parse(decodeURIComponent(fromTags)));
      } catch (e) {
        console.error("Failed to parse tags", e);
      }
    }
    if (fromStep && fromStep !== "goal") {
        // If we are restoring, we might need to reconstruct history.
        // For now, let's just start fresh if it's too complex or just accept the tags.
        // A robust implementation would need to replay the path or store the history in URL.
        // Given the "hardcode" nature, let's keep it simple: any invalid state resets to start.
    }
  }, []);

  // Get current step definition
  const currentStep = useMemo(() => {
    return wizardLogic.steps.find((s) => s.id === currentStepId);
  }, [currentStepId]);

  // Derived: visible steps for StepProgress (just history + current)
  const progressSteps = useMemo(() => {
    const list = history.map(id => wizardLogic.steps.find(s => s.id === id)).filter(Boolean) as WizardStep[];
    if (currentStep) list.push(currentStep);
    return list;
  }, [history, currentStep]);


  // Handler: Select an option
  const handleSelect = (value: string) => {
    if (!currentStep) return;
    
    const selectedOption = currentStep.options.find((o) => o.value === value);
    if (!selectedOption) return;

    // 1. Update tags
    const newTags = structuredClone(tags); // Deep copy
    if (selectedOption.set_tags) {
        // Recursive merge helper or just simple merge? Use simple for now, but handle nesting.
        // The schema uses nested "assumption".
        for (const [k, v] of Object.entries(selectedOption.set_tags)) {
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                newTags[k] = { ...(newTags[k] || {}), ...v };
            } else {
                newTags[k] = v;
            }
        }
    }

    // 2. Advance State
    setTags(newTags);
    setHistory((prev) => [...prev, currentStepId]);

    // 3. Check next
    if (selectedOption.next === "leaf") {
       finishWizard(newTags);
    } else {
       setCurrentStepId(selectedOption.next);
    }
  };
  
  const finishWizard = (finalTags: Record<string, any>) => {
      // Find matching rule
      const rule = wizardLogic.recommendation_rules.find(r => matchesRule(finalTags, r.when));
      
      let primaryIds = "";
      let altIds = "";
      let compIds = ""; // Add-ons

      if (rule) {
          primaryIds = rule.recommend.join(",");
          altIds = rule.alternatives.join(",");
          compIds = rule.add_ons.join(",");
      } else {
          // Fallback or "No exact match"
          // We could send them to a generic results page or empty
          console.warn("No rule matched tags:", finalTags);
      }
      
      setLocation(
        `/results?primary=${primaryIds}&alt=${altIds}&comp=${compIds}&tags=${encodeURIComponent(JSON.stringify(finalTags))}`
      );
  };


  const handleBack = () => {
    if (history.length === 0) return;

    const prevHistory = [...history];
    const prevStepId = prevHistory.pop();
    
    if (prevStepId) {
        setHistory(prevHistory);
        setCurrentStepId(prevStepId);
        
        // We also need to REVERT tags.
        // The easiest way is to replay the history to rebuild tags.
        // This assumes the path is deterministic based on history.
        // Actually, we can just re-calculate tags from the history + selections?
        // Wait, we don't store SELECTIONS, we store accumulated tags. 
        // Better strategy for "Back":
        //    State should ideally be: `selections: { stepId: optionValue }`
        //    And `tags` should be derived from `selections`.
        
        // Let's Refactor State slightly inline here to be safer:
        // Note: I will implement the logic to revert tags by re-building them.
        // BUT, since we already committed to `tags` state, let's fix it by switching to `selections` as source of truth.
    }
  };
  
  // -- RE-IMPLEMENTATION WITH SELECTIONS AS TRUTH --
  // This is safer for "Back" functionality.
  
  const [selections, setSelections] = useState<Record<string, string>>({}); // stepId -> value
  
  // Re-derive tags and current step from selections + graph walk?
  // Actually, easiest is:
  // keep `history` (path taken).
  // keep `selections` (answers).
  // When going back, remove last entry from history, and delete that step's selection.
  // Then re-compute tags from scratch based on remaining selections.
  
  const derivedTags = useMemo(() => {
      let t: Record<string, any> = {};
      // Replay all selections in order of history (if order matters for overrides)
      // Or just iterate selections if order doesn't conflict.
      // Let's iterate history to be safe and deterministic.
      
      // Note: currentStepId is NOT in history yet.
      // History contains completed steps.
      
      for (const stepId of history) {
          const val = selections[stepId];
          const stepDef = wizardLogic.steps.find(s => s.id === stepId);
          const opt = stepDef?.options.find(o => o.value === val);
          if (opt && opt.set_tags) {
              for (const [k, v] of Object.entries(opt.set_tags)) {
                if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                   t[k] = { ...(t[k] || {}), ...v };
                } else {
                   t[k] = v;
                }
             }
          }
      }
      return t;
  }, [selections, history]);

  const onSelectOption = (value: string) => {
      if (!currentStep) return;
      
      const newSelections = { ...selections, [currentStepId]: value };
      setSelections(newSelections);
      
      const selectedOption = currentStep.options.find((o) => o.value === value);
      
      // We need temporary tags including THIS selection to check "next" logic if it depended on dynamic tags
      // But here "next" is hardcoded in the option, so we are good.
      // If "next" was conditional, we'd need the new tags.
      
      if (selectedOption?.next === "leaf") {
          // Calculate final tags including this last step
          // (copy-paste the merge logic or use a helper)
          let finalTags = structuredClone(derivedTags);
           if (selectedOption.set_tags) {
              for (const [k, v] of Object.entries(selectedOption.set_tags)) {
                if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                   finalTags[k] = { ...(finalTags[k] || {}), ...v };
                } else {
                   finalTags[k] = v;
                }
             }
          }
          finishWizard(finalTags);
      } else if (selectedOption?.next) {
          setHistory([...history, currentStepId]);
          setCurrentStepId(selectedOption.next);
      }
  };

  const onBack = () => {
      if (history.length === 0) return;
      const newHistory = [...history];
      const prev = newHistory.pop();
      if (prev) {
          setHistory(newHistory);
          setCurrentStepId(prev);
          // Optional: clear the selection for the step we are backing INTO? 
          // Usually better to keep it selected but let user change it.
          // BUT we must clear the selection of the step we just LEFT (the "future" step).
          // Actually, if we just overwrite `selections` on forward, it's fine.
          // Cleanest: delete `selections[currentStepId]` (the one we are leaving)? 
          // No, we are leaving `currentStepId` to go to `prev`. 
          // The `currentStepId` was NOT in history, so it had no "locked" selection yet.
          // The `prev` is now the current step. 
          
          // Let's just remove the selection for the step we are abandoning (the current one)
          // just to keep state clean, though mostly cosmetic.
          const newSelections = { ...selections };
          delete newSelections[currentStepId]; 
          setSelections(newSelections);
      }
  };

  const handleReset = () => {
      setHistory([]);
      setSelections({});
      setCurrentStepId("goal");
  };

  const handleStepClick = (index: number) => {
       // Allow jumping back to history items
       if (index < history.length) {
           const targetStepId = history[index];
           // Truncate history to index
           const newHistory = history.slice(0, index);
           
           // Clean selections for steps that are now "future"
           // Steps removed: history[index] ... history[end] + current
           // Actually, if we jump to 'targetStepId', that becomes current.
           // Ideally we clear everything AFTER that.
           
           const newSelections = { ...selections };
           // We keep selection for targetStepId? Usually yes.
           // History should only contain PREVIOUS steps.
           // So if we jump to step X, X is now current, so it shouldn't be in history.
           
           setHistory(newHistory);
           setCurrentStepId(targetStepId);
           
           // We might want to clear selections for the steps we skipped over
           // But `derivedTags` handles that automatically because it iterates `history`.
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
            steps={progressSteps}
            currentStep={history.length} 
            onStepClick={handleStepClick}
          />

          {currentStep && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-md border p-8">
                  <WizardQuestion
                    question={currentStep.question}
                    options={currentStep.options}
                    selectedValue={selections[currentStep.id] ?? null}
                    onSelect={onSelectOption}
                  />
                </div>

                <div className="flex justify-between mt-6 gap-4">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={history.length === 0}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  {/* Next button is technically redundant as selection auto-advances, but we can keep it if we want "confirm" style 
                      Current WizardQuestion / Logic often auto-advances. 
                      Let's rely on WizardQuestion's onSelect which calls our handler. 
                      If we want a manual "Next", we'd track "pendingSelection".
                      For now, the previous wizard auto-advanced. keeping that flow.
                   */}
                </div>
              </div>

               <div className="lg:col-span-1 space-y-4">
                {/* Decision Summary needs to know the "steps" to show. 
                    We can pass the history-based steps + current. 
                    And the selections object.
                */}
                <DecisionSummary 
                    steps={progressSteps} 
                    selections={selections} 
                    onStepClick={handleStepClick} 
                />
                
                {history.length > 0 && (
                  <Button variant="outline" className="w-full" onClick={handleReset} data-testid="button-reset-wizard">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Wizard
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

