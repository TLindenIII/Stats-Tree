import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, ArrowRight, BookOpen, Layers, Target, GraduationCap, ExternalLink, Info } from "lucide-react";
import { statisticalTests, type StatTest, getWikipediaUrl } from "@/lib/statsData";

interface TestDetailSheetProps {
  test: StatTest | null;
  onClose: () => void;
  onAlternativeClick: (testId: string) => void;
}

export function TestDetailSheet({ test, onClose, onAlternativeClick }: TestDetailSheetProps) {
  if (!test) return null;

  const levelColors: Record<string, string> = {
    basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <Dialog open={!!test} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden" data-testid="test-detail-sheet">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="w-5 h-5 text-primary" />
            {test.name}
          </DialogTitle>
          <div className="flex gap-2 flex-wrap mt-2">
            <Badge variant="outline">{test.category}</Badge>
            <Badge variant="secondary">{test.methodFamily}</Badge>
            {test.level && (
              <Badge className={levelColors[test.level] || ""}>
                {test.level.charAt(0).toUpperCase() + test.level.slice(1)}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-left mt-2">{test.description}</DialogDescription>
          {getWikipediaUrl(test.id) && (
            <a
              href={getWikipediaUrl(test.id)!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
              data-testid="link-wikipedia"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Learn more on Wikipedia
            </a>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-180px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {test.outcomeScale && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Outcome Scale
                  </div>
                  <p className="text-sm">{test.outcomeScale}</p>
                </div>
              )}
              {test.predictorStructure && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Layers className="w-4 h-4" />
                    Predictor Structure
                  </div>
                  <p className="text-sm">{test.predictorStructure}</p>
                </div>
              )}
              {test.design && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    Study Design
                  </div>
                  <p className="text-sm">{test.design}</p>
                </div>
              )}
              {test.level && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    Complexity Level
                  </div>
                  <p className="text-sm">{test.level.charAt(0).toUpperCase() + test.level.slice(1)}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Assumptions to Check
              </h4>
              <ul className="space-y-2">
                {[...test.assumptions].sort((a, b) => a.localeCompare(b)).map((assumption, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                When to Use
              </h4>
              <ul className="space-y-2">
                {[...test.whenToUse].sort((a, b) => a.localeCompare(b)).map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Alternative Tests</h4>
              {test.alternativeLinks && test.alternativeLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {test.alternativeLinks.map((altId) => {
                    const altTest = statisticalTests.find(t => t.id === altId);
                    if (!altTest) {
                      return (
                        <Badge key={altId} variant="outline">
                          {altId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Badge>
                      );
                    }
                    return (
                      <Button
                        key={altId}
                        variant="outline"
                        size="sm"
                        onClick={() => onAlternativeClick(altId)}
                        data-testid={`alt-link-${altId}`}
                      >
                        {altTest.name}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {test.alternatives.map((alt, i) => (
                    <Badge key={i} variant="outline">
                      {alt}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
