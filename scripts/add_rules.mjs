#!/usr/bin/env node
/**
 * Adds `rules: { ... }` to every test object in statsData.ts.
 * Run: node scripts/add_rules.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "client", "src", "lib", "statsData.ts");

// ─── Rules mapping ────────────────────────────────────────────────────
// Each key is a test id.  Value is the stringified rules object body.
// kind defaults to "primary" if omitted.

const rulesMap = {
  // ─── Group Comparison: Parametric ───────────────────────────────────
  "t-test-independent": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 3, unsure: 1 },
      equalVar: { yes: 3, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "paired-t-test": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "paired" },
    boosts: {
      normality: { yes: 3, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "one-way-anova": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 3, unsure: 1 },
      equalVar: { yes: 3, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "two-way-anova": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      equalVar: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "repeated-measures-anova": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "repeated" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Group Comparison: Nonparametric ────────────────────────────────
  "mann-whitney": `{
    requires: { goal: "compare", nGroups: "2", sampleStructure: "independent" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  "wilcoxon-signed-rank": `{
    requires: { goal: "compare", nGroups: "2", sampleStructure: "paired" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  "kruskal-wallis": `{
    requires: { goal: "compare", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  "friedman-test": `{
    requires: { goal: "compare", nGroups: "3plus", sampleStructure: "repeated" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  // ─── Correlation ────────────────────────────────────────────────────
  "pearson-correlation": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "spearman-correlation": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  "partial-correlation": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Regression ─────────────────────────────────────────────────────
  "linear-regression": `{
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      predictorsCount: { "1": 3 },
      mixedEffects: { no: 1 },
    },
  }`,

  "multiple-regression": `{
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      predictorsCount: { many: 3 },
      mixedEffects: { no: 1 },
    },
  }`,

  "logistic-regression": `{
    requires: { goal: "model", outcomeScale: "binary" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  }`,

  "poisson-regression": `{
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  }`,

  "ordinal-regression": `{
    requires: { goal: "model", outcomeScale: "ordinal" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  }`,

  // ─── Categorical ────────────────────────────────────────────────────
  "chi-square": `{
    requires: { goal: "categorical_assoc" },
    boosts: {
      tableType: { "2x2": 2, rxc: 3 },
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "fisher-exact": `{
    requires: { goal: "categorical_assoc" },
    boosts: {
      tableType: { "2x2": 3 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  }`,

  "mcnemar-test": `{
    requires: { goal: "categorical_assoc", tableType: "paired_binary_2" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  }`,

  // ─── Mixed Models ───────────────────────────────────────────────────
  "linear-mixed-model": `{
    requires: { goal: "model", mixedEffects: "yes" },
    boosts: {
      outcomeScale: { continuous: 3 },
      sampleStructure: { clustered: 3, repeated: 2 },
      modelingFocus: { inference: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "glmm": `{
    requires: { goal: "model", mixedEffects: "yes" },
    boosts: {
      outcomeScale: { binary: 3, count: 3, ordinal: 2 },
      sampleStructure: { clustered: 3, repeated: 2 },
      modelingFocus: { inference: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Time Series ────────────────────────────────────────────────────
  "arima": `{
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "exponential-smoothing": `{
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  // ─── Survival ───────────────────────────────────────────────────────
  "kaplan-meier": `{
    requires: { survivalTask: "curve" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  }`,

  "log-rank-test": `{
    requires: { survivalTask: "compare" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  }`,

  "cox-regression": `{
    requires: { survivalTask: "regression" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Clustering / Dim Reduction ─────────────────────────────────────
  "kmeans": `{
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "hierarchical-clustering": `{
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  }`,

  "pca": `{
    requires: { goal: "unsupervised", unsupTask: "dimred" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "factor-analysis": `{
    requires: { goal: "unsupervised", unsupTask: "dimred" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── ML Models ──────────────────────────────────────────────────────
  "random-forest": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "gradient-boosting": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "lasso-ridge": `{
    requires: { goal: "model" },
    boosts: {
      outcomeScale: { continuous: 3 },
      modelingFocus: { inference: 1, prediction: 2 },
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  // ─── Resampling ─────────────────────────────────────────────────────
  "bootstrap": `{
    requires: {},
    boosts: {
      stance: { robust: 3, nonparametric: 2, unsure: 1 },
    },
    kind: "resampling",
  }`,

  "permutation-test": `{
    requires: {},
    boosts: {
      stance: { nonparametric: 3, robust: 2, unsure: 1 },
    },
    kind: "resampling",
  }`,

  // ─── Power / Planning ───────────────────────────────────────────────
  "power-analysis": `{
    requires: { goal: "power" },
    kind: "planning",
  }`,

  // ─── Assumption Testing ─────────────────────────────────────────────
  "levene-test": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "bartlett-test": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "brown-forsythe": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "fligner-killeen": `{
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "hartley-fmax": `{
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "shapiro-wilk": `{
    requires: {},
    boosts: {
      goal: { compare: 2, model: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "kolmogorov-smirnov": `{
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "anderson-darling": `{
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "dagostino-pearson": `{
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "durbin-watson": `{
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "breusch-pagan": `{
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  "vif": `{
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  }`,

  // ─── Post-hoc Tests ─────────────────────────────────────────────────
  "tukey-hsd": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      equalVar: { yes: 2 },
    },
    kind: "posthoc",
  }`,

  "bonferroni": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  }`,

  "holm-bonferroni": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  }`,

  "benjamini-hochberg": `{
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  }`,

  "dunnett-test": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  }`,

  "games-howell": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      equalVar: { no: 3, unsure: 1 },
    },
    kind: "posthoc",
  }`,

  "scheffe-test": `{
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  }`,

  "dunn-test": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      stance: { nonparametric: 3 },
    },
    kind: "posthoc",
  }`,

  // ─── Additional comparison tests ────────────────────────────────────
  "welch-t-test": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      equalVar: { no: 3, unsure: 2 },
      stance: { parametric: 2, robust: 1, unsure: 2 },
    },
  }`,

  "welch-anova": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      equalVar: { no: 3, unsure: 2 },
      stance: { parametric: 2, robust: 1, unsure: 2 },
    },
  }`,

  "ancova": `{
    requires: { goal: "compare", outcomeScale: "continuous", sampleStructure: "independent" },
    boosts: {
      nGroups: { "2": 2, "3plus": 2 },
      normality: { yes: 2, unsure: 1 },
      equalVar: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "manova": `{
    requires: { goal: "compare", outcomeScale: "multivariate", sampleStructure: "independent" },
    boosts: {
      nGroups: { "2": 2, "3plus": 2 },
      normality: { yes: 2 },
      equalVar: { yes: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Additional correlation ─────────────────────────────────────────
  "kendall-tau": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { ordinal: 3, continuous: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  }`,

  "point-biserial": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { binary: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "intraclass-correlation": `{
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      sampleStructure: { paired: 2, repeated: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Additional categorical ─────────────────────────────────────────
  "cochran-q": `{
    requires: { goal: "categorical_assoc", tableType: "paired_binary_3plus" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  }`,

  "cramers-v": `{
    requires: {},
    boosts: {
      goal: { categorical_assoc: 3, utilities: 3 },
    },
    kind: "effectsize",
  }`,

  "cohens-kappa": `{
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, associate: 2, utilities: 3 },
    },
    kind: "effectsize",
  }`,

  "fleiss-kappa": `{
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, associate: 2, utilities: 3 },
    },
    kind: "effectsize",
  }`,

  // ─── Additional regression ──────────────────────────────────────────
  "negative-binomial": `{
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "zero-inflated-poisson": `{
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "quantile-regression": `{
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 2, prediction: 1 },
      stance: { robust: 3, unsure: 1 },
    },
  }`,

  "robust-regression": `{
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 2, prediction: 1 },
      stance: { robust: 3, unsure: 1 },
    },
  }`,

  "probit-regression": `{
    requires: { goal: "model", outcomeScale: "binary" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Additional ML ─────────────────────────────────────────────────
  "svm": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 3 },
      stance: { unsure: 1 },
    },
  }`,

  "xgboost": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "lightgbm": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "catboost": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2, nominal: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "knn": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 1, binary: 2, nominal: 2 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  }`,

  "naive-bayes": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { binary: 3, nominal: 3 },
      stance: { unsure: 1 },
    },
  }`,

  "decision-tree": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 1, binary: 2, nominal: 2 },
      stance: { unsure: 1 },
    },
  }`,

  "elastic-net": `{
    requires: { goal: "model" },
    boosts: {
      outcomeScale: { continuous: 3 },
      modelingFocus: { inference: 1, prediction: 2 },
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "neural-network-mlp": `{
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  }`,

  // ─── Additional clustering / dim-red ─────────────────────────────────
  "dbscan": `{
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { nonparametric: 2, unsure: 1 },
    },
  }`,

  "gaussian-mixture": `{
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "tsne": `{
    requires: { goal: "unsupervised", unsupTask: "embedding" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  }`,

  "umap": `{
    requires: { goal: "unsupervised", unsupTask: "embedding" },
    boosts: {
      stance: { nonparametric: 1, unsure: 2 },
    },
  }`,

  // ─── Additional time series ─────────────────────────────────────────
  "prophet": `{
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { unsure: 2 },
    },
  }`,

  "adf-test": `{
    requires: { goal: "time_series", tsTask: "diagnostics" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "granger-causality": `{
    requires: { goal: "time_series", tsTask: "multivariate" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "ljung-box": `{
    requires: { goal: "time_series", tsTask: "diagnostics" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "var": `{
    requires: { goal: "time_series", tsTask: "multivariate" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  // ─── Bayesian ───────────────────────────────────────────────────────
  "bayesian-t-test": `{
    requires: { stance: "bayesian" },
    boosts: {
      goal: { compare: 3, bayesian: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
  }`,

  "bayesian-regression": `{
    requires: { stance: "bayesian" },
    boosts: {
      goal: { model: 3, bayesian: 3, associate: 1 },
      outcomeScale: { continuous: 2, binary: 1 },
    },
  }`,

  "bayesian-anova": `{
    requires: { stance: "bayesian" },
    boosts: {
      goal: { compare: 3, bayesian: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "3plus": 2 },
    },
  }`,

  // ─── Additional survival ────────────────────────────────────────────
  "accelerated-failure-time": `{
    requires: { survivalTask: "regression" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,

  "competing-risks": `{
    requires: { survivalTask: "competing" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 1, unsure: 1 },
    },
  }`,

  "random-survival-forest": `{
    requires: { survivalTask: "ml" },
    boosts: {
      goal: { survival: 3 },
      stance: { unsure: 2 },
    },
  }`,

  // ─── Effect Size ────────────────────────────────────────────────────
  "cohens-d": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
    kind: "effectsize",
  }`,

  "hedges-g": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
    kind: "effectsize",
  }`,

  "eta-squared": `{
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "3plus": 2 },
    },
    kind: "effectsize",
  }`,

  "odds-ratio": `{
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, model: 1, utilities: 3 },
      outcomeScale: { binary: 3 },
    },
    kind: "effectsize",
  }`,

  // ─── One-sample t-test (if it exists) ───────────────────────────────
  "one-sample-t-test": `{
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "1" },
    boosts: {
      normality: { yes: 3, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  }`,
};

// ─── Transform ────────────────────────────────────────────────────────

let src = readFileSync(FILE, "utf-8");
let modified = 0;
let missing = 0;

for (const [id, rulesBody] of Object.entries(rulesMap)) {
  // Match patterns like:
  //   rCode: "...",
  //   },  ← closing brace of the test object
  // We want to insert `rules: { ... },` before the closing },
  // Strategy: find `id: "${id}"` then find the next `rCode:` line,
  // and insert rules after it.

  const idPattern = `id: "${id}"`;
  const idIdx = src.indexOf(idPattern);
  if (idIdx === -1) {
    if (id !== "one-sample-t-test") {
      console.log(`⚠️  Test "${id}" not found in file`);
      missing++;
    }
    continue;
  }

  // Find the rCode line after this id
  const rCodePattern = /rCode:\s*["'`][^]*?["'`]\s*,?\s*\n/;
  const afterId = src.slice(idIdx);
  const rCodeMatch = afterId.match(rCodePattern);
  if (!rCodeMatch) {
    console.log(`⚠️  No rCode found for "${id}"`);
    missing++;
    continue;
  }

  const insertPos = idIdx + rCodeMatch.index + rCodeMatch[0].length;

  // Check if rules already exists
  const nextChunk = src.slice(insertPos, insertPos + 100);
  if (nextChunk.includes("rules:")) {
    console.log(`⏭️  "${id}" already has rules, skipping`);
    continue;
  }

  // Insert rules
  const indent = "    ";
  const rulesLine = `${indent}rules: ${rulesBody},\n`;
  src = src.slice(0, insertPos) + rulesLine + src.slice(insertPos);
  modified++;
}

writeFileSync(FILE, src, "utf-8");
console.log(`\n✅ Done. Modified: ${modified}, Missing: ${missing}`);
