import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, ArrowRight, GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import type { StatTest } from "@/lib/statsData";

interface CompareSheetProps {
  tests: StatTest[];
  open: boolean;
  onClose: () => void;
  onRemoveTest: (testId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  context?: "wizard" | "browse";
}

export function CompareSheet({ 
  tests, 
  open, 
  onClose, 
  onRemoveTest,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  context = "wizard"
}: CompareSheetProps) {
  if (tests.length === 0) return null;

  const levelColors: Record<string, string> = {
    basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const showNavigation = onPrev && onNext && (hasPrev || hasNext);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`max-h-[90vh] p-0 overflow-hidden ${tests.length === 3 ? 'max-w-[90vw]' : 'max-w-4xl'}`} data-testid="compare-sheet">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GitCompare className="w-5 h-5 text-primary" />
            Compare Statistical Tests
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className={`p-6 grid gap-4 grid-cols-1 ${tests.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {tests.map((test, index) => (
              <Card 
                key={test.id} 
                className={`relative flex flex-col ${context === "wizard" && index === 0 ? 'border-primary' : ''}`} 
                data-testid={`compare-card-${test.id}`}
              >
                {context === "wizard" && index === 0 && (
                  <Badge className="absolute -top-2.5 left-3 text-xs w-fit">Recommended</Badge>
                )}
                {context === "wizard" && index === 1 && (
                  <Badge variant="secondary" className="absolute -top-2.5 left-3 text-xs w-fit">Alternative</Badge>
                )}
                <CardHeader className="pb-3 pt-6">
                  <CardTitle className="font-mono text-base leading-tight min-h-[2.5rem]">{test.name}</CardTitle>
                  <div className="flex gap-1 flex-wrap mt-2 min-h-[1.75rem]">
                    <Badge variant="outline" className="text-xs">{test.category}</Badge>
                    {test.level && (
                      <Badge className={`text-xs ${levelColors[test.level] || ""}`}>
                        {test.level.charAt(0).toUpperCase() + test.level.slice(1)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground text-xs min-h-[3rem]">{test.description}</p>

                  <div className="grid grid-cols-1 gap-1 text-xs bg-muted/50 p-2 rounded-md min-h-[4.5rem]">
                    {test.outcomeScale && (
                      <div>
                        <span className="text-muted-foreground font-medium">Outcome: </span>
                        {test.outcomeScale}
                      </div>
                    )}
                    {test.design && (
                      <div>
                        <span className="text-muted-foreground font-medium">Design: </span>
                        {test.design}
                      </div>
                    )}
                    {test.predictorStructure && (
                      <div>
                        <span className="text-muted-foreground font-medium">Predictors: </span>
                        {test.predictorStructure}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 min-h-[7rem]">
                    <h5 className="font-medium flex items-center gap-1 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Assumptions
                    </h5>
                    <ul className="space-y-1 pl-1">
                      {[...test.assumptions].sort((a, b) => a.localeCompare(b)).slice(0, 4).map((assumption, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs">
                          <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{assumption}</span>
                        </li>
                      ))}
                      {test.assumptions.length > 4 && (
                        <li className="text-xs text-muted-foreground pl-4">
                          +{test.assumptions.length - 4} more...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-2 min-h-[5.5rem]">
                    <h5 className="font-medium flex items-center gap-1 text-xs">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      When to Use
                    </h5>
                    <ul className="space-y-1 pl-1">
                      {[...test.whenToUse].sort((a, b) => a.localeCompare(b)).slice(0, 3).map((use, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs">
                          <ArrowRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{use}</span>
                        </li>
                      ))}
                      {test.whenToUse.length > 3 && (
                        <li className="text-xs text-muted-foreground pl-4">
                          +{test.whenToUse.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {showNavigation && (
          <div className="border-t px-6 py-4 flex justify-end gap-2 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={!hasPrev}
              data-testid="button-prev-alternative"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              data-testid="button-next-alternative"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
