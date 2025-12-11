import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import type { StatTest } from "@/lib/statsData";

interface CompareSheetProps {
  tests: StatTest[];
  open: boolean;
  onClose: () => void;
  onRemoveTest: (testId: string) => void;
}

export function CompareSheet({ tests, open, onClose, onRemoveTest }: CompareSheetProps) {
  if (tests.length === 0) return null;

  const levelColors: Record<string, string> = {
    basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto" side="bottom" data-testid="compare-sheet">
        <SheetHeader>
          <SheetTitle>Compare Statistical Tests</SheetTitle>
        </SheetHeader>

        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
          {tests.map((test) => (
            <Card key={test.id} className="relative" data-testid={`compare-card-${test.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onRemoveTest(test.id)}
                data-testid={`remove-compare-${test.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-lg pr-8">{test.name}</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">{test.category}</Badge>
                  <Badge variant="secondary" className="text-xs">{test.methodFamily}</Badge>
                  {test.level && (
                    <Badge className={`text-xs ${levelColors[test.level] || ""}`}>
                      {test.level.charAt(0).toUpperCase() + test.level.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">{test.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {test.outcomeScale && (
                    <div>
                      <span className="text-muted-foreground">Outcome: </span>
                      {test.outcomeScale}
                    </div>
                  )}
                  {test.design && (
                    <div>
                      <span className="text-muted-foreground">Design: </span>
                      {test.design}
                    </div>
                  )}
                  {test.predictorStructure && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Predictors: </span>
                      {test.predictorStructure}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertCircle className="w-3 h-3" />
                    Assumptions
                  </h5>
                  <ul className="space-y-1">
                    {test.assumptions.slice(0, 3).map((assumption, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{assumption}</span>
                      </li>
                    ))}
                    {test.assumptions.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{test.assumptions.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="w-3 h-3" />
                    When to Use
                  </h5>
                  <ul className="space-y-1">
                    {test.whenToUse.slice(0, 2).map((use, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs">
                        <ArrowRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{use}</span>
                      </li>
                    ))}
                    {test.whenToUse.length > 2 && (
                      <li className="text-xs text-muted-foreground">
                        +{test.whenToUse.length - 2} more...
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
