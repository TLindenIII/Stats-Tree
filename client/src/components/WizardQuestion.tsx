import { SelectionCard } from "./SelectionCard";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface WizardQuestionProps {
  question: string;
  description?: string;
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function WizardQuestion({
  question,
  description,
  options,
  selectedValue,
  onSelect,
}: WizardQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{question}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
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
