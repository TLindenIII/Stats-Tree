import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  GitCompare,
  Code,
  DraftingCompass,
  ArrowRight,
} from "lucide-react";
import { statisticalTests, type StatTest } from "@/lib/statsData";
import { useLocation } from "wouter";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { TextWithGlossary } from "@/components/TextWithGlossary";

interface TestDetailSheetProps {
  test: StatTest | null;
  onClose: () => void;
  onAlternativeClick: (testId: string) => void;
  showWizardButton?: boolean;
}

export function TestDetailSheet({
  test,
  onClose,
  onAlternativeClick,
  showWizardButton = true,
}: TestDetailSheetProps) {
  const [, setLocation] = useLocation();

  if (!test) return null;

  return (
    <Dialog open={!!test} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col"
        data-testid="test-detail-sheet"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <DraftingCompass className="w-5 h-5 text-primary" />
              {test.name}
            </DialogTitle>
          </div>
          <DialogDescription>
            <TextWithGlossary text={test.description} />
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <div className="space-y-4 p-4 bg-muted/50 rounded-md">
              <div>
                <h3 className="font-semibold font-mono text-base">{test.name}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  <TextWithGlossary text={test.description} />
                </div>
                <div className="flex gap-3 mt-2 flex-wrap items-center">
                  <Badge variant="outline">{test.category}</Badge>
                  {test.outcome && (
                    <span className="text-xs text-muted-foreground">
                      <strong>Outcome:</strong> {test.outcome}
                    </span>
                  )}
                  {test.design && (
                    <span className="text-xs text-muted-foreground">
                      <strong>Design:</strong> {test.design}
                    </span>
                  )}
                  {test.wikipediaUrl && (
                    <a
                      href={test.wikipediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      data-testid="link-wikipedia"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Wikipedia
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Assumptions
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {test.assumptions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground/50">-</span>
                      <div className="markdown-inline">
                        <TextWithGlossary text={a} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  When to Use
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {test.whenToUse.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground/50">-</span>
                      <div className="markdown-inline">
                        <TextWithGlossary text={w} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {test.alternativeLinks && test.alternativeLinks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Alternatives
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {test.alternativeLinks.map((altId) => {
                      const altTest = statisticalTests.find((t) => t.id === altId);
                      if (!altTest) {
                        return (
                          <Badge key={altId} variant="secondary">
                            {altId
                              .split("-")
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(" ")}
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
                          <GitCompare className="w-3 h-3 mr-1" />
                          {altTest.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Code Examples
                </h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-medium mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        Python
                      </Badge>
                    </h5>
                    <CodeBlock
                      code={test.pythonCode || `# Python code example coming soon`}
                      lang="python"
                    />
                  </div>

                  <hr className="border-border my-4" />

                  <div>
                    <h5 className="text-xs font-medium mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        R
                      </Badge>
                    </h5>
                    <CodeBlock code={test.rCode || `# R code example coming soon`} lang="r" />
                  </div>
                </div>
              </div>
            </div>

            {showWizardButton && (
              <Button
                className="w-full"
                onClick={() => setLocation("/wizard")}
                data-testid="button-use-wizard"
              >
                Use Wizard for Recommendations
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
