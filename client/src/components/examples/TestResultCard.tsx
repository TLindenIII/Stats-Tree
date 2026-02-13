import { TestResultCard } from "../TestResultCard";
import type { StatTest } from "@/lib/statsData";

const mockTest: StatTest = {
  id: "t-test-independent",
  name: "Independent Samples t-Test",
  description: "Compares means of two independent groups to determine if they are statistically different.",
  assumptions: [
    "Normal distribution in each group",
    "Equal variances (can be relaxed with Welch's t-test)",
    "Independent observations",
    "Continuous outcome",
  ],
  whenToUse: [
    "Comparing two independent group means",
    "Sample size > 30 per group (or normally distributed)",
    "Continuous outcome variable",
  ],
  methodFamily: "Parametric",
  category: "Group Comparison",
  rules: { requires: { goal: "compare_groups" } },
};

export default function TestResultCardExample() {
  return (
    <div className="w-full max-w-2xl p-4">
      <TestResultCard test={mockTest} isPrimary />
    </div>
  );
}
