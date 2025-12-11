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
import { BarChart3, Home, CheckCircle2, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { statisticalTests, StatTest } from "@/lib/statsData";

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
    <div className="px-4 py-3 rounded-md border bg-card shadow-sm min-w-[140px] max-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="text-xs font-medium text-card-foreground text-center">{data.label}</div>
      {data.description && (
        <div className="text-[10px] text-muted-foreground mt-1 text-center line-clamp-2">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
}

function TestNode({ data, onClick }: { data: TestNodeData; onClick?: () => void }) {
  return (
    <div 
      className="px-3 py-2 rounded-md border-2 border-primary bg-primary/10 min-w-[120px] max-w-[160px] cursor-pointer hover-elevate"
      onClick={onClick}
      data-testid={`flowchart-test-node-${data.testIds[0]}`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="text-xs font-medium text-center">{data.label}</div>
      {data.testIds.length > 1 && (
        <Badge variant="secondary" className="mt-1 text-[10px] mx-auto block w-fit">
          +{data.testIds.length - 1} more
        </Badge>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
}

function StartNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-md">
      <div className="text-sm text-center">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary-foreground" />
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
                        <span className="text-muted-foreground/50">-</span>
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
                        <span className="text-muted-foreground/50">-</span>
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
  
  const nodeSpacing = 220; // Minimum horizontal spacing between nodes
  const layerGap = 160; // Vertical spacing between layers
  
  const edgeStyle = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 };
  const primaryEdgeStyle = { stroke: "hsl(var(--primary))", strokeWidth: 2 };

  // Layer 0: Start node (centered above goals)
  nodes.push({
    id: "start",
    type: "startNode",
    position: { x: 550, y: 0 },
    data: { label: "What is your research goal?" },
  });

  // Layer 1: Research Goals (main branches) - evenly spaced
  const goals = [
    { id: "compare", label: "Compare Groups", x: 0 },
    { id: "relationship", label: "Assess Relationships", x: nodeSpacing },
    { id: "predict", label: "Predict Outcomes", x: nodeSpacing * 2 },
    { id: "time", label: "Time/Sequential", x: nodeSpacing * 3 },
    { id: "unsupervised", label: "Discover Patterns", x: nodeSpacing * 4 },
    { id: "planning", label: "Study Planning", x: nodeSpacing * 5 },
  ];

  goals.forEach((goal) => {
    nodes.push({
      id: `goal-${goal.id}`,
      type: "decisionNode",
      position: { x: goal.x, y: layerGap },
      data: { label: goal.label },
    });
    edges.push({
      id: `start-to-${goal.id}`,
      source: "start",
      target: `goal-${goal.id}`,
      style: primaryEdgeStyle,
    });
  });

  // Layer 2: Outcome Types (branching from goals)
  // Compare branch - centered under goal-compare (x=0)
  const compareOutcomes = [
    { id: "compare-continuous", label: "Continuous Data", parent: "goal-compare", x: -110 },
    { id: "compare-categorical", label: "Categorical Data", parent: "goal-compare", x: 110 },
  ];

  compareOutcomes.forEach((outcome) => {
    nodes.push({
      id: outcome.id,
      type: "decisionNode",
      position: { x: outcome.x, y: layerGap * 2 },
      data: { label: outcome.label },
    });
    edges.push({
      id: `${outcome.parent}-to-${outcome.id}`,
      source: outcome.parent,
      target: outcome.id,
      style: edgeStyle,
    });
  });

  // Relationship branch - under goal-relationship (x=220)
  nodes.push({
    id: "relationship-type",
    type: "decisionNode",
    position: { x: nodeSpacing, y: layerGap * 2 },
    data: { label: "Variable Types" },
  });
  edges.push({
    id: "goal-relationship-to-type",
    source: "goal-relationship",
    target: "relationship-type",
    style: edgeStyle,
  });

  // Predict branch - under goal-predict (x=440)
  const predictOutcomes = [
    { id: "predict-continuous", label: "Continuous Outcome", parent: "goal-predict", x: nodeSpacing * 2 - 110 },
    { id: "predict-categorical", label: "Categorical Outcome", parent: "goal-predict", x: nodeSpacing * 2 + 110 },
  ];

  predictOutcomes.forEach((outcome) => {
    nodes.push({
      id: outcome.id,
      type: "decisionNode",
      position: { x: outcome.x, y: layerGap * 2 },
      data: { label: outcome.label },
    });
    edges.push({
      id: `${outcome.parent}-to-${outcome.id}`,
      source: outcome.parent,
      target: outcome.id,
      style: edgeStyle,
    });
  });

  // Time branch - under goal-time (x=660)
  const timeTypes = [
    { id: "time-series", label: "Time Series", parent: "goal-time", x: nodeSpacing * 3 - 110 },
    { id: "survival", label: "Survival/Event", parent: "goal-time", x: nodeSpacing * 3 + 110 },
  ];

  timeTypes.forEach((type) => {
    nodes.push({
      id: type.id,
      type: "decisionNode",
      position: { x: type.x, y: layerGap * 2 },
      data: { label: type.label },
    });
    edges.push({
      id: `${type.parent}-to-${type.id}`,
      source: type.parent,
      target: type.id,
      style: edgeStyle,
    });
  });

  // Unsupervised branch - under goal-unsupervised (x=880)
  const unsupervisedTypes = [
    { id: "clustering", label: "Clustering", parent: "goal-unsupervised", x: nodeSpacing * 4 - 110 },
    { id: "dimension", label: "Dimension Reduction", parent: "goal-unsupervised", x: nodeSpacing * 4 + 110 },
  ];

  unsupervisedTypes.forEach((type) => {
    nodes.push({
      id: type.id,
      type: "decisionNode",
      position: { x: type.x, y: layerGap * 2 },
      data: { label: type.label },
    });
    edges.push({
      id: `${type.parent}-to-${type.id}`,
      source: type.parent,
      target: type.id,
      style: edgeStyle,
    });
  });

  // Layer 3: Sample Structure / Assumptions
  // Compare continuous -> sample structure (under compare-continuous at x=-110)
  const compareContinuousStructure = [
    { id: "compare-independent", label: "Independent Samples", parent: "compare-continuous", x: -280 },
    { id: "compare-paired", label: "Paired/Matched", parent: "compare-continuous", x: -110 },
    { id: "compare-repeated", label: "Repeated Measures", parent: "compare-continuous", x: 60 },
  ];

  compareContinuousStructure.forEach((structure) => {
    nodes.push({
      id: structure.id,
      type: "decisionNode",
      position: { x: structure.x, y: layerGap * 3 },
      data: { label: structure.label },
    });
    edges.push({
      id: `compare-continuous-to-${structure.id}`,
      source: "compare-continuous",
      target: structure.id,
      style: edgeStyle,
    });
  });

  // Relationship -> correlation types (under relationship-type at x=220)
  const correlationTypes = [
    { id: "corr-parametric", label: "Parametric", parent: "relationship-type", x: nodeSpacing - 60 },
    { id: "corr-nonparametric", label: "Non-parametric", parent: "relationship-type", x: nodeSpacing + 110 },
  ];

  correlationTypes.forEach((type) => {
    nodes.push({
      id: type.id,
      type: "decisionNode",
      position: { x: type.x, y: layerGap * 3 },
      data: { label: type.label },
    });
    edges.push({
      id: `relationship-type-to-${type.id}`,
      source: "relationship-type",
      target: type.id,
      style: edgeStyle,
    });
  });

  // Predict continuous -> regression types (under predict-continuous at x=330)
  const regressionTypes = [
    { id: "reg-linear", label: "Linear Models", parent: "predict-continuous", x: nodeSpacing * 2 - 170 },
    { id: "reg-regularized", label: "Regularized", parent: "predict-continuous", x: nodeSpacing * 2 },
  ];

  regressionTypes.forEach((type) => {
    nodes.push({
      id: type.id,
      type: "decisionNode",
      position: { x: type.x, y: layerGap * 3 },
      data: { label: type.label },
    });
    edges.push({
      id: `predict-continuous-to-${type.id}`,
      source: "predict-continuous",
      target: type.id,
      style: edgeStyle,
    });
  });

  // Predict categorical -> classification types (under predict-categorical at x=550)
  const classificationTypes = [
    { id: "class-traditional", label: "Traditional", parent: "predict-categorical", x: nodeSpacing * 2 + 170 },
    { id: "class-ml", label: "Machine Learning", parent: "predict-categorical", x: nodeSpacing * 2 + 340 },
  ];

  classificationTypes.forEach((type) => {
    nodes.push({
      id: type.id,
      type: "decisionNode",
      position: { x: type.x, y: layerGap * 3 },
      data: { label: type.label },
    });
    edges.push({
      id: `predict-categorical-to-${type.id}`,
      source: "predict-categorical",
      target: type.id,
      style: edgeStyle,
    });
  });

  // Layer 4: Assumptions (parametric vs non-parametric for comparison)
  const comparisonAssumptions = [
    { id: "ind-parametric", label: "Parametric", parent: "compare-independent", x: -360 },
    { id: "ind-nonparametric", label: "Non-parametric", parent: "compare-independent", x: -190 },
    { id: "paired-parametric", label: "Parametric", parent: "compare-paired", x: -110 },
    { id: "paired-nonparametric", label: "Non-parametric", parent: "compare-paired", x: 60 },
  ];

  comparisonAssumptions.forEach((assumption) => {
    nodes.push({
      id: assumption.id,
      type: "decisionNode",
      position: { x: assumption.x, y: layerGap * 4 },
      data: { label: assumption.label },
    });
    edges.push({
      id: `${assumption.parent}-to-${assumption.id}`,
      source: assumption.parent,
      target: assumption.id,
      style: edgeStyle,
    });
  });

  // Layer 5: Final Test Nodes
  const testNodeY = layerGap * 5;
  
  // Test nodes with proper spacing (nodes are ~160px wide, so space them 200px apart minimum)
  const testNodes = [
    // Independent parametric
    { id: "test-ttest", label: "t-Test / ANOVA", testIds: ["t-test-independent", "one-way-anova", "two-way-anova", "welch-t-test", "welch-anova"], parent: "ind-parametric", x: -360 },
    // Independent non-parametric
    { id: "test-mann-whitney", label: "Mann-Whitney / Kruskal-Wallis", testIds: ["mann-whitney", "kruskal-wallis", "brown-forsythe"], parent: "ind-nonparametric", x: -190 },
    // Paired parametric
    { id: "test-paired-t", label: "Paired t-Test", testIds: ["paired-t-test", "repeated-measures-anova"], parent: "paired-parametric", x: -110 },
    // Paired non-parametric
    { id: "test-wilcoxon", label: "Wilcoxon / Friedman", testIds: ["wilcoxon-signed-rank", "friedman-test"], parent: "paired-nonparametric", x: 60 },
    // Repeated measures
    { id: "test-repeated", label: "Mixed Models", testIds: ["linear-mixed-model", "glmm", "repeated-measures-anova"], parent: "compare-repeated", x: 60 },
    // Categorical comparison
    { id: "test-chi-square", label: "Chi-Square Tests", testIds: ["chi-square", "fisher-exact", "mcnemar-test", "cochran-q"], parent: "compare-categorical", x: 110 },

    // Correlation tests
    { id: "test-pearson", label: "Pearson / Partial", testIds: ["pearson-correlation", "partial-correlation", "point-biserial", "intraclass-correlation"], parent: "corr-parametric", x: nodeSpacing - 60 },
    { id: "test-spearman", label: "Spearman / Kendall", testIds: ["spearman-correlation", "kendall-tau"], parent: "corr-nonparametric", x: nodeSpacing + 110 },

    // Regression tests
    { id: "test-linear-reg", label: "Linear Regression", testIds: ["linear-regression", "multiple-regression", "robust-regression"], parent: "reg-linear", x: nodeSpacing * 2 - 170 },
    { id: "test-regularized", label: "Lasso / Ridge / Elastic Net", testIds: ["lasso-ridge", "elastic-net"], parent: "reg-regularized", x: nodeSpacing * 2 },

    // Classification tests
    { id: "test-logistic", label: "Logistic / Ordinal", testIds: ["logistic-regression", "ordinal-regression", "probit-regression"], parent: "class-traditional", x: nodeSpacing * 2 + 170 },
    { id: "test-ml-class", label: "ML Classifiers", testIds: ["random-forest", "svm", "xgboost", "lightgbm", "catboost", "knn", "naive-bayes", "decision-tree", "neural-network-mlp"], parent: "class-ml", x: nodeSpacing * 2 + 340 },

    // Time series tests
    { id: "test-timeseries", label: "ARIMA / Prophet", testIds: ["arima", "exponential-smoothing", "prophet", "var", "granger-causality"], parent: "time-series", x: nodeSpacing * 3 - 110 },
    
    // Survival tests
    { id: "test-survival", label: "Survival Analysis", testIds: ["kaplan-meier", "log-rank-test", "cox-regression", "accelerated-failure-time", "competing-risks", "random-survival-forest"], parent: "survival", x: nodeSpacing * 3 + 110 },

    // Clustering tests
    { id: "test-clustering", label: "Clustering Methods", testIds: ["kmeans", "hierarchical-clustering", "dbscan", "gaussian-mixture"], parent: "clustering", x: nodeSpacing * 4 - 110 },

    // Dimension reduction tests
    { id: "test-dimension", label: "PCA / Factor Analysis", testIds: ["pca", "factor-analysis", "tsne", "umap"], parent: "dimension", x: nodeSpacing * 4 + 110 },

    // Planning tests (directly from goal)
    { id: "test-planning", label: "Power & Sample Size", testIds: ["power-analysis"], parent: "goal-planning", x: nodeSpacing * 5 },
  ];

  testNodes.forEach((testNode) => {
    nodes.push({
      id: testNode.id,
      type: "testNode",
      position: { x: testNode.x, y: testNodeY },
      data: {
        label: testNode.label,
        testIds: testNode.testIds,
        category: testNode.label,
      },
    });
    edges.push({
      id: `${testNode.parent}-to-${testNode.id}`,
      source: testNode.parent,
      target: testNode.id,
      style: { ...edgeStyle, stroke: "hsl(var(--primary))" },
    });
  });

  // Supplementary test nodes (connected to multiple parents via dashed lines)
  const supplementaryY = testNodeY + 140;
  
  const supplementaryNodes = [
    { id: "test-assumptions", label: "Assumption Tests", testIds: ["levene-test", "shapiro-wilk", "bartlett-test", "kolmogorov-smirnov", "anderson-darling", "durbin-watson", "vif", "fligner-killeen"], x: -200 },
    { id: "test-posthoc", label: "Post-hoc Tests", testIds: ["tukey-hsd", "bonferroni", "holm-bonferroni", "dunnett-test", "games-howell", "scheffe-test", "dunn-test", "benjamini-hochberg"], x: 20 },
    { id: "test-effect", label: "Effect Sizes", testIds: ["cohens-d", "hedges-g", "eta-squared", "odds-ratio", "cramers-v", "cohens-kappa", "fleiss-kappa"], x: 240 },
    { id: "test-bayesian", label: "Bayesian Methods", testIds: ["bayesian-t-test", "bayesian-regression", "bayesian-anova"], x: 460 },
    { id: "test-resampling", label: "Resampling", testIds: ["bootstrap", "permutation-test"], x: 680 },
  ];

  supplementaryNodes.forEach((node) => {
    nodes.push({
      id: node.id,
      type: "testNode",
      position: { x: node.x, y: supplementaryY },
      data: {
        label: node.label,
        testIds: node.testIds,
        category: node.label,
      },
    });
  });

  // Add dashed edges from comparison tests to supplementary nodes
  edges.push(
    { id: "ttest-to-assumptions", source: "test-ttest", target: "test-assumptions", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "ttest-to-posthoc", source: "test-ttest", target: "test-posthoc", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "ttest-to-effect", source: "test-ttest", target: "test-effect", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "mann-whitney-to-effect", source: "test-mann-whitney", target: "test-effect", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "pearson-to-effect", source: "test-pearson", target: "test-effect", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "linear-reg-to-assumptions", source: "test-linear-reg", target: "test-assumptions", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "linear-reg-to-bayesian", source: "test-linear-reg", target: "test-bayesian", style: { ...edgeStyle, strokeDasharray: "5,5" } },
    { id: "ml-to-resampling", source: "test-ml-class", target: "test-resampling", style: { ...edgeStyle, strokeDasharray: "5,5" } },
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
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-home">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Decision Flowchart</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/wizard">
              <Button variant="outline" size="sm" data-testid="button-wizard-nav">
                Use Wizard
              </Button>
            </Link>
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
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            className="!bg-background !border !shadow-md"
            showInteractive={false}
          />
          <MiniMap 
            className="!bg-background !border !shadow-md"
            nodeColor={(node) => {
              if (node.type === "startNode") return "hsl(var(--primary))";
              if (node.type === "testNode") return "hsl(var(--primary) / 0.3)";
              return "hsl(var(--muted))";
            }}
            maskColor="hsl(var(--background) / 0.8)"
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />
        </ReactFlow>

        <div className="absolute bottom-4 left-4 bg-background/95 border rounded-md p-3 shadow-sm text-xs text-muted-foreground max-w-xs">
          <p className="font-medium text-foreground mb-1">How to use:</p>
          <ul className="space-y-1">
            <li>- Follow the decision path from top to bottom</li>
            <li>- Click colored test nodes to view details</li>
            <li>- Dashed lines show related supplementary tests</li>
            <li>- Use scroll wheel to zoom, drag to pan</li>
          </ul>
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
