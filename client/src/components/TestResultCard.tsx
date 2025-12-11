import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Info, ArrowRight, Eye, GitCompare } from "lucide-react";
import { statisticalTests, type StatTest } from "@/lib/statsData";

interface TestResultCardProps {
  test: StatTest;
  isPrimary?: boolean;
  onViewDetails?: () => void;
  onCompare?: () => void;
  isComparing?: boolean;
  canCompare?: boolean;
  onAlternativeClick?: (testId: string) => void;
}

export function TestResultCard({ 
  test, 
  isPrimary = false, 
  onViewDetails,
  onCompare,
  isComparing = false,
  canCompare = true,
  onAlternativeClick
}: TestResultCardProps) {
  const levelColors: Record<string, string> = {
    basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <Card
      className={isPrimary ? "border-primary" : ""}
      data-testid={`test-result-${test.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            {isPrimary && (
              <Badge variant="default" className="mb-2">
                Recommended
              </Badge>
            )}
            <CardTitle className="font-mono text-xl">{test.name}</CardTitle>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{test.category}</Badge>
            <Badge variant="secondary">{test.methodFamily}</Badge>
            {test.level && (
              <Badge className={levelColors[test.level] || ""}>
                {test.level.charAt(0).toUpperCase() + test.level.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{test.description}</p>

        {(test.outcomeScale || test.design || test.predictorStructure) && (
          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
            {test.outcomeScale && (
              <span><strong>Outcome:</strong> {test.outcomeScale}</span>
            )}
            {test.design && (
              <span><strong>Design:</strong> {test.design}</span>
            )}
            {test.predictorStructure && (
              <span><strong>Predictors:</strong> {test.predictorStructure}</span>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="assumptions">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Assumptions to Check
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {test.assumptions.map((assumption, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="when-to-use">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                When to Use
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {test.whenToUse.map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="alternatives">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Alternative Tests
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {test.alternativeLinks && test.alternativeLinks.length > 0 ? (
                  test.alternativeLinks.map((altId) => {
                    const altTest = statisticalTests.find(t => t.id === altId);
                    if (!altTest) {
                      return (
                        <Badge key={altId} variant="outline">
                          {altId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Badge>
                      );
                    }
                    return onAlternativeClick ? (
                      <Button
                        key={altId}
                        variant="outline"
                        size="sm"
                        onClick={() => onAlternativeClick(altId)}
                        data-testid={`alt-link-${altId}`}
                      >
                        {altTest.name}
                      </Button>
                    ) : (
                      <Badge key={altId} variant="outline">
                        {altTest.name}
                      </Badge>
                    );
                  })
                ) : (
                  test.alternatives.map((alt, i) => (
                    <Badge key={i} variant="outline">
                      {alt}
                    </Badge>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {(onViewDetails || onCompare) && (
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails} data-testid={`view-details-${test.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
            {onCompare && (
              <Button 
                variant={isComparing ? "default" : "outline"} 
                size="sm" 
                onClick={onCompare}
                disabled={!canCompare && !isComparing}
                data-testid={`compare-${test.id}`}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {isComparing ? "Remove from Compare" : "Add to Compare"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
