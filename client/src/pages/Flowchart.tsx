import { useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Home, X, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { wizardSteps, statisticalTests, StatTest } from "@/lib/statsData";

interface DecisionNodeData {
  label: string;
  description?: string;
  stepId?: string;
}

interface TestNodeData {
  label: string;
  testIds: string[];
  category?: string;
}

function DecisionNode({ data }: { data: DecisionNodeData }) {
  return (
    <div className="px-4 py-3 rounded-md border bg-card shadow-sm min-w-[180px] max-w-[220px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      <div className="text-sm font-medium text-card-foreground text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1 text-center">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
    </div>
  );
}

function TestNode({ data, onClick }: { data: TestNodeData; onClick?: () => void }) {
  return (
    <div 
      className="px-4 py-3 rounded-md border-2 border-primary bg-primary/10 min-w-[160px] max-w-[200px] cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`flowchart-test-node-${data.testIds[0]}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      <div className="text-sm font-medium text-center">{data.label}</div>
      {data.testIds.length > 1 && (
        <Badge variant="secondary" className="mt-1 text-xs mx-auto block w-fit">
          +{data.testIds.length - 1} more
        </Badge>
      )}
    </div>
  );
}

function StartNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-6 py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-md">
      <div className="text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary-foreground" />
    </div>
  );
}

function TestDetailPanel({ 
  tests, 
  open, 
  onClose 
}: { 
  tests: StatTest[]; 
  open: boolean; 
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {tests.length === 1 ? tests[0].name : `${tests.length} Related Tests`}
          </SheetTitle>
          <SheetDescription>
            {tests.length === 1 
              ? tests[0].description 
              : "Click on a test to view details or use the wizard for recommendations."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          <div className="space-y-6 pr-4">
            {tests.map((test) => (
              <div key={test.id} className="space-y-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <h3 className="font-semibold font-mono text-base">{test.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                  <Badge variant="outline" className="mt-2">{test.category}</Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Assumptions
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {test.assumptions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">-</span>
                        {a}
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
                        <span className="text-primary">-</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {test.alternatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {test.alternatives.map((alt, i) => (
                        <Badge key={i} variant="secondary">{alt}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Button 
              className="w-full" 
              onClick={() => setLocation("/wizard")}
              data-testid="button-use-wizard"
            >
              Use Wizard for Recommendations
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function generateFlowchartData() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const startNode: Node = {
    id: "start",
    type: "startNode",
    position: { x: 400, y: 0 },
    data: { label: "What is your research goal?" },
  };
  nodes.push(startNode);
  
  const goalOptions = wizardSteps[0].options;
  const goalSpacing = 180;
  const startX = 400 - ((goalOptions.length - 1) * goalSpacing) / 2;
  
  goalOptions.forEach((option, i) => {
    const nodeId = `goal-${option.value}`;
    nodes.push({
      id: nodeId,
      type: "decisionNode",
      position: { x: startX + i * goalSpacing, y: 120 },
      data: { 
        label: option.label, 
        description: option.description,
        stepId: "research-goal"
      },
    });
    edges.push({
      id: `start-${nodeId}`,
      source: "start",
      target: nodeId,
      animated: false,
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
    });
  });

  const testMappings: Record<string, { tests: string[]; label: string; x: number; y: number }> = {
    "compare-continuous-parametric": {
      tests: ["t-test-independent", "one-way-anova", "paired-t-test", "welch-t-test"],
      label: "Parametric Comparison",
      x: -200,
      y: 360,
    },
    "compare-continuous-nonparametric": {
      tests: ["mann-whitney", "kruskal-wallis", "wilcoxon-signed-rank", "friedman-test"],
      label: "Non-parametric Comparison",
      x: 0,
      y: 360,
    },
    "compare-categorical": {
      tests: ["chi-square", "fisher-exact", "mcnemar-test"],
      label: "Categorical Comparison",
      x: 200,
      y: 360,
    },
    "relationship-continuous": {
      tests: ["pearson-correlation", "spearman-correlation", "partial-correlation", "kendall-tau"],
      label: "Correlation Analysis",
      x: 400,
      y: 360,
    },
    "predict-continuous": {
      tests: ["linear-regression", "multiple-regression", "lasso-ridge", "elastic-net"],
      label: "Continuous Prediction",
      x: 600,
      y: 360,
    },
    "predict-binary": {
      tests: ["logistic-regression", "random-forest", "svm", "xgboost"],
      label: "Binary Classification",
      x: 800,
      y: 360,
    },
    "time-series": {
      tests: ["arima", "exponential-smoothing", "prophet", "var"],
      label: "Time Series",
      x: 1000,
      y: 360,
    },
    "survival": {
      tests: ["kaplan-meier", "log-rank-test", "cox-regression"],
      label: "Survival Analysis",
      x: 1200,
      y: 360,
    },
    "unsupervised-clustering": {
      tests: ["kmeans", "hierarchical-clustering", "dbscan", "gaussian-mixture"],
      label: "Clustering",
      x: 1400,
      y: 360,
    },
    "unsupervised-dimension": {
      tests: ["pca", "factor-analysis", "tsne", "umap"],
      label: "Dimension Reduction",
      x: 1600,
      y: 360,
    },
  };

  edges.push(
    { id: "goal-compare-to-parametric", source: "goal-compare", target: "compare-continuous-parametric", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-compare-to-nonparametric", source: "goal-compare", target: "compare-continuous-nonparametric", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-compare-to-categorical", source: "goal-compare", target: "compare-categorical", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-relationship-to-correlation", source: "goal-relationship", target: "relationship-continuous", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-predict-to-continuous", source: "goal-predict", target: "predict-continuous", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-predict-to-binary", source: "goal-predict", target: "predict-binary", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-time-to-timeseries", source: "goal-time", target: "time-series", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-time-to-survival", source: "goal-time", target: "survival", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-unsupervised-to-clustering", source: "goal-unsupervised", target: "unsupervised-clustering", style: { stroke: "hsl(var(--muted-foreground))" } },
    { id: "goal-unsupervised-to-dimension", source: "goal-unsupervised", target: "unsupervised-dimension", style: { stroke: "hsl(var(--muted-foreground))" } },
  );

  Object.entries(testMappings).forEach(([id, mapping]) => {
    nodes.push({
      id,
      type: "testNode",
      position: { x: mapping.x, y: mapping.y },
      data: {
        label: mapping.label,
        testIds: mapping.tests,
        category: mapping.label,
      },
    });
  });

  const assumptionTests: Node = {
    id: "assumption-tests",
    type: "testNode",
    position: { x: 100, y: 520 },
    data: {
      label: "Assumption Testing",
      testIds: ["levene-test", "shapiro-wilk", "bartlett-test", "kolmogorov-smirnov"],
      category: "Assumption Testing",
    },
  };
  nodes.push(assumptionTests);

  const posthocTests: Node = {
    id: "posthoc-tests",
    type: "testNode",
    position: { x: 350, y: 520 },
    data: {
      label: "Post-hoc Tests",
      testIds: ["tukey-hsd", "bonferroni", "holm-bonferroni", "benjamini-hochberg"],
      category: "Post-hoc Tests",
    },
  };
  nodes.push(posthocTests);

  const effectSizes: Node = {
    id: "effect-sizes",
    type: "testNode",
    position: { x: 600, y: 520 },
    data: {
      label: "Effect Sizes",
      testIds: ["cohens-d", "hedges-g", "eta-squared", "odds-ratio"],
      category: "Effect Size",
    },
  };
  nodes.push(effectSizes);

  const bayesianMethods: Node = {
    id: "bayesian-methods",
    type: "testNode",
    position: { x: 850, y: 520 },
    data: {
      label: "Bayesian Methods",
      testIds: ["bayesian-t-test", "bayesian-regression", "bayesian-anova"],
      category: "Bayesian",
    },
  };
  nodes.push(bayesianMethods);

  const mlAdvanced: Node = {
    id: "ml-advanced",
    type: "testNode",
    position: { x: 1100, y: 520 },
    data: {
      label: "Advanced ML",
      testIds: ["neural-network-mlp", "lightgbm", "catboost", "decision-tree"],
      category: "Machine Learning",
    },
  };
  nodes.push(mlAdvanced);

  edges.push(
    { id: "parametric-to-assumption", source: "compare-continuous-parametric", target: "assumption-tests", style: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "5,5" } },
    { id: "parametric-to-posthoc", source: "compare-continuous-parametric", target: "posthoc-tests", style: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "5,5" } },
    { id: "parametric-to-effect", source: "compare-continuous-parametric", target: "effect-sizes", style: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "5,5" } },
  );

  return { nodes, edges };
}

export default function Flowchart() {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => generateFlowchartData(), []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedTests, setSelectedTests] = useState<StatTest[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const nodeTypes = useMemo(() => ({
    decisionNode: DecisionNode,
    testNode: (props: any) => (
      <TestNode 
        {...props} 
        onClick={() => handleTestNodeClick(props.data.testIds)}
      />
    ),
    startNode: StartNode,
  }), []);

  const handleTestNodeClick = useCallback((testIds: string[]) => {
    const tests = testIds
      .map(id => statisticalTests.find(t => t.id === id))
      .filter((t): t is StatTest => t !== undefined);
    if (tests.length > 0) {
      setSelectedTests(tests);
      setDetailOpen(true);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-full px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>StatGuide</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" data-testid="link-home">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wizard" data-testid="link-wizard">
                Wizard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tests" data-testid="link-tests">
                All Tests
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls 
            className="!bg-card !border !rounded-md !shadow-sm" 
            showInteractive={false}
          />
          <MiniMap 
            className="!bg-card !border !rounded-md"
            nodeColor={(node) => {
              if (node.type === "startNode") return "hsl(var(--primary))";
              if (node.type === "testNode") return "hsl(var(--primary) / 0.3)";
              return "hsl(var(--muted))";
            }}
          />
        </ReactFlow>
        
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-md border p-3 shadow-sm max-w-xs">
          <h3 className="font-medium text-sm mb-2">Interactive Flowchart</h3>
          <p className="text-xs text-muted-foreground">
            Click on test nodes to view details. Drag to pan, scroll to zoom.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-primary mr-1" />
              Start
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-muted mr-1" />
              Decision
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-primary/30 mr-1" />
              Tests
            </Badge>
          </div>
        </div>
      </div>

      <TestDetailPanel 
        tests={selectedTests} 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
      />
    </div>
  );
}
