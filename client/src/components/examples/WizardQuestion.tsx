import { useState } from "react";
import { WizardQuestion } from "../WizardQuestion";

export default function WizardQuestionExample() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl p-6">
      <WizardQuestion
        question="What is your primary research goal?"
        options={[
          { value: "estimate", label: "Estimate a parameter", description: "Confidence intervals, point estimates" },
          { value: "compare", label: "Compare groups", description: "Test differences between groups" },
          { value: "relationship", label: "Assess relationships", description: "Correlation, association" },
        ]}
        selectedValue={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
