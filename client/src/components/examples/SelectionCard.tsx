import { useState } from "react";
import { SelectionCard } from "../SelectionCard";

export default function SelectionCardExample() {
  const [selected, setSelected] = useState<string>("compare");

  const options = [
    { value: "estimate", label: "Estimate a parameter", description: "Confidence intervals, point estimates" },
    { value: "compare", label: "Compare groups", description: "Test differences between groups" },
    { value: "relationship", label: "Assess relationships", description: "Correlation, association" },
  ];

  return (
    <div className="w-full max-w-md space-y-3 p-4">
      {options.map((option) => (
        <SelectionCard
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          isSelected={selected === option.value}
          onSelect={setSelected}
        />
      ))}
    </div>
  );
}
