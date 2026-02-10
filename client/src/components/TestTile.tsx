import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StatTest } from "@/lib/statsData";
import ReactMarkdown from "react-markdown";

interface TestTileProps {
  test: StatTest;
  onClick?: () => void;
  hoverColor?: "default" | "blue" | "amber" | "green";
}

export function TestTile({ test, onClick, hoverColor = "default" }: TestTileProps) {
  const hoverClasses = {
      default: "hover:border-primary/50",
      blue: "hover:border-blue-500 hover:ring-1 hover:ring-blue-500/20",
      amber: "hover:border-amber-500 hover:ring-1 hover:ring-amber-500/20",
      green: "hover:border-green-500 hover:ring-1 hover:ring-green-500/20"
  };

  return (
    <Card 
      className={`h-full transition-all hover:shadow-md border bg-card text-card-foreground ${
          onClick ? `cursor-pointer ${hoverClasses[hoverColor]}` : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold leading-tight">{test.name}</CardTitle>
            {test.methodFamily && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                    {test.methodFamily}
                </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground line-clamp-3">
          <ReactMarkdown>
            {test.description}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
