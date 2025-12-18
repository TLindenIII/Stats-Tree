import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "@/lib/OfflineLink";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Route, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, RotateCcw, ChevronRight, ExternalLink, GitCompare, Code } from "lucide-react";
import { statisticalTests, StatTest, getWikipediaUrl } from "@/lib/statsData";
import { useWizardContext } from "@/contexts/WizardContext";
import { CompareSheet } from "@/components/CompareSheet";
import { NavLinks } from "@/components/NavLinks";

interface FlowNode {
  id: string;
  label: string;
  parentId: string | null;
  type: "start" | "decision" | "test";
  testIds?: string[];
}

const flowchartNodes: FlowNode[] = [
  { id: "start", label: "What is your research goal?", parentId: null, type: "start" },
  
  { id: "goal-estimate", label: "Estimate a Parameter", parentId: "start", type: "decision" },
  { id: "goal-compare", label: "Compare Groups", parentId: "start", type: "decision" },
  { id: "goal-relationship", label: "Assess Relationships", parentId: "start", type: "decision" },
  { id: "goal-predict", label: "Predict Outcomes", parentId: "start", type: "decision" },
  { id: "goal-independence", label: "Test Independence", parentId: "start", type: "decision" },
  { id: "goal-time", label: "Time/Sequential", parentId: "start", type: "decision" },
  { id: "goal-unsupervised", label: "Discover Patterns", parentId: "start", type: "decision" },
  { id: "goal-planning", label: "Study Planning", parentId: "start", type: "decision" },
  
  { id: "estimate-continuous", label: "Continuous", parentId: "goal-estimate", type: "decision" },
  { id: "estimate-binary", label: "Binary", parentId: "goal-estimate", type: "decision" },
  
  { id: "compare-continuous", label: "Continuous", parentId: "goal-compare", type: "decision" },
  { id: "compare-categorical", label: "Categorical", parentId: "goal-compare", type: "decision" },
  
  { id: "relationship-continuous", label: "Continuous", parentId: "goal-relationship", type: "decision" },
  { id: "relationship-ordinal", label: "Ordinal", parentId: "goal-relationship", type: "decision" },
  
  { id: "predict-continuous", label: "Continuous", parentId: "goal-predict", type: "decision" },
  { id: "predict-categorical", label: "Categorical", parentId: "goal-predict", type: "decision" },
  
  { id: "independence-categorical", label: "Categorical Data", parentId: "goal-independence", type: "decision" },
  
  { id: "time-series", label: "Time Series", parentId: "goal-time", type: "decision" },
  { id: "survival", label: "Survival/Event", parentId: "goal-time", type: "decision" },
  
  { id: "clustering", label: "Clustering", parentId: "goal-unsupervised", type: "decision" },
  { id: "dimension", label: "Dimension Reduction", parentId: "goal-unsupervised", type: "decision" },
  
  { id: "est-cont-independent", label: "Independent Samples", parentId: "estimate-continuous", type: "decision" },
  { id: "est-cont-paired", label: "Paired Samples", parentId: "estimate-continuous", type: "decision" },
  
  { id: "compare-independent", label: "Independent Samples", parentId: "compare-continuous", type: "decision" },
  { id: "compare-paired", label: "Paired/Matched", parentId: "compare-continuous", type: "decision" },
  { id: "compare-repeated", label: "Repeated Measures", parentId: "compare-continuous", type: "decision" },
  
  { id: "rel-cont-parametric", label: "Parametric", parentId: "relationship-continuous", type: "decision" },
  { id: "rel-cont-nonparametric", label: "Non-parametric", parentId: "relationship-continuous", type: "decision" },
  
  { id: "predict-cont-linear", label: "Linear Models", parentId: "predict-continuous", type: "decision" },
  { id: "predict-cont-regularized", label: "Regularized", parentId: "predict-continuous", type: "decision" },
  
  { id: "predict-cat-traditional", label: "Traditional", parentId: "predict-categorical", type: "decision" },
  { id: "predict-cat-ml", label: "Machine Learning", parentId: "predict-categorical", type: "decision" },
  
  { id: "est-ind-parametric", label: "Parametric", parentId: "est-cont-independent", type: "decision" },
  { id: "est-ind-nonparametric", label: "Non-parametric", parentId: "est-cont-independent", type: "decision" },
  
  { id: "est-paired-parametric", label: "Parametric", parentId: "est-cont-paired", type: "decision" },
  { id: "est-paired-nonparametric", label: "Non-parametric", parentId: "est-cont-paired", type: "decision" },
  
  { id: "ind-parametric", label: "Parametric", parentId: "compare-independent", type: "decision" },
  { id: "ind-nonparametric", label: "Non-parametric", parentId: "compare-independent", type: "decision" },
  { id: "paired-parametric", label: "Parametric", parentId: "compare-paired", type: "decision" },
  { id: "paired-nonparametric", label: "Non-parametric", parentId: "compare-paired", type: "decision" },
  
  { id: "test-est-ind-param", label: "t-Test / CI", parentId: "est-ind-parametric", type: "test", testIds: ["t-test-independent", "cohens-d", "hedges-g"] },
  { id: "test-est-ind-nonparam", label: "Bootstrap / Permutation", parentId: "est-ind-nonparametric", type: "test", testIds: ["bootstrap", "permutation-test", "mann-whitney"] },
  { id: "test-est-paired-param", label: "Paired t-Test", parentId: "est-paired-parametric", type: "test", testIds: ["paired-t-test", "cohens-d"] },
  { id: "test-est-paired-nonparam", label: "Wilcoxon / Bootstrap", parentId: "est-paired-nonparametric", type: "test", testIds: ["wilcoxon-signed-rank", "bootstrap"] },
  { id: "test-est-binary", label: "Proportions / Odds", parentId: "estimate-binary", type: "test", testIds: ["chi-square", "fisher-exact", "odds-ratio"] },
  
  { id: "test-ttest", label: "t-Test / ANOVA", parentId: "ind-parametric", type: "test", testIds: ["t-test-independent", "one-way-anova", "two-way-anova", "welch-t-test", "welch-anova"] },
  { id: "test-mann-whitney", label: "Mann-Whitney / Kruskal-Wallis", parentId: "ind-nonparametric", type: "test", testIds: ["mann-whitney", "kruskal-wallis", "permutation-test"] },
  { id: "test-paired-t", label: "Paired t-Test", parentId: "paired-parametric", type: "test", testIds: ["paired-t-test", "repeated-measures-anova"] },
  { id: "test-wilcoxon", label: "Wilcoxon / Friedman", parentId: "paired-nonparametric", type: "test", testIds: ["wilcoxon-signed-rank", "friedman-test"] },
  { id: "test-repeated", label: "Mixed Models", parentId: "compare-repeated", type: "test", testIds: ["linear-mixed-model", "glmm", "repeated-measures-anova"] },
  { id: "test-chi-square", label: "Chi-Square Tests", parentId: "compare-categorical", type: "test", testIds: ["chi-square", "fisher-exact", "mcnemar-test", "cochran-q"] },
  
  { id: "test-pearson", label: "Pearson / Partial", parentId: "rel-cont-parametric", type: "test", testIds: ["pearson-correlation", "partial-correlation", "point-biserial", "intraclass-correlation"] },
  { id: "test-spearman", label: "Spearman / Kendall", parentId: "rel-cont-nonparametric", type: "test", testIds: ["spearman-correlation", "kendall-tau"] },
  { id: "test-ordinal-corr", label: "Rank Correlations", parentId: "relationship-ordinal", type: "test", testIds: ["spearman-correlation", "kendall-tau"] },
  
  { id: "test-linear-reg", label: "Linear Regression", parentId: "predict-cont-linear", type: "test", testIds: ["linear-regression", "multiple-regression", "robust-regression"] },
  { id: "test-regularized", label: "Lasso / Ridge / Elastic Net", parentId: "predict-cont-regularized", type: "test", testIds: ["lasso-ridge", "elastic-net"] },
  { id: "test-logistic", label: "Logistic / Ordinal", parentId: "predict-cat-traditional", type: "test", testIds: ["logistic-regression", "ordinal-regression", "probit-regression"] },
  { id: "test-ml-class", label: "ML Classifiers", parentId: "predict-cat-ml", type: "test", testIds: ["random-forest", "svm", "xgboost", "knn", "naive-bayes", "decision-tree", "neural-network-mlp"] },
  
  { id: "test-independence", label: "Chi-Square / Fisher", parentId: "independence-categorical", type: "test", testIds: ["chi-square", "fisher-exact", "cramers-v", "cohens-kappa"] },
  
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

function TestDetailPanel({ tests, open, onClose, onCompareClick }: { tests: StatTest[]; open: boolean; onClose: () => void; onCompareClick: (currentTest: StatTest, altId: string) => void }) {
  const [, setLocation] = useLocation();
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden" data-testid="flowchart-test-detail">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Route className="w-5 h-5 text-primary" />
            {tests.length === 1 ? tests[0].name : `${tests.length} Related Tests`}
          </DialogTitle>
          <DialogDescription>
            {tests.length === 1 
              ? tests[0].description 
              : "Click on a test to view details or use the wizard for recommendations."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-140px)]">
          <div className="p-6 space-y-6">
            {tests.map((test) => (
              <div key={test.id} className="space-y-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <h3 className="font-semibold font-mono text-base">{test.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                  <div className="flex gap-3 mt-2 flex-wrap items-center">
                    <Badge variant="outline">{test.category}</Badge>
                    {test.outcomeScale && (
                      <span className="text-xs text-muted-foreground"><strong>Outcome:</strong> {test.outcomeScale}</span>
                    )}
                    {test.design && (
                      <span className="text-xs text-muted-foreground"><strong>Design:</strong> {test.design}</span>
                    )}
                    {getWikipediaUrl(test.id) && (
                      <a
                        href={getWikipediaUrl(test.id)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        data-testid={`link-learn-more-${test.id}`}
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
                    {[...test.assumptions].sort((a, b) => a.localeCompare(b)).map((a, i) => (
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
                    {[...test.whenToUse].sort((a, b) => a.localeCompare(b)).map((w, i) => (
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
                              onClick={() => onCompareClick(test, altId)}
                              data-testid={`alt-link-${altId}`}
                            >
                              <GitCompare className="w-3 h-3 mr-1" />
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
                
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Code Examples
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium mb-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Python</Badge>
                      </h5>
                      <pre className="bg-background p-2 rounded text-[10px] overflow-x-auto">
                        <code className="text-muted-foreground">{test.pythonCode || `# Python code example coming soon`}</code>
                      </pre>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium mb-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">R</Badge>
                      </h5>
                      <pre className="bg-background p-2 rounded text-[10px] overflow-x-auto">
                        <code className="text-muted-foreground">{test.rCode || `# R code example coming soon`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
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
      </DialogContent>
    </Dialog>
  );
}

function getChildren(parentId: string): FlowNode[] {
  return flowchartNodes.filter(n => n.parentId === parentId);
}

function FlowchartInner() {
  const { selections, addSelection, removeSelectionsAfter, clearSelections } = useWizardContext();
  const [selectedTests, setSelectedTests] = useState<StatTest[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [compareTests, setCompareTests] = useState<StatTest[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [currentBaseTest, setCurrentBaseTest] = useState<StatTest | null>(null);
  const [alternativesList, setAlternativesList] = useState<string[]>([]);
  const [currentAltIndex, setCurrentAltIndex] = useState(0);
  const { fitView } = useReactFlow();

  const handleCompareClick = (currentTest: StatTest, altId: string) => {
    const altTest = statisticalTests.find(t => t.id === altId);
    if (altTest) {
      const alternatives = currentTest.alternativeLinks || [];
      const altIndex = alternatives.indexOf(altId);
      
      setCurrentBaseTest(currentTest);
      setAlternativesList(alternatives);
      setCurrentAltIndex(altIndex >= 0 ? altIndex : 0);
      setCompareTests([currentTest, altTest]);
      setShowCompare(true);
    }
  };

  const handlePrevAlt = () => {
    if (currentAltIndex > 0 && currentBaseTest) {
      const newIndex = currentAltIndex - 1;
      const altTest = statisticalTests.find(t => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const handleNextAlt = () => {
    if (currentAltIndex < alternativesList.length - 1 && currentBaseTest) {
      const newIndex = currentAltIndex + 1;
      const altTest = statisticalTests.find(t => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const removeFromCompare = (testId: string) => {
    const updated = compareTests.filter(t => t.id !== testId);
    setCompareTests(updated);
    if (updated.length === 0) {
      setShowCompare(false);
    }
  };

  const selectedIds = useMemo(() => selections.map(s => s.nodeId), [selections]);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const nodeWidth = 200;
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

    const getLayerForNode = (nodeId: string, depth = 0): number => {
      const node = flowchartNodes.find(n => n.id === nodeId);
      if (!node || !node.parentId) return depth;
      return getLayerForNode(node.parentId, depth + 1);
    };

    const nodePositions: Map<string, { x: number; y: number }> = new Map();
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const positionNode = (nodeId: string, parentX: number, siblingIndex: number, siblingCount: number): void => {
      const node = flowchartNodes.find(n => n.id === nodeId);
      if (!node || !nodesToShow.has(nodeId)) return;

      const layer = getLayerForNode(nodeId);
      const y = layer * layerGap;
      
      let x: number;
      if (!node.parentId) {
        x = 0;
      } else {
        const spreadWidth = (siblingCount - 1) * nodeWidth;
        const startX = parentX - spreadWidth / 2;
        x = startX + siblingIndex * nodeWidth;
      }

      nodePositions.set(nodeId, { x, y });

      const isSelected = selectedIds.includes(nodeId);
      const hasChildren = getChildren(nodeId).length > 0;

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
        const isOnSelectedPath = selectedIds.includes(nodeId) || selectedIds.includes(node.parentId);
        edges.push({
          id: `${node.parentId}-to-${nodeId}`,
          source: node.parentId,
          target: nodeId,
          style: isOnSelectedPath ? selectedEdgeStyle : edgeStyle,
          animated: node.type === "test",
        });
      }

      const visibleChildren = getChildren(nodeId).filter(c => nodesToShow.has(c.id));
      visibleChildren.forEach((child, i) => {
        positionNode(child.id, x, i, visibleChildren.length);
      });
    };

    positionNode("start", 0, 0, 1);

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
            <Route className="w-5 h-5 text-primary" />
            <span>StatsTree</span>
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
            <NavLinks currentPage="flowchart" />
            <ThemeToggle />
          </div>
        </div>
        
        {selections.length > 0 && (
          <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Path:</span>
            {selections.map((sel, i) => (
              <div key={sel.nodeId} className="flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    removeSelectionsAfter(i + 1);
                  }}
                  data-testid={`path-step-${sel.nodeId}`}
                >
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
        onCompareClick={handleCompareClick}
      />

      <CompareSheet
        tests={compareTests}
        open={showCompare}
        onClose={() => setShowCompare(false)}
        onRemoveTest={removeFromCompare}
        onPrev={handlePrevAlt}
        onNext={handleNextAlt}
        hasPrev={currentAltIndex > 0}
        hasNext={currentAltIndex < alternativesList.length - 1}
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
