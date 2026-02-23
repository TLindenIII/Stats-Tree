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
import {
  DraftingCompass,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  GitCompare,
  Code,
  Target,
  Scale,
  TrendingUp,
  LineChart,
  Split,
  CalendarClock,
  Shapes,
  ClipboardList,
} from "lucide-react";
import { statisticalTests, StatTest } from "@/lib/statsData";
import { useWizardContext } from "@/contexts/WizardContext";
import { CompareSheet } from "@/components/CompareSheet";
import { NavLinks } from "@/components/NavLinks";
import { Header } from "@/components/Header";
import { CodeBlock } from "@/components/ui/CodeBlock";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone } from "lucide-react";

interface FlowNode {
  id: string;
  label: string;
  parentId: string | null;
  type: "start" | "decision" | "test";
  testIds?: string[];
}

// Also update the Start Screen icon mapping (snippet below).
const flowchartNodes: FlowNode[] = [
  // ── Root ─────────────────────────────────────────────────────────────
  { id: "start", label: "What is your research goal?", parentId: null, type: "start" },

  // ── Goal (matches wizard step: goal) ─────────────────────────────────
  {
    id: "goal-estimate",
    label: "Estimate a parameter (mean/proportion)",
    parentId: "start",
    type: "decision",
  },
  {
    id: "goal-compare_groups",
    label: "Compare groups (differences)",
    parentId: "start",
    type: "decision",
  },
  {
    id: "goal-association",
    label: "Measure association (correlation/relationship)",
    parentId: "start",
    type: "decision",
  },
  {
    id: "goal-categorical_association",
    label: "Categorical association / agreement",
    parentId: "start",
    type: "decision",
  },
  {
    id: "goal-model_with_predictors",
    label: "Model outcome with predictors",
    parentId: "start",
    type: "decision",
  },
  { id: "goal-unsupervised", label: "Unsupervised learning", parentId: "start", type: "decision" },
  { id: "goal-time_series", label: "Time series", parentId: "start", type: "decision" },
  { id: "goal-survival", label: "Survival / time-to-event", parentId: "start", type: "decision" },
  {
    id: "goal-power_planning",
    label: "Power / sample size planning",
    parentId: "start",
    type: "decision",
  },
  {
    id: "goal-diagnostics_posthoc_effectsize",
    label: "Diagnostics / post-hoc / corrections / effect sizes",
    parentId: "start",
    type: "decision",
  },

  // ── Estimate branch (steps: estimate_target → estimate_reference_mean) ─
  {
    id: "estimate_target",
    label: "What are you estimating?",
    parentId: "goal-estimate",
    type: "decision",
  },

  {
    id: "estimate_target-mean",
    label: "Mean of a single sample",
    parentId: "estimate_target",
    type: "decision",
  },
  {
    id: "estimate_reference_mean",
    label: "Test against a reference value (μ₀)?",
    parentId: "estimate_target-mean",
    type: "decision",
  },
  {
    id: "estimate_reference_mean-yes",
    label: "Yes",
    parentId: "estimate_reference_mean",
    type: "decision",
  },
  {
    id: "estimate_reference_mean-no",
    label: "No",
    parentId: "estimate_reference_mean",
    type: "decision",
  },
  {
    id: "leaf-est-mean-yes",
    label: "One-sample mean vs μ₀",
    parentId: "estimate_reference_mean-yes",
    type: "test",
    testIds: [
      "one-sample-t-test",
      "wilcoxon-signed-rank",
      "bootstrap",
      "permutation-test",
      "bayesian-t-test",
    ],
  },
  {
    id: "leaf-est-mean-no",
    label: "Estimate/CI only",
    parentId: "estimate_reference_mean-no",
    type: "test",
    testIds: ["one-sample-t-test", "bootstrap", "bayesian-t-test", "wilcoxon-signed-rank"],
  },

  {
    id: "estimate_target-prop",
    label: "Proportion / rate",
    parentId: "estimate_target",
    type: "decision",
  },
  {
    id: "leaf-est-prop",
    label: "Single proportion tests",
    parentId: "estimate_target-prop",
    type: "test",
    testIds: ["binomial-test", "one-proportion-z-test", "bootstrap"],
  },

  // ── Compare groups branch (steps: compare_outcome → compare_design_*) ──
  {
    id: "compare_outcome",
    label: "What is the outcome type?",
    parentId: "goal-compare_groups",
    type: "decision",
  },

  // Continuous outcome path
  {
    id: "compare_outcome-continuous",
    label: "Continuous / numeric",
    parentId: "compare_outcome",
    type: "decision",
  },
  {
    id: "compare_design_cont",
    label: "What is the design?",
    parentId: "compare_outcome-continuous",
    type: "decision",
  },

  {
    id: "compare_design_cont-independent",
    label: "Independent groups",
    parentId: "compare_design_cont",
    type: "decision",
  },
  {
    id: "compare_groups_n",
    label: "How many groups?",
    parentId: "compare_design_cont-independent",
    type: "decision",
  },
  {
    id: "compare_groups_n-2",
    label: "Two groups",
    parentId: "compare_groups_n",
    type: "decision",
  },
  {
    id: "leaf-cmp-cont-ind-2",
    label: "Two independent groups",
    parentId: "compare_groups_n-2",
    type: "test",
    testIds: [
      "welch-t-test",
      "t-test-independent",
      "mann-whitney",
      "bayesian-t-test",
      "bootstrap",
      "permutation-test",
    ],
  },
  {
    id: "compare_factors_3g",
    label: "3+ Groups (How many factors?)",
    parentId: "compare_groups_n",
    type: "decision",
  },
  {
    id: "compare_factors-1",
    label: "1 factor",
    parentId: "compare_factors_3g",
    type: "decision",
  },
  {
    id: "compare_factors-2",
    label: "2+ factors",
    parentId: "compare_factors_3g",
    type: "decision",
  },
  {
    id: "leaf-cmp-cont-ind-3-1factor",
    label: "1-way ANOVA & alternatives",
    parentId: "compare_factors-1",
    type: "test",
    testIds: [
      "one-way-anova",
      "welch-anova",
      "kruskal-wallis",
      "bayesian-anova",
      "bootstrap",
      "permutation-test",
    ],
  },
  {
    id: "leaf-cmp-cont-ind-3-2plus",
    label: "N-way ANOVA",
    parentId: "compare_factors-2",
    type: "test",
    testIds: ["two-way-anova", "ancova", "manova", "bayesian-anova"],
  },

  {
    id: "compare_design_cont-paired",
    label: "Paired / repeated measures",
    parentId: "compare_design_cont",
    type: "decision",
  },
  {
    id: "compare_conditions_n",
    label: "How many conditions/timepoints?",
    parentId: "compare_design_cont-paired",
    type: "decision",
  },
  {
    id: "compare_conditions_n-2",
    label: "2 conditions",
    parentId: "compare_conditions_n",
    type: "decision",
  },
  {
    id: "compare_conditions_n-3",
    label: "3+ conditions",
    parentId: "compare_conditions_n",
    type: "decision",
  },
  {
    id: "leaf-cmp-cont-paired-2",
    label: "Paired tests",
    parentId: "compare_conditions_n-2",
    type: "test",
    testIds: [
      "paired-t-test",
      "wilcoxon-signed-rank",
      "bayesian-t-test",
      "bootstrap",
      "permutation-test",
    ],
  },
  {
    id: "leaf-cmp-cont-repeated-3p",
    label: "Repeated measures tests",
    parentId: "compare_conditions_n-3",
    type: "test",
    testIds: [
      "repeated-measures-anova",
      "friedman-test",
      "linear-mixed-model",
      "bayesian-anova",
      "bootstrap",
      "permutation-test",
    ],
  },

  // Categorical outcome path
  {
    id: "compare_outcome-categorical",
    label: "Categorical (counts/proportions)",
    parentId: "compare_outcome",
    type: "decision",
  },
  {
    id: "compare_design_cat",
    label: "What is the design?",
    parentId: "compare_outcome-categorical",
    type: "decision",
  },

  {
    id: "compare_design_cat-independent",
    label: "Independent groups",
    parentId: "compare_design_cat",
    type: "decision",
  },
  {
    id: "cat_table_shape",
    label: "What best describes the table?",
    parentId: "compare_design_cat-independent",
    type: "decision",
  },
  {
    id: "cat_table_shape-2x2",
    label: "2x2 table",
    parentId: "cat_table_shape",
    type: "decision",
  },
  {
    id: "cat_table_shape-rxc",
    label: "rxc table (>2x2)",
    parentId: "cat_table_shape",
    type: "decision",
  },
  {
    id: "leaf-cmp-cat-2x2",
    label: "Tests for 2x2",
    parentId: "cat_table_shape-2x2",
    type: "test",
    testIds: ["chi-square-2x2", "two-proportion-z-test", "fisher-exact"],
  },
  {
    id: "leaf-cmp-cat-rxc",
    label: "Tests for rxc",
    parentId: "cat_table_shape-rxc",
    type: "test",
    testIds: ["chi-square", "fisher-freeman-halton"],
  },

  {
    id: "compare_design_cat-paired",
    label: "Paired binary (same units)",
    parentId: "compare_design_cat",
    type: "decision",
  },
  {
    id: "leaf-cmp-cat-paired-binary",
    label: "Paired categorical tests",
    parentId: "compare_design_cat-paired",
    type: "test",
    testIds: ["mcnemar-test", "cochran-q"],
  },

  // ── Association branch (steps: assoc_types → partial_needed) ──────────
  {
    id: "assoc_types",
    label: "What variables are you associating?",
    parentId: "goal-association",
    type: "decision",
  },
  {
    id: "assoc_types-cont_cont",
    label: "Continuous–continuous",
    parentId: "assoc_types",
    type: "decision",
  },
  {
    id: "partial_needed",
    label: "Control for other variables?",
    parentId: "assoc_types-cont_cont",
    type: "decision",
  },
  {
    id: "partial_needed-no",
    label: "No",
    parentId: "partial_needed",
    type: "decision",
  },
  {
    id: "partial_needed-yes",
    label: "Yes",
    parentId: "partial_needed",
    type: "decision",
  },
  {
    id: "leaf-assoc-contcont-nocontrol",
    label: "Correlation tests",
    parentId: "partial_needed-no",
    type: "test",
    testIds: ["spearman-correlation", "pearson-correlation", "kendall-tau"],
  },
  {
    id: "leaf-assoc-contcont-control",
    label: "Partial correlation tests",
    parentId: "partial_needed-yes",
    type: "test",
    testIds: ["partial-correlation", "spearman-correlation", "pearson-correlation", "kendall-tau"],
  },
  {
    id: "assoc_types-bincont",
    label: "Binary–continuous",
    parentId: "assoc_types",
    type: "decision",
  },
  {
    id: "leaf-assoc-bincont",
    label: "Point-biserial / Biserial",
    parentId: "assoc_types-bincont",
    type: "test",
    testIds: ["point-biserial"],
  },

  // ── Categorical association / agreement (steps: cat_assoc_task → agreement_raters) ─
  {
    id: "cat_assoc_task",
    label: "What do you need?",
    parentId: "goal-categorical_association",
    type: "decision",
  },
  {
    id: "cat_assoc_task-indep",
    label: "Test independence",
    parentId: "cat_assoc_task",
    type: "decision",
  },
  {
    id: "leaf-cat-independence",
    label: "Contingency tests",
    parentId: "cat_assoc_task-indep",
    type: "test",
    testIds: ["chi-square", "fisher-exact", "fisher-freeman-halton"],
  },
  {
    id: "cat_assoc_task-agree",
    label: "Agreement (raters)",
    parentId: "cat_assoc_task",
    type: "decision",
  },
  {
    id: "agreement_raters",
    label: "How many raters?",
    parentId: "cat_assoc_task-agree",
    type: "decision",
  },
  {
    id: "agreement_raters-2",
    label: "Two raters",
    parentId: "agreement_raters",
    type: "decision",
  },
  {
    id: "agreement_raters-3",
    label: "Three or more raters",
    parentId: "agreement_raters",
    type: "decision",
  },
  {
    id: "leaf-agree-2",
    label: "Cohen's Kappa & similar",
    parentId: "agreement_raters-2",
    type: "test",
    testIds: ["cohens-kappa"],
  },
  {
    id: "leaf-agree-3p",
    label: "Fleiss' Kappa",
    parentId: "agreement_raters-3",
    type: "test",
    testIds: ["fleiss-kappa"],
  },
  {
    id: "cat_assoc_task-effect",
    label: "Effect size",
    parentId: "cat_assoc_task",
    type: "decision",
  },
  {
    id: "leaf-cat-effect-size",
    label: "Effect size tests",
    parentId: "cat_assoc_task-effect",
    type: "test",
    testIds: ["cramers-v", "odds-ratio", "phi-coefficient"],
  },

  // ── Model with predictors (steps: model_outcome → model_preference_* → clustered_data) ─
  {
    id: "model_outcome",
    label: "What is the outcome type?",
    parentId: "goal-model_with_predictors",
    type: "decision",
  },

  // Continuous
  { id: "model_outcome-cont", label: "Continuous", parentId: "model_outcome", type: "decision" },
  {
    id: "model_preference_cont",
    label: "What is your priority?",
    parentId: "model_outcome-cont",
    type: "decision",
  },
  {
    id: "clustered_data-cont",
    label: "Is the data clustered/repeated?",
    parentId: "model_preference_cont",
    type: "decision",
  },
  {
    id: "leaf-mod-cont-interp",
    label: "Interpretable inference (linear models)",
    parentId: "clustered_data-cont",
    type: "test",
    testIds: [
      "multiple-regression",
      "linear-regression",
      "robust-regression",
      "quantile-regression",
      "bayesian-regression",
    ],
  },
  {
    id: "leaf-mod-cont-regularized",
    label: "Regularized (many predictors)",
    parentId: "clustered_data-cont",
    type: "test",
    testIds: ["elastic-net", "lasso-ridge"],
  },
  {
    id: "leaf-mod-cont-ml",
    label: "Predictive ML (nonlinear)",
    parentId: "clustered_data-cont",
    type: "test",
    testIds: [
      "random-forest",
      "gradient-boosting",
      "xgboost",
      "lightgbm",
      "catboost",
      "svm",
      "knn",
      "decision-tree",
      "neural-network-mlp",
    ],
  },
  {
    id: "leaf-mod-cont-clustered",
    label: "Clustered continuous outcome",
    parentId: "clustered_data-cont",
    type: "test",
    testIds: ["linear-mixed-model", "bayesian-regression"],
  },

  // Binary
  { id: "model_outcome-bin", label: "Binary", parentId: "model_outcome", type: "decision" },
  {
    id: "model_preference_bin",
    label: "What is your priority?",
    parentId: "model_outcome-bin",
    type: "decision",
  },
  {
    id: "clustered_data-bin",
    label: "Is the data clustered/repeated?",
    parentId: "model_preference_bin",
    type: "decision",
  },
  {
    id: "leaf-mod-bin-interp",
    label: "Interpretable inference (logistic-type)",
    parentId: "clustered_data-bin",
    type: "test",
    testIds: ["logistic-regression", "probit-regression", "bayesian-regression"],
  },
  {
    id: "leaf-mod-bin-ml",
    label: "Predictive ML (nonlinear)",
    parentId: "clustered_data-bin",
    type: "test",
    testIds: [
      "random-forest",
      "gradient-boosting",
      "xgboost",
      "lightgbm",
      "catboost",
      "svm",
      "knn",
      "decision-tree",
      "naive-bayes",
      "neural-network-mlp",
    ],
  },
  {
    id: "leaf-mod-bin-clustered",
    label: "Clustered binary outcome",
    parentId: "clustered_data-bin",
    type: "test",
    testIds: ["glmm", "gee", "logistic-regression"],
  },

  // Count
  { id: "model_outcome-count", label: "Count", parentId: "model_outcome", type: "decision" },
  {
    id: "clustered_data-count",
    label: "Is the data clustered/repeated?",
    parentId: "model_outcome-count",
    type: "decision",
  },
  {
    id: "leaf-mod-count",
    label: "Count outcome (independent)",
    parentId: "clustered_data-count",
    type: "test",
    testIds: ["poisson-regression", "negative-binomial", "zero-inflated-poisson"],
  },
  {
    id: "leaf-mod-count-clustered",
    label: "Clustered count outcome",
    parentId: "clustered_data-count",
    type: "test",
    testIds: ["glmm", "negative-binomial", "poisson-regression", "gee"],
  },

  // Ordinal / multivariate / time-to-event (direct leaves in wizard)
  {
    id: "leaf-mod-ordinal",
    label: "Ordinal outcome",
    parentId: "model_outcome",
    type: "test",
    testIds: ["ordinal-regression"],
  },
  {
    id: "leaf-mod-multivariate",
    label: "Multiple continuous outcomes",
    parentId: "model_outcome",
    type: "test",
    testIds: ["manova"],
  },
  {
    id: "leaf-mod-time_to_event",
    label: "Time-to-event outcome",
    parentId: "model_outcome",
    type: "test",
    testIds: ["cox-regression", "accelerated-failure-time", "random-survival-forest"],
  },

  // ── Unsupervised (step: unsup_task) ──────────────────────────────────
  {
    id: "unsup_task",
    label: "What do you want to do?",
    parentId: "goal-unsupervised",
    type: "decision",
  },
  {
    id: "leaf-unsup-clustering",
    label: "Clustering",
    parentId: "unsup_task",
    type: "test",
    testIds: ["kmeans", "hierarchical-clustering", "dbscan", "gaussian-mixture"],
  },
  {
    id: "leaf-unsup-dimred",
    label: "Dimension reduction / embedding",
    parentId: "unsup_task",
    type: "test",
    testIds: ["pca", "factor-analysis", "tsne", "umap"],
  },

  // ── Time series (step: ts_task) ──────────────────────────────────────
  {
    id: "ts_task",
    label: "What is your primary time-series task?",
    parentId: "goal-time_series",
    type: "decision",
  },
  {
    id: "leaf-ts-forecast",
    label: "Forecasting",
    parentId: "ts_task",
    type: "test",
    testIds: ["arima", "exponential-smoothing", "prophet"],
  },
  {
    id: "leaf-ts-stationarity",
    label: "Stationarity check",
    parentId: "ts_task",
    type: "test",
    testIds: ["adf-test"],
  },
  {
    id: "leaf-ts-adequacy",
    label: "Model adequacy / autocorrelation",
    parentId: "ts_task",
    type: "test",
    testIds: ["ljung-box"],
  },
  {
    id: "leaf-ts-var",
    label: "Multivariate dynamics",
    parentId: "ts_task",
    type: "test",
    testIds: ["var", "granger-causality"],
  },
  {
    id: "leaf-ts-granger",
    label: "Causality between series",
    parentId: "ts_task",
    type: "test",
    testIds: ["granger-causality", "var"],
  },

  // ── Survival (step: surv_task) ───────────────────────────────────────
  { id: "surv_task", label: "What do you need?", parentId: "goal-survival", type: "decision" },
  {
    id: "leaf-surv-describe",
    label: "Describe survival curve",
    parentId: "surv_task",
    type: "test",
    testIds: ["kaplan-meier"],
  },
  {
    id: "leaf-surv-compare",
    label: "Compare survival curves",
    parentId: "surv_task",
    type: "test",
    testIds: ["log-rank-test", "kaplan-meier"],
  },
  {
    id: "leaf-surv-model",
    label: "Model survival with covariates",
    parentId: "surv_task",
    type: "test",
    testIds: [
      "cox-regression",
      "accelerated-failure-time",
      "competing-risks",
      "random-survival-forest",
      "kaplan-meier",
    ],
  },

  // ── Power planning (leaf in wizard) ──────────────────────────────────
  {
    id: "leaf-power",
    label: "Power / sample size planning",
    parentId: "goal-power_planning",
    type: "test",
    testIds: ["power-analysis"],
  },

  // ── Diagnostics (step: diag_task) ────────────────────────────────────
  {
    id: "diag_task",
    label: "What do you need?",
    parentId: "goal-diagnostics_posthoc_effectsize",
    type: "decision",
  },
  {
    id: "leaf-diag-normality",
    label: "Normality check",
    parentId: "diag_task",
    type: "test",
    testIds: ["shapiro-wilk", "anderson-darling", "dagostino-pearson", "kolmogorov-smirnov"],
  },
  {
    id: "leaf-diag-equalvar",
    label: "Equal variance check",
    parentId: "diag_task",
    type: "test",
    testIds: ["levene-test", "brown-forsythe", "bartlett-test", "fligner-killeen", "hartley-fmax"],
  },
  {
    id: "leaf-diag-autocorr",
    label: "Regression autocorrelation",
    parentId: "diag_task",
    type: "test",
    testIds: ["durbin-watson", "ljung-box"],
  },
  {
    id: "leaf-diag-heterosk",
    label: "Heteroskedasticity",
    parentId: "diag_task",
    type: "test",
    testIds: ["breusch-pagan"],
  },
  {
    id: "leaf-diag-multiple",
    label: "Multiple testing correction",
    parentId: "diag_task",
    type: "test",
    testIds: ["holm-bonferroni", "bonferroni", "benjamini-hochberg"],
  },
  {
    id: "leaf-diag-posthoc",
    label: "Post-hoc comparisons",
    parentId: "diag_task",
    type: "test",
    testIds: ["tukey-hsd", "games-howell", "scheffe-test", "dunnett-test", "dunn-test"],
  },
  {
    id: "leaf-diag-effect",
    label: "Effect size",
    parentId: "diag_task",
    type: "test",
    testIds: [
      "cohens-d",
      "hedges-g",
      "eta-squared",
      "omega-squared",
      "epsilon-squared",
      "odds-ratio",
      "cramers-v",
      "rank-biserial",
      "phi-coefficient",
    ],
  },
];

function DecisionNode({
  data,
  selected,
}: {
  data: { label: string; isSelected: boolean; hasChildren: boolean };
  selected?: boolean;
}) {
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

function TestNode({
  data,
  onClick,
}: {
  data: { label: string; testIds: string[] };
  onClick?: () => void;
}) {
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

function StartNode({ data }: { data: { label: string; isInteractive?: boolean } }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-md transition-all duration-200 ${
        data.isInteractive ? "cursor-pointer hover:bg-primary/90" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-sm text-center min-w-[200px]">
        {data.isInteractive && hovered ? "Change Research Goal" : data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary-foreground" />
    </div>
  );
}

function TestDetailPanel({
  tests,
  open,
  onClose,
  onCompareClick,
}: {
  tests: StatTest[];
  open: boolean;
  onClose: () => void;
  onCompareClick: (currentTest: StatTest, altId: string) => void;
}) {
  const [, setLocation] = useLocation();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] p-0 overflow-hidden"
        data-testid="flowchart-test-detail"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DraftingCompass className="w-5 h-5 text-primary" />
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
                  <div className="text-sm text-muted-foreground mt-1">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {test.description}
                    </ReactMarkdown>
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
                    {test.assumptions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-muted-foreground/50">-</span>
                        <div className="markdown-inline">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {a}
                          </ReactMarkdown>
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
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {w}
                          </ReactMarkdown>
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
                            onClick={() => onCompareClick(test, altId)}
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
                  <div className="space-y-3">
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
  return flowchartNodes.filter((n) => n.parentId === parentId);
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
  const isMobile = useIsMobile();

  // Reset selections when leaving the component
  useEffect(() => {
    return () => {
      clearSelections();
    };
  }, [clearSelections]);

  const handleCompareClick = (currentTest: StatTest, altId: string) => {
    const altTest = statisticalTests.find((t) => t.id === altId);
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
      const altTest = statisticalTests.find((t) => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const handleNextAlt = () => {
    if (currentAltIndex < alternativesList.length - 1 && currentBaseTest) {
      const newIndex = currentAltIndex + 1;
      const altTest = statisticalTests.find((t) => t.id === alternativesList[newIndex]);
      if (altTest) {
        setCurrentAltIndex(newIndex);
        setCompareTests([currentBaseTest, altTest]);
      }
    }
  };

  const removeFromCompare = (testId: string) => {
    const updated = compareTests.filter((t) => t.id !== testId);
    setCompareTests(updated);
    if (updated.length === 0) {
      setShowCompare(false);
    }
  };

  const selectedIds = useMemo(() => selections.map((s) => s.nodeId), [selections]);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const nodeWidth = 200;
    const layerGap = 140;
    const edgeStyle = { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 };
    const selectedEdgeStyle = { stroke: "hsl(var(--primary))", strokeWidth: 2.5 };

    // Determine the root for display
    // If we have selections, the first selection (goal) is our "root"
    // If no selections, we show nothing here (Start Screen is shown instead)
    const rootNodeId = selections.length > 0 ? selections[0].nodeId : "start";

    const nodesToShow = new Set<string>([rootNodeId]);

    // If we are at the real start, show its children (though this case is handled by Start Screen now)
    if (rootNodeId === "start") {
      const startChildren = getChildren("start");
      startChildren.forEach((c) => nodesToShow.add(c.id));
    } else {
      // If we have a goal selected, we need to show the goal + active path + ALL children of selected nodes
      // This ensures siblings remain visible as we go deeper
      nodesToShow.add(rootNodeId);

      selections.forEach((selection) => {
        nodesToShow.add(selection.nodeId);
        const children = getChildren(selection.nodeId);
        children.forEach((c) => nodesToShow.add(c.id));
      });
    }

    const getLayerForNode = (nodeId: string, depth = 0): number => {
      const node = flowchartNodes.find((n) => n.id === nodeId);
      if (!node || !node.parentId || nodeId === rootNodeId) return depth;
      return getLayerForNode(node.parentId, depth + 1);
    };

    const nodePositions: Map<string, { x: number; y: number }> = new Map();
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const positionNode = (
      nodeId: string,
      parentX: number,
      siblingIndex: number,
      siblingCount: number
    ): void => {
      const node = flowchartNodes.find((n) => n.id === nodeId);
      if (!node || !nodesToShow.has(nodeId)) return;

      const layer = getLayerForNode(nodeId);
      const y = layer * layerGap;

      let x: number;
      if (nodeId === rootNodeId) {
        x = 0;
      } else {
        const spreadWidth = (siblingCount - 1) * nodeWidth;
        const startX = parentX - spreadWidth / 2;
        x = startX + siblingIndex * nodeWidth;
      }

      nodePositions.set(nodeId, { x, y });

      const isSelected = selectedIds.includes(nodeId);
      const hasChildren = getChildren(node.id).length > 0;

      // Special case: The goal node (root of this view) should look like a start node/question
      if (nodeId === rootNodeId && nodeId !== "start") {
        nodes.push({
          id: node.id,
          type: "startNode", // Resuse startNode styling for the goal question
          position: { x, y },
          data: { label: node.label, isInteractive: true },
        });
      } else if (node.type === "start") {
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

      // Draw edge if parent is visible AND parent is not the "start" node (unless root is start)
      // Because we want to hide connections to the global "start" if we are rooted at "goal"
      if (node.parentId && nodesToShow.has(node.parentId)) {
        if (node.parentId !== "start" || rootNodeId === "start") {
          const isOnSelectedPath =
            selectedIds.includes(nodeId) || selectedIds.includes(node.parentId);
          edges.push({
            id: `${node.parentId}-to-${nodeId}`,
            source: node.parentId,
            target: nodeId,
            style: isOnSelectedPath ? selectedEdgeStyle : edgeStyle,
            animated: node.type === "test",
          });
        }
      }

      const visibleChildren = getChildren(nodeId).filter((c) => nodesToShow.has(c.id));
      visibleChildren.forEach((child, i) => {
        positionNode(child.id, x, i, visibleChildren.length);
      });
    };

    positionNode(rootNodeId, 0, 0, 1);

    return { visibleNodes: nodes, visibleEdges: edges };
  }, [selectedIds, selections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(visibleNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(visibleEdges);

  // Update logic to remove "start" node special handling since we want to zoom correctly
  useEffect(() => {
    setNodes(visibleNodes);
    setEdges(visibleEdges);

    // Smart zoom logic -- simplified because tree is strictly controlled now
    // We just want to fit view because the view IS the context
    setTimeout(() => {
      fitView({
        padding: 0.1, // Match standard Fit View button (usually 0.1)
        duration: 800,
      });
    }, 100);
  }, [visibleNodes, visibleEdges, setNodes, setEdges, fitView]);

  const getNodeDepth = useCallback(
    (nodeId: string, depth = 0): number => {
      const node = flowchartNodes.find((n) => n.id === nodeId);
      if (!node) return depth; // Node not found, return current depth

      // If this node is the root of the current view, its depth is 0 relative to the view,
      // but we need to return the accumulated 'depth' from the recursion to show its distance from our probe
      if (selections.length > 0 && nodeId === selections[0].nodeId) {
        return depth;
      }
      // If no selections, "start" is the root
      if (selections.length === 0 && nodeId === "start") {
        return depth;
      }

      if (!node.parentId) return depth; // No parent, so it's a root (either global "start" or a goal node)

      return getNodeDepth(node.parentId, depth + 1);
    },
    [selections]
  );

  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      // If clicking the root goal node, reset
      if (selections.length > 0 && node.id === selections[0].nodeId) {
        clearSelections();
        return;
      }

      if (node.type === "startNode") return;

      if (node.type === "testNode") {
        const testIds = (node.data as any).testIds || [];
        const tests = testIds
          .map((id: string) => statisticalTests.find((t) => t.id === id))
          .filter((t: StatTest | undefined): t is StatTest => t !== undefined);
        if (tests.length > 0) {
          setSelectedTests(tests);
          setDetailOpen(true);
        }
        return;
      }

      const flowNode = flowchartNodes.find((n) => n.id === node.id);
      if (flowNode) {
        // Logic for changing selection
        // If we click a node higher up in the current view (but below root), we unwind

        const clickedDepth = getNodeDepth(node.id);

        const selectionIndexAtDepth = selections.findIndex((sel) => {
          return getNodeDepth(sel.nodeId) >= clickedDepth;
        });

        if (selectionIndexAtDepth >= 0) {
          removeSelectionsAfter(selectionIndexAtDepth);
        }

        addSelection(node.id, flowNode.label);
      }
    },
    [addSelection, removeSelectionsAfter, selections, getNodeDepth, clearSelections]
  );

  const handleReset = useCallback(() => {
    clearSelections();
  }, [clearSelections]);

  const nodeTypes = useMemo(
    () => ({
      decisionNode: DecisionNode,
      testNode: (props: any) => (
        <TestNode {...props} onClick={() => handleNodeClick(null, props)} />
      ),
      startNode: StartNode,
    }),
    [handleNodeClick]
  );

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="mb-6 p-4 rounded-full bg-muted/50">
          <Smartphone className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-3">Desktop View Recommended</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          The interactive flowchart is complex and optimized for larger screens. Please visit this
          page on a desktop or tablet for the best experience.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="default">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header currentPage="flowchart" />
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

      <div className="flex-1 relative">
        {selections.length === 0 ? (
          <div className="absolute inset-0 bg-background overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-12">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                  What is your research goal?
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Select the description that best matches what you are trying to find out from your
                  data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getChildren("start").map((node) => (
                  <div
                    key={node.id}
                    className="group relative p-6 bg-card hover:bg-accent/50 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
                    onClick={() => addSelection(node.id, node.label)}
                  >
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {node.id === "goal-estimate" && <Target className="w-6 h-6" />}
                      {node.id === "goal-compare_groups" && <Scale className="w-6 h-6" />}
                      {node.id === "goal-association" && <TrendingUp className="w-6 h-6" />}
                      {node.id === "goal-categorical_association" && <Split className="w-6 h-6" />}
                      {node.id === "goal-model_with_predictors" && (
                        <LineChart className="w-6 h-6" />
                      )}
                      {node.id === "goal-unsupervised" && <Shapes className="w-6 h-6" />}
                      {node.id === "goal-time_series" && <CalendarClock className="w-6 h-6" />}
                      {node.id === "goal-survival" && <LineChart className="w-6 h-6" />}
                      {node.id === "goal-power_planning" && <ClipboardList className="w-6 h-6" />}
                      {node.id === "goal-diagnostics_posthoc_effectsize" && (
                        <Code className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{node.label}</h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute bottom-6 right-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodesDraggable={false}
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
            <Controls className="!bg-background !border !shadow-md" showInteractive={false} />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="hsl(var(--muted-foreground) / 0.2)"
            />
          </ReactFlow>
        )}

        {selections.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-background/95 border rounded-md p-3 shadow-sm text-xs text-muted-foreground max-w-xs">
            <p className="font-medium text-foreground mb-1">How to use:</p>
            <ul className="space-y-1">
              <li>- Click on a choice to reveal the next level</li>
              <li>- Click the blue root node to select another tree</li>
              <li>- Your path is shown in the header</li>
              <li>- Click colored test nodes to view details</li>
            </ul>
          </div>
        )}
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
