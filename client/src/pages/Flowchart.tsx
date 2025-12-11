import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
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
import { BarChart3, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, RotateCcw, ChevronRight } from "lucide-react";
import { statisticalTests, StatTest } from "@/lib/statsData";
import { useWizardContext } from "@/contexts/WizardContext";

interface FlowNode {
  id: string;
  label: string;
  parentId: string | null;
  type: "start" | "decision" | "test";
  testIds?: string[];
}

const flowchartNodes: FlowNode[] = [
  { id: "start", label: "What is your research goal?", parentId: null, type: "start" },
  
  { id: "goal-compare", label: "Compare Groups", parentId: "start", type: "decision" },
  { id: "goal-relationship", label: "Assess Relationships", parentId: "start", type: "decision" },
  { id: "goal-predict", label: "Predict Outcomes", parentId: "start", type: "decision" },
  { id: "goal-time", label: "Time/Sequential", parentId: "start", type: "decision" },
  { id: "goal-unsupervised", label: "Discover Patterns", parentId: "start", type: "decision" },
  { id: "goal-planning", label: "Study Planning", parentId: "start", type: "decision" },
  
  { id: "compare-continuous", label: "Continuous Data", parentId: "goal-compare", type: "decision" },
  { id: "compare-categorical", label: "Categorical Data", parentId: "goal-compare", type: "decision" },
  
  { id: "relationship-type", label: "Variable Types", parentId: "goal-relationship", type: "decision" },
  
  { id: "predict-continuous", label: "Continuous Outcome", parentId: "goal-predict", type: "decision" },
  { id: "predict-categorical", label: "Categorical Outcome", parentId: "goal-predict", type: "decision" },
  
  { id: "time-series", label: "Time Series", parentId: "goal-time", type: "decision" },
  { id: "survival", label: "Survival/Event", parentId: "goal-time", type: "decision" },
  
  { id: "clustering", label: "Clustering", parentId: "goal-unsupervised", type: "decision" },
  { id: "dimension", label: "Dimension Reduction", parentId: "goal-unsupervised", type: "decision" },
  
  { id: "compare-independent", label: "Independent Samples", parentId: "compare-continuous", type: "decision" },
  { id: "compare-paired", label: "Paired/Matched", parentId: "compare-continuous", type: "decision" },
  { id: "compare-repeated", label: "Repeated Measures", parentId: "compare-continuous", type: "decision" },
  
  { id: "corr-parametric", label: "Parametric", parentId: "relationship-type", type: "decision" },
  { id: "corr-nonparametric", label: "Non-parametric", parentId: "relationship-type", type: "decision" },
  
  { id: "reg-linear", label: "Linear Models", parentId: "predict-continuous", type: "decision" },
  { id: "reg-regularized", label: "Regularized", parentId: "predict-continuous", type: "decision" },
  
  { id: "class-traditional", label: "Traditional", parentId: "predict-categorical", type: "decision" },
  { id: "class-ml", label: "Machine Learning", parentId: "predict-categorical", type: "decision" },
  
  { id: "ind-parametric", label: "Parametric", parentId: "compare-independent", type: "decision" },
  { id: "ind-nonparametric", label: "Non-parametric", parentId: "compare-independent", type: "decision" },
  { id: "paired-parametric", label: "Parametric", parentId: "compare-paired", type: "decision" },
  { id: "paired-nonparametric", label: "Non-parametric", parentId: "compare-paired", type: "decision" },
  
  { id: "test-ttest", label: "t-Test / ANOVA", parentId: "ind-parametric", type: "test", testIds: ["t-test-independent", "one-way-anova", "two-way-anova", "welch-t-test", "welch-anova"] },
  { id: "test-mann-whitney", label: "Mann-Whitney / Kruskal-Wallis", parentId: "ind-nonparametric", type: "test", testIds: ["mann-whitney", "kruskal-wallis", "brown-forsythe"] },
  { id: "test-paired-t", label: "Paired t-Test", parentId: "paired-parametric", type: "test", testIds: ["paired-t-test", "repeated-measures-anova"] },
  { id: "test-wilcoxon", label: "Wilcoxon / Friedman", parentId: "paired-nonparametric", type: "test", testIds: ["wilcoxon-signed-rank", "friedman-test"] },
  { id: "test-repeated", label: "Mixed Models", parentId: "compare-repeated", type: "test", testIds: ["linear-mixed-model", "glmm", "repeated-measures-anova"] },
  { id: "test-chi-square", label: "Chi-Square Tests", parentId: "compare-categorical", type: "test", testIds: ["chi-square", "fisher-exact", "mcnemar-test", "cochran-q"] },
  { id: "test-pearson", label: "Pearson / Partial", parentId: "corr-parametric", type: "test", testIds: ["pearson-correlation", "partial-correlation", "point-biserial", "intraclass-correlation"] },
  { id: "test-spearman", label: "Spearman / Kendall", parentId: "corr-nonparametric", type: "test", testIds: ["spearman-correlation", "kendall-tau"] },
  { id: "test-linear-reg", label: "Linear Regression", parentId: "reg-linear", type: "test", testIds: ["linear-regression", "multiple-regression", "robust-regression"] },
  { id: "test-regularized", label: "Lasso / Ridge / Elastic Net", parentId: "reg-regularized", type: "test", testIds: ["lasso-ridge", "elastic-net"] },
  { id: "test-logistic", label: "Logistic / Ordinal", parentId: "class-traditional", type: "test", testIds: ["logistic-regression", "ordinal-regression", "probit-regression"] },
  { id: "test-ml-class", label: "ML Classifiers", parentId: "class-ml", type: "test", testIds: ["random-forest", "svm", "xgboost", "lightgbm", "catboost", "knn", "naive-bayes", "decision-tree", "neural-network-mlp"] },
  { id: "test-timeseries", label: "ARIMA / Prophet", parentId: "time-series", type: "test", testIds: ["arima", "exponential-smoothing", "prophet", "var", "granger-causality"] },
  { id: "test-survival", label: "Survival Analysis", parentId: "survival", type: "test", testIds: ["kaplan-meier", "log-rank-test", "cox-regression", "accelerated-failure-time", "competing-risks", "random-survival-forest"] },
  { id: "test-clustering", label: "Clustering Methods", parentId: "clustering", type: "test", testIds: ["kmeans", "hierarchical-clustering", "dbscan", "gaussian-mixture"] },
  { id: "test-dimension", label: "PCA / Factor Analysis", parentId: "dimension", type: "test", testIds: ["pca", "factor-analysis", "tsne", "umap"] },
  { id: "test-planning", label: "Power & Sample Size", parentId: "goal-planning", type: "test", testIds: ["power-analysis"] },
];

function DecisionNode({ data, selected }: { data: { label: string; isSelected: boolean; hasChildren: boolean }; selected?: boolean }) {
  const isHighlighted = data.isSelected;
  return (
    <div 
      className={`px-4 py-3 rounded-md border shadow-sm min-w-[140px] max-w-[180px] cursor-pointer transition-all duration-200 ${
        isHighlighted 
          ? "bg-primary/20 border-primary ring-2 ring-primary/30" 
          : "bg-card hover-elevate"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs font-medium text-card-foreground text-center">{data.label}</span>
        {data.hasChildren && !isHighlighted && (
          <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </div>
  );
}

function TestNode({ data, onClick }: { data: { label: string; testIds: string[] }; onClick?: () => void }) {
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

function TestDetailPanel({ tests, open, onClose, onAlternativeClick }: { tests: StatTest[]; open: boolean; onClose: () => void; onAlternativeClick: (testId: string) => void }) {
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
                
                {((test.alternativeLinks && test.alternativeLinks.length > 0) || test.alternatives.length > 0) && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {test.alternativeLinks && test.alternativeLinks.length > 0 ? (
                        test.alternativeLinks.map((altId) => {
                          const altTest = statisticalTests.find(t => t.id === altId);
                          if (!altTest) {
                            return (
                              <Badge key={altId} variant="secondary">
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
                        })
                      ) : (
                        test.alternatives.map((alt, i) => (
                          <Badge key={i} variant="secondary">{alt}</Badge>
                        ))
                      )}
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

function getChildren(parentId: string): FlowNode[] {
  return flowchartNodes.filter(n => n.parentId === parentId);
}

function FlowchartInner() {
  const { selections, addSelection, removeSelectionsAfter, clearSelections } = useWizardContext();
  const [selectedTests, setSelectedTests] = useState<StatTest[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const { fitView } = useReactFlow();

  const selectedIds = useMemo(() => selections.map(s => s.nodeId), [selections]);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const nodeWidth = 180;
    const layerGap = 140;
    const edgeStyle = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 };
    const selectedEdgeStyle = { stroke: "hsl(var(--primary))", strokeWidth: 2.5 };

    const nodesToShow = new Set<string>(["start"]);
    const startChildren = getChildren("start");
    startChildren.forEach(c => nodesToShow.add(c.id));

    selectedIds.forEach(id => {
      nodesToShow.add(id);
      const children = getChildren(id);
      children.forEach(c => nodesToShow.add(c.id));
    });

    const nodesByLayer: Map<number, FlowNode[]> = new Map();
    
    const getLayerForNode = (nodeId: string, depth = 0): number => {
      const node = flowchartNodes.find(n => n.id === nodeId);
      if (!node || !node.parentId) return depth;
      return getLayerForNode(node.parentId, depth + 1);
    };

    flowchartNodes.forEach(node => {
      if (nodesToShow.has(node.id)) {
        const layer = getLayerForNode(node.id);
        if (!nodesByLayer.has(layer)) nodesByLayer.set(layer, []);
        nodesByLayer.get(layer)!.push(node);
      }
    });

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    nodesByLayer.forEach((layerNodes, layer) => {
      const totalWidth = (layerNodes.length - 1) * nodeWidth;
      const startX = -totalWidth / 2;

      layerNodes.forEach((node, i) => {
        const x = startX + i * nodeWidth;
        const y = layer * layerGap;
        const isSelected = selectedIds.includes(node.id);
        const hasChildren = getChildren(node.id).length > 0;

        if (node.type === "start") {
          nodes.push({
            id: node.id,
            type: "startNode",
            position: { x, y },
            data: { label: node.label },
          });
        } else if (node.type === "test") {
          nodes.push({
            id: node.id,
            type: "testNode",
            position: { x, y },
            data: { label: node.label, testIds: node.testIds || [] },
          });
        } else {
          nodes.push({
            id: node.id,
            type: "decisionNode",
            position: { x, y },
            data: { label: node.label, isSelected, hasChildren },
          });
        }

        if (node.parentId && nodesToShow.has(node.parentId)) {
          const isOnSelectedPath = selectedIds.includes(node.id) || (node.parentId && selectedIds.includes(node.parentId));
          edges.push({
            id: `${node.parentId}-to-${node.id}`,
            source: node.parentId,
            target: node.id,
            style: isOnSelectedPath ? selectedEdgeStyle : edgeStyle,
            animated: node.type === "test",
          });
        }
      });
    });

    return { visibleNodes: nodes, visibleEdges: edges };
  }, [selectedIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(visibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(visibleEdges);

  useEffect(() => {
    setNodes(visibleNodes);
    setEdges(visibleEdges);
    setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50);
  }, [visibleNodes, visibleEdges, setNodes, setEdges, fitView]);

  const getNodeDepth = useCallback((nodeId: string, depth = 0): number => {
    const node = flowchartNodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return depth;
    return getNodeDepth(node.parentId, depth + 1);
  }, []);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === "startNode") return;
    
    if (node.type === "testNode") {
      const testIds = (node.data as any).testIds || [];
      const tests = testIds
        .map((id: string) => statisticalTests.find(t => t.id === id))
        .filter((t: StatTest | undefined): t is StatTest => t !== undefined);
      if (tests.length > 0) {
        setSelectedTests(tests);
        setDetailOpen(true);
      }
      return;
    }

    const flowNode = flowchartNodes.find(n => n.id === node.id);
    if (flowNode) {
      const clickedDepth = getNodeDepth(node.id);
      
      const selectionIndexAtDepth = selections.findIndex(sel => {
        return getNodeDepth(sel.nodeId) >= clickedDepth;
      });
      
      if (selectionIndexAtDepth >= 0) {
        removeSelectionsAfter(selectionIndexAtDepth);
      }
      
      addSelection(node.id, flowNode.label);
    }
  }, [addSelection, removeSelectionsAfter, selections, getNodeDepth]);

  const handleReset = useCallback(() => {
    clearSelections();
  }, [clearSelections]);

  const nodeTypes = useMemo(() => ({
    decisionNode: DecisionNode,
    testNode: (props: any) => (
      <TestNode 
        {...props} 
        onClick={() => handleNodeClick(null, props)}
      />
    ),
    startNode: StartNode,
  }), [handleNodeClick]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>StatGuide</span>
          </Link>
          <div className="flex items-center gap-2">
            {selections.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                data-testid="button-reset-flowchart"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Start Over
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wizard" data-testid="button-wizard-nav">
                Use Wizard
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        {selections.length > 0 && (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Path:</span>
            {selections.map((sel, i) => (
              <div key={sel.nodeId} className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {sel.label}
                </Badge>
                {i < selections.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Controls 
            className="!bg-background !border !shadow-md"
            showInteractive={false}
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
            <li>- Click on a choice to reveal the next level</li>
            <li>- Your path is shown in the header</li>
            <li>- Click colored test nodes to view details</li>
            <li>- Use "Start Over" to begin a new path</li>
          </ul>
        </div>
      </div>

      <TestDetailPanel 
        tests={selectedTests} 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)}
        onAlternativeClick={(testId) => {
          const test = statisticalTests.find(t => t.id === testId);
          if (test) {
            setSelectedTests([test]);
          }
        }}
      />
    </div>
  );
}

export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowchartInner />
    </ReactFlowProvider>
  );
}
