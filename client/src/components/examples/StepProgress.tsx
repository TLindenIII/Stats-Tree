import { StepProgress } from "../StepProgress";

const mockSteps = [
  { id: "goal", title: "Research Goal" },
  { id: "outcome", title: "Outcome Type" },
  { id: "structure", title: "Sample Structure" },
  { id: "groups", title: "Groups" },
  { id: "assumptions", title: "Assumptions" },
];

export default function StepProgressExample() {
  return (
    <div className="w-full max-w-3xl p-6">
      <StepProgress steps={mockSteps} currentStep={2} onStepClick={(i) => console.log("Clicked step:", i)} />
    </div>
  );
}
