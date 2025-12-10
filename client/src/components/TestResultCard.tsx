import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react";
import type { StatTest } from "@/lib/statsData";

interface TestResultCardProps {
  test: StatTest;
  isPrimary?: boolean;
}

export function TestResultCard({ test, isPrimary = false }: TestResultCardProps) {
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
          <Badge variant="secondary">{test.methodFamily}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{test.description}</p>

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
                {test.alternatives.map((alt, i) => (
                  <Badge key={i} variant="outline">
                    {alt}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
