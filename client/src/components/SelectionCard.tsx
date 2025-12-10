import { cn } from "@/lib/utils";

interface SelectionCardProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export function SelectionCard({
  value,
  label,
  description,
  isSelected,
  onSelect,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "w-full text-left p-4 rounded-md border transition-all hover-elevate active-elevate-2",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      )}
      data-testid={`selection-card-${value}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground"
          )}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium", isSelected && "text-foreground")}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
