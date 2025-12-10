import { SelectionCard } from "./SelectionCard";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface WizardQuestionProps {
  question: string;
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function WizardQuestion({
  question,
  options,
  selectedValue,
  onSelect,
}: WizardQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">{question}</h2>
      <div className="grid gap-3 max-w-xl mx-auto">
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            isSelected={selectedValue === option.value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
