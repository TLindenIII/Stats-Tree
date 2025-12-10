import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { WizardStep } from "@/lib/statsData";

interface DecisionSummaryProps {
  steps: WizardStep[];
  selections: Record<string, string>;
}

export function DecisionSummary({ steps, selections }: DecisionSummaryProps) {
  const selectedSteps = steps.filter((step) => selections[step.id]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Selections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedSteps.map((step, index) => {
            const option = step.options.find((o) => o.value === selections[step.id]);
            return (
              <div key={step.id} className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-normal">
                  {step.title}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{option?.label}</span>
                {index < selectedSteps.length - 1 && (
                  <div className="w-full h-px bg-border my-1" />
                )}
              </div>
            );
          })}
          {selectedSteps.length === 0 && (
            <p className="text-sm text-muted-foreground">No selections made yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
