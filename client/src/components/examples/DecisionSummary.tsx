import { DecisionSummary } from "../DecisionSummary";
import { wizardSteps } from "@/lib/statsData";

const mockSelections = {
  "research-goal": "compare",
  "outcome-type": "continuous",
  "sample-structure": "independent",
};

export default function DecisionSummaryExample() {
  return (
    <div className="w-full max-w-sm p-4">
      <DecisionSummary steps={wizardSteps} selections={mockSelections} />
    </div>
  );
}
