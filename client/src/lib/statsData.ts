// ── Union types for WizardContext ──────────────────────────────────────

export type Goal =
  | "compare"
  | "associate"
  | "model"
  | "estimate"
  | "categorical_assoc"
  | "time_series"
  | "survival"
  | "unsupervised"
  | "utilities"
  | "power";

export type OutcomeScale =
  | "continuous"
  | "binary"
  | "count"
  | "ordinal"
  | "nominal"
  | "time-to-event"
  | "multivariate";

export type SampleStructure =
  | "independent"
  | "paired"
  | "repeated"
  | "clustered"
  | "time-series";

export type AssumptionStance = "parametric" | "nonparametric" | "robust" | "bayesian" | "unsure";

// ── WizardContext ──────────────────────────────────────────────────────

export interface WizardContext {
  goal?: Goal;
  outcomeScale?: OutcomeScale;

  // compare branch
  nGroups?: "1" | "2" | "3plus";
  sampleStructure?: SampleStructure;
  equalVar?: "yes" | "no" | "unsure";
  normality?: "yes" | "no" | "unsure";

  // categorical assoc / compare
  tableType?: "2x2" | "rxc" | "paired_binary_2" | "paired_binary_3plus";

  // modeling / ml
  modelingFocus?: "inference" | "prediction";
  predictorsCount?: "1" | "many";
  mixedEffects?: "yes" | "no";

  // time series
  tsTask?: "forecast" | "diagnostics" | "multivariate";

  // survival
  survivalTask?: "curve" | "compare" | "regression" | "competing" | "ml";

  // unsupervised
  unsupTask?: "clustering" | "dimred" | "embedding";

  stance?: AssumptionStance;
}

// ── Wizard Step & Test interfaces ──────────────────────────────────────

export interface WizardStep {
  id: keyof WizardContext;
  title: string;
  question: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
  askWhen?: (ctx: WizardContext) => boolean;
}

export type TestKind = "primary" | "assumption" | "posthoc" | "diagnostic" | "effectsize" | "resampling" | "planning";

export interface StatTestRule {
  /** Hard constraints: must all pass if present */
  requires?: Partial<WizardContext>;
  /** Soft scoring boosts */
  boosts?: Partial<Record<keyof WizardContext, Record<string, number>>>;
  /** What kind of method this is */
  kind?: TestKind;
}

export interface StatTest {
  id: string;
  wikipediaUrl?: string | null;
  name: string;
  description: string;
  assumptions: string[];
  whenToUse: string[];
  alternatives: string[];
  methodFamily: string;
  category: string;
  categoryId: string;
  outcomeScale?: string | null;
  predictorStructure?: string | null;
  design?: string | null;
  level?: string | null;
  alternativeLinks?: string[];
  pythonCode?: string;
  rCode?: string;
  verified?: boolean;
  rules: StatTestRule;
}

// ── Recommendation output ──────────────────────────────────────────────

export interface Recommendation {
  primary: StatTest[];
  alternatives: StatTest[];
  companions: StatTest[];
}

// ── Wizard Steps (conditional) ─────────────────────────────────────────

export const wizardSteps: WizardStep[] = [
  {
    id: "goal",
    title: "Goal",
    question: "What are you trying to do?",
    options: [
      { value: "compare", label: "Compare groups (differences)", description: "Test differences between two or more groups" },
      { value: "associate", label: "Association / correlation", description: "Measure relationships between variables" },
      { value: "model", label: "Model an outcome with predictors", description: "Regression, classification models" },
      { value: "estimate", label: "Estimate a parameter", description: "Confidence intervals, effect sizes, resampling" },
      { value: "categorical_assoc", label: "Categorical association (tables)", description: "Chi-square, Fisher's exact, contingency tables" },
      { value: "time_series", label: "Time series", description: "Forecasting, diagnostics, sequential data" },
      { value: "survival", label: "Survival / time-to-event", description: "Kaplan-Meier, Cox regression, competing risks" },
      { value: "unsupervised", label: "Unsupervised learning", description: "Clustering, dimension reduction, embeddings" },

      { value: "utilities", label: "Assumptions / diagnostics / post-hoc / effect size", description: "Normality tests, variance tests, pairwise comparisons" },
      { value: "power", label: "Power / sample size planning", description: "Power analysis, sample size calculation" },
    ],
  },

  // Outcome type — asked for most branches
  {
    id: "outcomeScale",
    title: "Outcome",
    question: "What type of outcome do you have?",
    options: [
      { value: "continuous", label: "Continuous (numeric)", description: "Measurements like height, weight, temperature" },
      { value: "ordinal", label: "Ordinal (rank / Likert)", description: "Ranked categories with natural order" },
      { value: "nominal", label: "Categorical (nominal)", description: "Unordered categories like colors, types" },
      { value: "binary", label: "Binary", description: "Two outcomes like yes/no, success/failure" },
      { value: "count", label: "Count", description: "Count data like number of events" },
      { value: "time-to-event", label: "Time-to-event", description: "Survival data with censoring" },
      { value: "multivariate", label: "Multiple outcomes", description: "Multiple outcome variables simultaneously" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "compare" ||
      ctx.goal === "associate" ||
      ctx.goal === "model" ||
      ctx.goal === "estimate" ||
      ctx.goal === "categorical_assoc" ||
      ctx.goal === "survival",
  },

  // Number of groups — compare branch with continuous/ordinal
  {
    id: "nGroups",
    title: "Groups",
    question: "How many groups / conditions are you comparing?",
    options: [
      { value: "1", label: "1 (vs a reference value)", description: "Comparing to a known or hypothesized value" },
      { value: "2", label: "2", description: "Two groups or conditions" },
      { value: "3plus", label: "3+", description: "Three or more groups" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "compare" &&
      (ctx.outcomeScale === "continuous" || ctx.outcomeScale === "ordinal"),
  },

  // Sample structure — compare or model
  {
    id: "sampleStructure",
    title: "Design",
    question: "Are the measurements independent or paired/repeated?",
    options: [
      { value: "independent", label: "Independent groups", description: "Different subjects in each group" },
      { value: "paired", label: "Paired (matched / pre-post)", description: "Same subjects measured twice or matched pairs" },
      { value: "repeated", label: "Repeated measures (3+ within-subject)", description: "Multiple measurements per subject" },
      { value: "clustered", label: "Clustered / hierarchical", description: "Nested data like students in schools" },
      { value: "time-series", label: "Time series", description: "Sequential observations over time" },
    ],
    askWhen: (ctx) => ctx.goal === "compare" || ctx.goal === "model" || ctx.goal === "associate",
  },

  // Normality — compare + continuous
  {
    id: "normality",
    title: "Normality",
    question: "Are you comfortable assuming approximate normality (or large n)?",
    options: [
      { value: "yes", label: "Yes", description: "Data is roughly bell-shaped or sample is large" },
      { value: "no", label: "No", description: "Data is skewed, has outliers, or sample is small" },
      { value: "unsure", label: "Not sure", description: "Will suggest methods for both scenarios" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "compare" && ctx.outcomeScale === "continuous",
  },

  // Equal variances — compare + continuous + independent + 2+ groups
  {
    id: "equalVar",
    title: "Variances",
    question: "Do you expect equal variances across groups?",
    options: [
      { value: "yes", label: "Yes", description: "Group spreads are roughly similar" },
      { value: "no", label: "No / different variances", description: "Groups have noticeably different spreads" },
      { value: "unsure", label: "Not sure", description: "Will suggest robust alternatives" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "compare" &&
      ctx.outcomeScale === "continuous" &&
      ctx.nGroups !== "1" &&
      ctx.sampleStructure === "independent",
  },

  // Categorical table routing
  {
    id: "tableType",
    title: "Table Design",
    question: "What best describes your categorical setup?",
    options: [
      { value: "2x2", label: "2×2 independent table", description: "Two groups with a binary outcome" },
      { value: "rxc", label: "r×c independent table", description: "Multiple groups with multiple categories" },
      { value: "paired_binary_2", label: "Paired binary (2 conditions) — McNemar", description: "Same subjects, binary outcome, before/after" },
      { value: "paired_binary_3plus", label: "Paired binary (3+ conditions) — Cochran's Q", description: "Same subjects, binary outcome, 3+ conditions" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "categorical_assoc" ||
      (ctx.goal === "compare" && (ctx.outcomeScale === "nominal" || ctx.outcomeScale === "binary")),
  },

  // Modeling focus
  {
    id: "modelingFocus",
    title: "Model Focus",
    question: "What do you care about most?",
    options: [
      { value: "inference", label: "Explain effects / inference", description: "Understand which predictors matter and how" },
      { value: "prediction", label: "Predictive performance", description: "Maximize model accuracy on new data" },
    ],
    askWhen: (ctx) => ctx.goal === "model",
  },

  // Mixed effects
  {
    id: "mixedEffects",
    title: "Random Effects",
    question: "Do you need random effects for clustered/repeated observations?",
    options: [
      { value: "yes", label: "Yes", description: "Accounts for grouping structure in data" },
      { value: "no", label: "No / standard model", description: "Simple fixed-effects model" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "model" &&
      (ctx.sampleStructure === "clustered" || ctx.sampleStructure === "repeated"),
  },

  // Time series task
  {
    id: "tsTask",
    title: "Time Series Task",
    question: "What are you doing with the time series?",
    options: [
      { value: "forecast", label: "Forecasting", description: "Predict future values" },
      { value: "diagnostics", label: "Diagnostics / tests", description: "Stationarity, autocorrelation, white noise" },
      { value: "multivariate", label: "Multiple series modeling", description: "Model relationships between multiple time series" },
    ],
    askWhen: (ctx) => ctx.goal === "time_series",
  },

  // Survival task
  {
    id: "survivalTask",
    title: "Survival Task",
    question: "What do you need for time-to-event data?",
    options: [
      { value: "curve", label: "Estimate a survival curve", description: "Kaplan-Meier estimator" },
      { value: "compare", label: "Compare survival curves", description: "Log-rank test between groups" },
      { value: "regression", label: "Regression with covariates", description: "Cox proportional hazards" },
      { value: "competing", label: "Competing risks", description: "Multiple possible event types" },
      { value: "ml", label: "Prediction-focused survival ML", description: "Machine learning for survival" },
    ],
    askWhen: (ctx) =>
      ctx.goal === "survival" || (ctx.goal === "compare" && ctx.outcomeScale === "time-to-event"),
  },

  // Unsupervised task
  {
    id: "unsupTask",
    title: "Unsupervised Task",
    question: "What do you want to do?",
    options: [
      { value: "clustering", label: "Clustering", description: "Group similar observations" },
      { value: "dimred", label: "Dimension reduction / latent structure", description: "PCA, factor analysis" },
      { value: "embedding", label: "Visualization embedding", description: "t-SNE, UMAP" },
    ],
    askWhen: (ctx) => ctx.goal === "unsupervised",
  },

  // Stance — preference for method style (asked for most goals)
  {
    id: "stance",
    title: "Preference",
    question: "Any preference for method style?",
    options: [
      { value: "parametric", label: "Parametric (if reasonable)", description: "Assumes distributions, often more powerful" },
      { value: "nonparametric", label: "Nonparametric / rank-based", description: "Distribution-free, fewer assumptions" },
      { value: "robust", label: "Robust / outlier-resistant", description: "Resistant to extreme values" },
      { value: "bayesian", label: "Bayesian", description: "Incorporates prior information" },
      { value: "unsure", label: "No preference", description: "Will recommend best default" },
    ],
    askWhen: (ctx) => ctx.goal !== "power" && ctx.goal !== "utilities",
  },
];

export const statisticalTests: StatTest[] = [
  // Group Comparison - Parametric
  {
    id: "t-test-independent",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Student%27s_t-test",
    name: "Independent Samples (Pooled) t-Test",
    description: "Compares means of two independent groups to determine if they are statistically different.",
    assumptions: [
      "Independent observations within and between groups",
      "Numeric outcome",
      "Difference of means ~ normal (or n large; no extreme outliers)",
      "Variances similar"
    ],
    whenToUse: [
      "Compare means of two independent groups",
      "Data roughly symmetric or n moderately large",
      "Variances similar"
    ],
    alternatives: ["Mann-Whitney U test (non-parametric)", "Welch's t-test (unequal variances)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["mann-whitney", "welch-t-test", "bayesian-t-test"],
    verified: true,
    pythonCode: `
# a and b are 1D arrays of observations
t_pooled, p_val = scipy.stats.ttest_ind(a, b, equal_var=True)
`.trim(),
    rCode: `
# a and b are numeric vectors of observations
t_pooled <- t.test(a, b, var.equal = TRUE)
`.trim(),
    rules: {
      requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
      boosts: {
        normality: { yes: 3, unsure: 1 },
        equalVar: { yes: 3, unsure: 1 },
        stance: { parametric: 2, unsure: 1 },
      },
    },
  },
  {
    id: "paired-t-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Student%27s_t-test",
    name: "Paired Samples t-Test",
    description: "Compares means from the same group at two different times or under two different conditions.",
    assumptions: [
      "Paired/matched observations",
      "Pairs independent of other pairs",
      "Numeric outcome",
      "Differences $d_i = x_{1,i} - x_{2,i}$ ~ normal (or n large; no extreme outliers in $d_i$)"
    ],
    whenToUse: [
      "Before-after / within-subject comparisons",
      "Matched pairs / crossover designs",
      "Analyze the mean of within-pair differences"
    ],
    alternatives: ["Wilcoxon signed-rank test (non-parametric)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "basic",
    alternativeLinks: ["wilcoxon-signed-rank"],
    verified: true,
    pythonCode: `
# a and b are paired 1D arrays: each position i is the same subject/unit measured twice
# (e.g., pre vs post, or condition A vs condition B), so length(a) == length(b).
t_paired, p_val = scipy.stats.ttest_rel(a, b)
`.trim(),
    rCode: `
# a and b are paired numeric vectors: each position i is the same subject/unit measured twice
# (e.g., pre vs post, or condition A vs condition B), so length(a) == length(b).
t_paired <- t.test(a, b, paired = TRUE)
    `.trim(),
    rules: {
      requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "paired" },
      boosts: {
        normality: { yes: 3, unsure: 1 },
        stance: { parametric: 2, unsure: 1 },
      },
    },
  },
  {
    id: "one-way-anova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/One-way_analysis_of_variance",
    name: "One-Way ANOVA",
    description: "Tests whether there are statistically significant differences between the means of three or more independent groups.",
    assumptions: ["Normal distribution in each group", "Equal variances (homoscedasticity)", "Independent observations"],
    whenToUse: ["Comparing 3+ group means", "One categorical predictor", "Continuous outcome"],
    alternatives: ["Kruskal-Wallis H test (non-parametric)", "Welch's ANOVA (unequal variances)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["kruskal-wallis", "welch-anova", "bayesian-anova"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 3, unsure: 1 },
      equalVar: { yes: 3, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "two-way-anova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Two-way_analysis_of_variance",
    name: "Two-Way ANOVA",
    description: "Tests the effect of two independent categorical variables on a continuous outcome, including their interaction.",
    assumptions: ["Normal distribution", "Equal variances", "Independent observations", "No significant outliers"],
    whenToUse: ["Two categorical predictors", "Factorial experimental design", "Testing interaction effects"],
    alternatives: ["Robust ANOVA", "Aligned ranks transformation"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "multiple categorical",
    design: "factorial",
    level: "intermediate",
    alternativeLinks: ["linear-mixed-model", "manova"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      equalVar: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "repeated-measures-anova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Repeated_measures_design",
    name: "Repeated Measures ANOVA",
    description: "Tests differences across multiple time points or conditions for the same subjects.",
    assumptions: ["Sphericity", "Normal distribution", "No significant outliers"],
    whenToUse: ["Multiple measurements on same subjects", "Longitudinal within-subject design", "Before-during-after comparisons"],
    alternatives: ["Friedman test (non-parametric)", "Mixed-effects models"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "intermediate",
    alternativeLinks: ["friedman-test", "linear-mixed-model"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "repeated" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  // Group Comparison - Non-parametric
  {
    id: "mann-whitney",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test",
    name: "Mann-Whitney U Test",
    description: "Non-parametric test that compares distributions of two independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Non-normal distributions", "Ordinal data", "Small sample sizes"],
    alternatives: ["Independent t-test (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "ordinal",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["t-test-independent", "permutation-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", nGroups: "2", sampleStructure: "independent" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  {
    id: "wilcoxon-signed-rank",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Wilcoxon_signed-rank_test",
    name: "Wilcoxon Signed-Rank Test",
    description: "Non-parametric test for comparing two related samples or repeated measurements.",
    assumptions: ["Paired observations", "Ordinal or continuous outcome", "Symmetric distribution of differences"],
    whenToUse: ["Paired data with non-normal differences", "Ordinal outcomes", "Before-after comparisons"],
    alternatives: ["Paired t-test (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "ordinal",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "basic",
    alternativeLinks: ["paired-t-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", nGroups: "2", sampleStructure: "paired" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  {
    id: "kruskal-wallis",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_test",
    name: "Kruskal-Wallis H Test",
    description: "Non-parametric alternative to one-way ANOVA for comparing three or more independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Comparing 3+ groups with non-normal data", "Ordinal outcomes", "Unequal group sizes"],
    alternatives: ["One-way ANOVA (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "ordinal",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["one-way-anova", "dunn-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  {
    id: "friedman-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Friedman_test",
    name: "Friedman Test",
    description: "Non-parametric alternative to repeated measures ANOVA for ordinal or non-normal data.",
    assumptions: ["Related samples", "Ordinal or continuous outcome", "Same subjects across conditions"],
    whenToUse: ["Repeated measures with non-normal data", "Ordinal outcomes", "Blocked designs"],
    alternatives: ["Repeated measures ANOVA (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "ordinal",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "intermediate",
    alternativeLinks: ["repeated-measures-anova"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", nGroups: "3plus", sampleStructure: "repeated" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      normality: { no: 3, unsure: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  // Relationship/Correlation
  {
    id: "pearson-correlation",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Pearson_correlation_coefficient",
    name: "Pearson Correlation",
    description: "Measures the linear relationship between two continuous variables.",
    assumptions: ["Linear relationship", "Bivariate normality", "No outliers", "Continuous variables"],
    whenToUse: ["Measuring linear association", "Both variables continuous", "Normally distributed data"],
    alternatives: ["Spearman correlation (non-parametric)", "Kendall's tau (ordinal)"],
    methodFamily: "Parametric",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "continuous",
    predictorStructure: "single continuous",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["spearman-correlation", "kendall-tau"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "spearman-correlation",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient",
    name: "Spearman Rank Correlation",
    description: "Non-parametric measure of monotonic relationship between two variables.",
    assumptions: ["Monotonic relationship", "Ordinal or continuous data", "Independent observations"],
    whenToUse: ["Non-linear monotonic relationships", "Ordinal data", "Outliers present"],
    alternatives: ["Pearson correlation (parametric)", "Kendall's tau"],
    methodFamily: "Nonparametric",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "ordinal",
    predictorStructure: "single continuous",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["pearson-correlation", "kendall-tau"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 2, ordinal: 3 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  {
    id: "partial-correlation",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Partial_correlation",
    name: "Partial Correlation",
    description: "Measures association between two variables while controlling for one or more other variables.",
    assumptions: ["Linear relationships", "No multicollinearity", "Continuous variables"],
    whenToUse: ["Controlling for confounders", "Isolating relationships", "Multiple predictors"],
    alternatives: ["Multiple regression", "Path analysis"],
    methodFamily: "Parametric",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "continuous",
    predictorStructure: "multiple continuous",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["multiple-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  // Regression
  {
    id: "linear-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Linear_regression",
    name: "Linear Regression",
    description: "Models the relationship between a continuous outcome and one or more predictors.",
    assumptions: ["Linear relationship", "Normal residuals", "Homoscedasticity", "Independence of errors"],
    whenToUse: ["Predicting continuous outcomes", "Multiple predictors", "Quantifying relationships"],
    alternatives: ["Robust regression (outliers)", "Quantile regression"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "continuous",
    predictorStructure: "single continuous",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["multiple-regression", "robust-regression", "bayesian-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",  
    rules: {
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  },
  },
  {
    id: "multiple-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Linear_regression",
    name: "Multiple Linear Regression",
    description: "Models relationship between continuous outcome and multiple predictors simultaneously.",
    assumptions: ["Linear relationships", "Normal residuals", "No multicollinearity", "Homoscedasticity"],
    whenToUse: ["Multiple predictors", "Controlling for confounders", "Prediction with covariates"],
    alternatives: ["Ridge/Lasso regression", "Partial least squares"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["linear-regression", "lasso-ridge", "elastic-net"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  },
  },
  {
    id: "logistic-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Logistic_regression",
    name: "Logistic Regression",
    description: "Models the probability of a binary outcome based on one or more predictors.",
    assumptions: ["Binary outcome", "Independence of observations", "No multicollinearity", "Linear relationship with log-odds"],
    whenToUse: ["Binary classification", "Odds ratio estimation", "Multiple predictors"],
    alternatives: ["Probit regression", "Discriminant analysis"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "binary",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["probit-regression", "random-forest", "svm"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "binary" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  },
  },
  {
    id: "poisson-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Poisson_regression",
    name: "Poisson Regression",
    description: "Models count data as a function of predictors, assuming counts follow a Poisson distribution.",
    assumptions: ["Count outcome", "Mean equals variance", "Independence", "Log-linear relationship"],
    whenToUse: ["Count outcomes", "Rate data", "Event frequencies"],
    alternatives: ["Negative binomial regression (overdispersion)", "Zero-inflated models"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "count",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["negative-binomial", "zero-inflated-poisson"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  },
  },
  {
    id: "ordinal-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Ordinal_regression",
    name: "Ordinal Logistic Regression",
    description: "Models ordinal outcomes with three or more ordered categories.",
    assumptions: ["Ordinal outcome", "Proportional odds", "Independence"],
    whenToUse: ["Ordinal outcomes (Likert scales)", "Ranked categories", "Multiple predictors"],
    alternatives: ["Multinomial regression", "Cumulative link models"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "ordinal",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["logistic-regression", "multinomial-logistic"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "ordinal" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
      mixedEffects: { no: 1 },
    },
  },
  },
  // Categorical Analysis
  {
    id: "chi-square",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Chi-squared_test",
    name: "Chi-Square Test of Independence",
    description: "Tests whether there is a significant association between two categorical variables.",
    assumptions: ["Expected cell count >= 5 in 80% of cells", "Independent observations", "Categorical variables"],
    whenToUse: ["Testing association between categorical variables", "Contingency tables", "Independence testing"],
    alternatives: ["Fisher's exact test (small samples)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["fisher-exact", "cramers-v"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { tableType: "rxc" },
    boosts: {
      goal: { categorical_assoc: 3, compare: 3 },
      tableType: { rxc: 3 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "chi-square-2x2",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Chi-squared_test",
    name: "Chi-Square Test (2x2)",
    description: "Tests association between two binary variables (large sample).",
    assumptions: ["Expected cell count >= 5", "Independent observations", "2x2 table"],
    whenToUse: ["Testing association in 2x2 tables", "Sample size sufficient"],
    alternatives: ["Fisher's exact test (small samples)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["fisher-exact", "mcnemar-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { tableType: "2x2" },
    boosts: {
      goal: { categorical_assoc: 3, compare: 3 },
      tableType: { "2x2": 3 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "fisher-exact",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Fisher%27s_exact_test",
    name: "Fisher's Exact Test",
    description: "Exact test for association in 2x2 contingency tables, especially with small samples.",
    assumptions: ["2x2 table", "Fixed marginals", "Independent observations"],
    whenToUse: ["Small sample sizes", "Expected counts < 5", "2x2 tables"],
    alternatives: ["Chi-square test (larger samples)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["chi-square"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { tableType: "2x2" },
    boosts: {
      goal: { categorical_assoc: 3, compare: 3 },
      tableType: { "2x2": 3 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "mcnemar-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/McNemar%27s_test",
    name: "McNemar's Test",
    description: "Tests for differences in paired proportions or matched case-control studies.",
    assumptions: ["Paired binary data", "Matched samples", "Sufficient discordant pairs"],
    whenToUse: ["Before-after binary outcomes", "Matched pairs", "Diagnostic test comparison"],
    alternatives: ["Cochran's Q test (3+ conditions)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "binary",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "intermediate",
    alternativeLinks: ["cochran-q"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "categorical_assoc", tableType: "paired_binary_2" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  },
  },
  // Mixed/Multilevel Models
  {
    id: "linear-mixed-model",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Linear_mixed-effects_model",
    name: "Linear Mixed Model",
    description: "Models continuous outcomes with both fixed and random effects for hierarchical/clustered data.",
    assumptions: ["Normal residuals", "Linear relationships", "Random effects normally distributed"],
    whenToUse: ["Clustered/nested data", "Repeated measures", "Unbalanced designs"],
    alternatives: ["Generalized estimating equations", "Hierarchical Bayesian models"],
    methodFamily: "Mixed Models",
    category: "Mixed Models",
    categoryId: "mixed",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["glmm", "repeated-measures-anova"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", mixedEffects: "yes" },
    boosts: {
      outcomeScale: { continuous: 3 },
      sampleStructure: { clustered: 3, repeated: 2 },
      modelingFocus: { inference: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "glmm",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Generalized_linear_mixed_model",
    name: "Generalized Linear Mixed Model",
    description: "Extends GLM to include random effects for non-normal outcomes with clustering.",
    assumptions: ["Appropriate link function", "Random effects specification", "Conditional independence"],
    whenToUse: ["Non-normal outcomes with clustering", "Binary/count data in hierarchical structures"],
    alternatives: ["GEE", "Bayesian hierarchical models"],
    methodFamily: "Mixed Models",
    category: "Mixed Models",
    categoryId: "mixed",
    outcomeScale: "binary",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["linear-mixed-model", "gee"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", mixedEffects: "yes" },
    boosts: {
      outcomeScale: { binary: 3, count: 3, ordinal: 2 },
      sampleStructure: { clustered: 3, repeated: 2 },
      modelingFocus: { inference: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  // Time Series
  {
    id: "arima",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Autoregressive_integrated_moving_average",
    name: "ARIMA Model",
    description: "Autoregressive integrated moving average model for time series forecasting.",
    assumptions: ["Stationarity (after differencing)", "No seasonality (or use SARIMA)", "Constant variance"],
    whenToUse: ["Time series forecasting", "Trend modeling", "Autocorrelated data"],
    alternatives: ["Exponential smoothing", "Prophet", "State-space models"],
    methodFamily: "Time-series",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["exponential-smoothing", "prophet", "var"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "exponential-smoothing",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Exponential_smoothing",
    name: "Exponential Smoothing",
    description: "Weighted moving average methods for time series forecasting with trend and seasonality.",
    assumptions: ["Regular time intervals", "Stationary error variance"],
    whenToUse: ["Short-term forecasting", "Trend and seasonality", "Simpler interpretation"],
    alternatives: ["ARIMA", "Theta method"],
    methodFamily: "Time-series",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["arima", "prophet"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  // Survival Analysis
  {
    id: "kaplan-meier",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kaplan%E2%80%93Meier_estimator",
    name: "Kaplan-Meier Estimator",
    description: "Non-parametric estimator of survival function from time-to-event data.",
    assumptions: ["Independent censoring", "Well-defined time origin", "No competing risks (or adjust)"],
    whenToUse: ["Estimating survival curves", "Handling censored data", "Descriptive survival analysis"],
    alternatives: ["Nelson-Aalen estimator", "Parametric survival models"],
    methodFamily: "Survival",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "none",
    design: "longitudinal",
    level: "intermediate",
    alternativeLinks: ["log-rank-test", "cox-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "curve" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "log-rank-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Logrank_test",
    name: "Log-Rank Test",
    description: "Compares survival distributions between two or more groups.",
    assumptions: ["Proportional hazards", "Independent censoring", "Non-informative censoring"],
    whenToUse: ["Comparing survival curves", "Clinical trial endpoints", "Time-to-event comparisons"],
    alternatives: ["Wilcoxon-Gehan test", "Cox regression"],
    methodFamily: "Survival",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "single categorical",
    design: "longitudinal",
    level: "intermediate",
    alternativeLinks: ["kaplan-meier", "cox-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "compare" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "cox-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Proportional_hazards_model",
    name: "Cox Proportional Hazards",
    description: "Semi-parametric regression model for time-to-event data with covariates.",
    assumptions: ["Proportional hazards", "Independent censoring", "Linear covariate effects on log-hazard"],
    whenToUse: ["Survival with covariates", "Hazard ratio estimation", "Adjusting for confounders"],
    alternatives: ["Accelerated failure time models", "Parametric survival models"],
    methodFamily: "Survival",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["kaplan-meier", "accelerated-failure-time", "random-survival-forest"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "regression" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  // Unsupervised Learning
  {
    id: "kmeans",
    wikipediaUrl: "https://en.wikipedia.org/wiki/K-means_clustering",
    name: "K-Means Clustering",
    description: "Partitions observations into k clusters by minimizing within-cluster variance.",
    assumptions: ["Spherical clusters", "Similar cluster sizes", "Numeric features"],
    whenToUse: ["Finding natural groupings", "Customer segmentation", "Pattern discovery"],
    alternatives: ["Hierarchical clustering", "DBSCAN", "Gaussian mixtures"],
    methodFamily: "Machine Learning",
    category: "Clustering",
    categoryId: "clustering",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["hierarchical-clustering", "dbscan", "gaussian-mixture"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "hierarchical-clustering",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Hierarchical_clustering",
    name: "Hierarchical Clustering",
    description: "Builds a tree of clusters using agglomerative or divisive approaches.",
    assumptions: ["Meaningful distance metric", "Appropriate linkage method"],
    whenToUse: ["Exploring cluster hierarchy", "Dendrogram visualization", "Unknown number of clusters"],
    alternatives: ["K-means", "DBSCAN"],
    methodFamily: "Machine Learning",
    category: "Clustering",
    categoryId: "clustering",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["kmeans", "dbscan"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "pca",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Principal_component_analysis",
    name: "Principal Component Analysis",
    description: "Reduces dimensionality by finding orthogonal directions of maximum variance.",
    assumptions: ["Linear relationships", "Continuous variables", "Standardized features"],
    whenToUse: ["Dimension reduction", "Feature extraction", "Visualization of high-dimensional data"],
    alternatives: ["Factor analysis", "t-SNE", "UMAP"],
    methodFamily: "Multivariate",
    category: "Dimension Reduction",
    categoryId: "dimension",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["factor-analysis", "tsne", "umap"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "dimred" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "factor-analysis",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Factor_analysis",
    name: "Factor Analysis",
    description: "Identifies latent factors underlying observed variables.",
    assumptions: ["Linear relationships", "Multivariate normality", "Sufficient sample size"],
    whenToUse: ["Scale development", "Latent construct identification", "Data reduction with theory"],
    alternatives: ["PCA", "Structural equation modeling"],
    methodFamily: "Multivariate",
    category: "Dimension Reduction",
    categoryId: "dimension",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["pca"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "dimred" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  // Machine Learning
  {
    id: "random-forest",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Random_forest",
    name: "Random Forest",
    description: "Ensemble of decision trees for classification or regression with improved accuracy.",
    assumptions: ["No strict distributional assumptions", "Sufficient training data"],
    whenToUse: ["Complex non-linear relationships", "Feature importance", "Robust predictions"],
    alternatives: ["Gradient boosting", "Single decision tree", "Neural networks"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["gradient-boosting", "xgboost", "decision-tree"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "gradient-boosting",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Gradient_boosting",
    name: "Gradient Boosting",
    description: "Sequentially builds weak learners to minimize prediction errors.",
    assumptions: ["Sufficient training data", "Proper hyperparameter tuning"],
    whenToUse: ["High prediction accuracy", "Structured/tabular data", "Competitions"],
    alternatives: ["Random forest", "XGBoost", "LightGBM"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["random-forest", "xgboost", "lightgbm"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "lasso-ridge",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Regularization_(mathematics)#Regression",
    name: "Lasso/Ridge Regression",
    description: "Regularized regression methods that shrink coefficients to prevent overfitting.",
    assumptions: ["Linear relationships", "Standardized predictors recommended"],
    whenToUse: ["High-dimensional data", "Multicollinearity", "Variable selection (Lasso)"],
    alternatives: ["Elastic net", "Principal components regression"],
    methodFamily: "Regression-based",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple continuous",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["elastic-net", "multiple-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model" },
    boosts: {
      outcomeScale: { continuous: 3 },
      modelingFocus: { inference: 1, prediction: 2 },
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  // Resampling/Bootstrap
  {
    id: "bootstrap",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bootstrapping_(statistics)",
    name: "Bootstrap",
    description: "Resampling method to estimate sampling distributions and confidence intervals.",
    assumptions: ["Representative sample", "Independent observations"],
    whenToUse: ["Unknown sampling distribution", "Complex statistics", "Small samples"],
    alternatives: ["Jackknife", "Permutation tests"],
    methodFamily: "Resampling",
    category: "Resampling",
    categoryId: "resampling",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["permutation-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      stance: { robust: 3, nonparametric: 2, unsure: 1 },
      goal: { estimate: 3, compare: 1 },
    },
    kind: "resampling",
  },
  },
  {
    id: "permutation-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Permutation_test",
    name: "Permutation Test",
    description: "Non-parametric test using random permutations to generate null distribution.",
    assumptions: ["Exchangeability under null", "Independent observations"],
    whenToUse: ["No distributional assumptions", "Small samples", "Complex test statistics"],
    alternatives: ["Bootstrap", "Parametric tests"],
    methodFamily: "Permutation-based",
    category: "Resampling",
    categoryId: "resampling",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["bootstrap", "mann-whitney"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      stance: { nonparametric: 3, robust: 2, unsure: 1 },
      goal: { estimate: 3, compare: 1 },
    },
    kind: "resampling",
  },
  },
  // Power Analysis
  {
    id: "power-analysis",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Statistical_power",
    name: "Power Analysis",
    description: "Calculates required sample size or statistical power for detecting an effect.",
    assumptions: ["Specified effect size", "Known alpha level", "Appropriate test selection"],
    whenToUse: ["Study planning", "Grant applications", "Sample size justification"],
    alternatives: ["Simulation-based power", "Bayesian sample size"],
    methodFamily: "Planning",
    category: "Study Planning",
    categoryId: "planning",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: [],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "power" },
    kind: "planning",
  },
  },
  
  // === ASSUMPTION & DIAGNOSTIC TESTS ===
  // Equal Variance Tests
  {
    id: "levene-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Levene%27s_test",
    name: "Levene's Test",
    description: "Tests the null hypothesis that all groups have equal variances. More robust to non-normality than Bartlett's test.",
    assumptions: ["Independent samples", "Continuous or ordinal data"],
    whenToUse: ["Checking homogeneity of variance before ANOVA", "Non-normal data", "Robust variance testing"],
    alternatives: ["Bartlett's test (normal data)", "Brown-Forsythe test", "Fligner-Killeen test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["bartlett-test", "brown-forsythe", "fligner-killeen"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "bartlett-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bartlett%27s_test",
    name: "Bartlett's Test",
    description: "Tests equality of variances across groups, sensitive to departures from normality.",
    assumptions: ["Normal distribution in each group", "Independent samples"],
    whenToUse: ["Variance homogeneity testing", "Normally distributed data", "Before ANOVA"],
    alternatives: ["Levene's test (non-normal)", "Brown-Forsythe test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["levene-test", "brown-forsythe"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "brown-forsythe",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Brown%E2%80%93Forsythe_test",
    name: "Brown-Forsythe Test",
    description: "Robust test for equality of variances using deviations from group medians.",
    assumptions: ["Independent samples", "Continuous data"],
    whenToUse: ["Variance testing with skewed data", "Outlier-resistant variance comparison"],
    alternatives: ["Levene's test", "Bartlett's test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["levene-test", "bartlett-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "fligner-killeen",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Fligner%E2%80%93Killeen_test",
    name: "Fligner-Killeen Test",
    description: "Non-parametric test for homogeneity of variances, highly robust to non-normality.",
    assumptions: ["Independent samples", "Ordinal or continuous data"],
    whenToUse: ["Severe non-normality", "Robust variance testing", "Small samples"],
    alternatives: ["Levene's test", "Bartlett's test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["levene-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "hartley-fmax",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Hartley%27s_test",
    name: "Hartley's F-max Test",
    description: "Quick test for variance homogeneity using ratio of largest to smallest group variance.",
    assumptions: ["Equal sample sizes", "Normal distribution", "Independent samples"],
    whenToUse: ["Quick variance ratio check", "Balanced designs", "Preliminary analysis"],
    alternatives: ["Levene's test", "Bartlett's test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["levene-test", "bartlett-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  // Normality Tests
  {
    id: "shapiro-wilk",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Shapiro%E2%80%93Wilk_test",
    name: "Shapiro-Wilk Test",
    description: "Tests whether a sample comes from a normally distributed population. Considered one of the most powerful normality tests.",
    assumptions: ["Sample size typically between 3-5000", "Independent observations"],
    whenToUse: ["Checking normality assumption", "Small to moderate samples", "Before parametric tests"],
    alternatives: ["Kolmogorov-Smirnov", "Anderson-Darling", "D'Agostino-Pearson"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["kolmogorov-smirnov", "anderson-darling", "dagostino-pearson"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, model: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "kolmogorov-smirnov",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test",
    name: "Kolmogorov-Smirnov Test",
    description: "Compares sample distribution to a reference distribution (often normal) or compares two samples.",
    assumptions: ["Continuous distribution", "Independent observations"],
    whenToUse: ["Testing any distributional assumption", "Comparing two distributions", "Large samples"],
    alternatives: ["Shapiro-Wilk (normality)", "Anderson-Darling"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["shapiro-wilk", "anderson-darling"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "anderson-darling",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Anderson%E2%80%93Darling_test",
    name: "Anderson-Darling Test",
    description: "Tests whether a sample comes from a specified distribution, with more weight on tails than KS test.",
    assumptions: ["Continuous distribution", "Known reference distribution"],
    whenToUse: ["Normality testing with tail sensitivity", "Distribution fitting", "Quality control"],
    alternatives: ["Shapiro-Wilk", "Kolmogorov-Smirnov"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["shapiro-wilk", "kolmogorov-smirnov"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "dagostino-pearson",
    wikipediaUrl: "https://en.wikipedia.org/wiki/D%27Agostino%27s_K-squared_test",
    name: "D'Agostino-Pearson Test",
    description: "Omnibus test combining skewness and kurtosis to test for normality.",
    assumptions: ["Sample size > 20", "Independent observations"],
    whenToUse: ["Moderate to large samples", "Detecting non-normality from skewness/kurtosis"],
    alternatives: ["Shapiro-Wilk", "Jarque-Bera"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["shapiro-wilk"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, model: 1, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  // Regression Diagnostics
  {
    id: "durbin-watson",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Durbin%E2%80%93Watson_statistic",
    name: "Durbin-Watson Test",
    description: "Tests for autocorrelation in residuals from regression analysis.",
    assumptions: ["Linear regression model", "First-order autocorrelation"],
    whenToUse: ["Time series regression", "Detecting serial correlation", "Model diagnostics"],
    alternatives: ["Breusch-Godfrey test", "Ljung-Box test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["ljung-box", "breusch-pagan"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "breusch-pagan",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Breusch%E2%80%93Pagan_test",
    name: "Breusch-Pagan Test",
    description: "Tests for heteroscedasticity in regression residuals.",
    assumptions: ["Linear regression model", "Residuals tested against predictors"],
    whenToUse: ["Checking constant variance", "Regression diagnostics", "Before inference"],
    alternatives: ["White's test", "Goldfeld-Quandt test"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["durbin-watson"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  {
    id: "vif",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Variance_inflation_factor",
    name: "Variance Inflation Factor (VIF)",
    description: "Quantifies multicollinearity in regression by measuring how much variance is inflated.",
    assumptions: ["Multiple regression context", "Linear relationships"],
    whenToUse: ["Detecting multicollinearity", "Variable selection", "Regression diagnostics"],
    alternatives: ["Condition number", "Tolerance", "Correlation matrix"],
    methodFamily: "Diagnostic",
    category: "Assumption Testing",
    categoryId: "assumption",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: [],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { model: 2, utilities: 3 },
    },
    kind: "assumption",
  },
  },
  
  // === POST-HOC TESTS ===
  {
    id: "tukey-hsd",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Tukey%27s_range_test",
    name: "Tukey's HSD",
    description: "Post-hoc test for pairwise comparisons after ANOVA, controlling family-wise error rate.",
    assumptions: ["Equal sample sizes (approximate)", "Equal variances", "Normal distribution"],
    whenToUse: ["All pairwise comparisons after ANOVA", "Balanced designs", "Conservative control"],
    alternatives: ["Games-Howell (unequal variances)", "Bonferroni", "Scheffé"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["bonferroni", "games-howell", "scheffe-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      equalVar: { yes: 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "bonferroni",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bonferroni_correction",
    name: "Bonferroni Correction",
    description: "Simple adjustment for multiple comparisons by dividing alpha by number of tests.",
    assumptions: ["Independent or dependent tests", "Any test statistic"],
    whenToUse: ["Few comparisons", "Conservative correction", "General multiple testing"],
    alternatives: ["Holm-Bonferroni", "Benjamini-Hochberg", "Tukey HSD"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["holm-bonferroni", "tukey-hsd", "benjamini-hochberg"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "holm-bonferroni",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Holm%E2%80%93Bonferroni_method",
    name: "Holm-Bonferroni Method",
    description: "Step-down procedure that is uniformly more powerful than Bonferroni while controlling FWER.",
    assumptions: ["Any test statistic", "Ordered p-values"],
    whenToUse: ["Multiple comparisons", "More power than Bonferroni", "Sequential testing"],
    alternatives: ["Bonferroni", "Hochberg", "Benjamini-Hochberg"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["bonferroni", "benjamini-hochberg"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "benjamini-hochberg",
    wikipediaUrl: "https://en.wikipedia.org/wiki/False_discovery_rate",
    name: "Benjamini-Hochberg (FDR)",
    description: "Controls false discovery rate rather than family-wise error rate, more powerful for many tests.",
    assumptions: ["Independent or positively dependent tests", "Many hypotheses"],
    whenToUse: ["High-throughput testing", "Genomics", "Exploratory analysis"],
    alternatives: ["Bonferroni (FWER)", "q-value", "Storey's method"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["bonferroni", "holm-bonferroni"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "dunnett-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Dunnett%27s_test",
    name: "Dunnett's Test",
    description: "Compares multiple treatment groups to a single control group.",
    assumptions: ["Normal distribution", "Equal variances", "One control group"],
    whenToUse: ["Treatment vs control comparisons", "Not comparing treatments", "Drug trials"],
    alternatives: ["Tukey HSD (all pairs)", "Bonferroni"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["tukey-hsd"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "games-howell",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Post_hoc_analysis",
    name: "Games-Howell Test",
    description: "Post-hoc test for unequal variances and/or unequal sample sizes.",
    assumptions: ["Does not assume equal variances", "Normal distribution"],
    whenToUse: ["Heterogeneous variances", "Unequal sample sizes", "After Welch's ANOVA"],
    alternatives: ["Tukey HSD (equal variances)", "Tamhane's T2"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["tukey-hsd", "scheffe-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      equalVar: { no: 3, unsure: 1 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "scheffe-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Scheff%C3%A9%27s_method",
    name: "Scheffé's Test",
    description: "Most conservative post-hoc test, allows any linear contrast of means.",
    assumptions: ["Normal distribution", "Equal variances"],
    whenToUse: ["Complex contrasts", "Post-hoc hypothesis generation", "Maximum protection"],
    alternatives: ["Tukey HSD", "Bonferroni"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["tukey-hsd", "games-howell"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 1, utilities: 3 },
      nGroups: { "3plus": 2 },
    },
    kind: "posthoc",
  },
  },
  {
    id: "dunn-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kruskal%E2%80%93Wallis_test",
    name: "Dunn's Test",
    description: "Non-parametric post-hoc test for pairwise comparisons after Kruskal-Wallis.",
    assumptions: ["Ordinal or continuous data", "Independent samples"],
    whenToUse: ["After Kruskal-Wallis", "Non-parametric multiple comparisons"],
    alternatives: ["Conover-Iman test", "Nemenyi test"],
    methodFamily: "Multiple Comparison",
    category: "Post-hoc Tests",
    categoryId: "posthoc",
    outcomeScale: "ordinal",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["kruskal-wallis"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3 },
      nGroups: { "3plus": 2 },
      stance: { nonparametric: 3 },
    },
    kind: "posthoc",
  },
  },
  
  // === ADDITIONAL GROUP COMPARISON ===
  {
    id: "welch-t-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Welch%27s_t-test",
    name: "Welch's t-Test",
    description: "Modification of t-test that does not assume equal variances between groups.",
    assumptions: [
      "Independent obervations within and between groups",
      "Numeric outcome",
      "Difference in means ~ normal (or n large; no extreme outliers)"
    ],
    whenToUse: [
      "Compare means of two independent groups",
      "Variances and/or sample sizes differ",
      "Data roughly symmetric or n moderately large"
    ],
    alternatives: ["Student's t-test (equal variances)", "Mann-Whitney U"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["t-test-independent", "mann-whitney"],
    verified: false,
    pythonCode: `
# a and b are 1D arrays of observations
t_welch, p_val = scipy.stats.ttest_ind(a, b, equal_var=False)
    `.trim(),
    rCode: `
# a and b are numeric vectors of observations
t_welch <- t.test(a, b, var.equal = FALSE)
    `.trim(),
    rules: {
      requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
      boosts: {
        normality: { yes: 2, unsure: 1 },
        equalVar: { no: 3, unsure: 2 },
        stance: { parametric: 2, robust: 1, unsure: 2 },
      },
    },
  },
  {
    id: "welch-anova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Welch%27s_ANOVA",
    name: "Welch's ANOVA",
    description: "Robust alternative to one-way ANOVA when variances are unequal across groups.",
    assumptions: ["Normal distribution", "Independent samples", "Unequal variances allowed"],
    whenToUse: ["Heterogeneous variances", "Unbalanced designs", "Three or more groups"],
    alternatives: ["One-way ANOVA", "Brown-Forsythe ANOVA", "Kruskal-Wallis"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["one-way-anova", "kruskal-wallis"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "continuous", nGroups: "3plus", sampleStructure: "independent" },
    boosts: {
      normality: { yes: 2, unsure: 1 },
      equalVar: { no: 3, unsure: 2 },
      stance: { parametric: 2, robust: 1, unsure: 2 },
    },
  },
  },
  {
    id: "ancova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Analysis_of_covariance",
    name: "ANCOVA",
    description: "Analysis of covariance combining ANOVA with regression to control for covariates.",
    assumptions: ["Homogeneity of regression slopes", "Linear relationship with covariate", "Normal residuals"],
    whenToUse: ["Adjusting for confounders", "Pre-test scores as covariate", "Increasing power"],
    alternatives: ["Mixed models", "Multiple regression"],
    methodFamily: "Parametric",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "continuous",
    predictorStructure: "mixed",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["multiple-regression", "linear-mixed-model"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "continuous", sampleStructure: "independent" },
    boosts: {
      nGroups: { "2": 2, "3plus": 2 },
      normality: { yes: 2, unsure: 1 },
      equalVar: { yes: 2, unsure: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "manova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Multivariate_analysis_of_variance",
    name: "MANOVA",
    description: "Multivariate ANOVA testing group differences on multiple dependent variables simultaneously.",
    assumptions: ["Multivariate normality", "Homogeneity of covariance matrices", "Independence"],
    whenToUse: ["Multiple related outcomes", "Reducing Type I error", "Examining patterns"],
    alternatives: ["Separate ANOVAs with correction", "Discriminant analysis"],
    methodFamily: "Multivariate",
    category: "Group Comparison",
    categoryId: "comparison",
    outcomeScale: "multivariate",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "advanced",
    alternativeLinks: ["two-way-anova", "discriminant-analysis"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "compare", outcomeScale: "multivariate", sampleStructure: "independent" },
    boosts: {
      nGroups: { "2": 2, "3plus": 2 },
      normality: { yes: 2 },
      equalVar: { yes: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  
  // === ADDITIONAL CORRELATION ===
  {
    id: "kendall-tau",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kendall_rank_correlation_coefficient",
    name: "Kendall's Tau",
    description: "Non-parametric measure of rank correlation, more robust than Spearman for small samples.",
    assumptions: ["Ordinal or continuous data", "Independent observations"],
    whenToUse: ["Small samples", "Many tied ranks", "Robust correlation estimate"],
    alternatives: ["Spearman correlation", "Pearson correlation"],
    methodFamily: "Nonparametric",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "ordinal",
    predictorStructure: "single continuous",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["spearman-correlation", "pearson-correlation"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { ordinal: 3, continuous: 1 },
      stance: { nonparametric: 3, unsure: 1 },
    },
  },
  },
  {
    id: "point-biserial",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient",
    name: "Point-Biserial Correlation",
    description: "Measures correlation between a continuous variable and a dichotomous variable.",
    assumptions: ["One continuous, one binary variable", "Normal distribution in groups"],
    whenToUse: ["Binary-continuous relationships", "Item analysis", "Effect size for t-test"],
    alternatives: ["Biserial correlation", "Logistic regression"],
    methodFamily: "Parametric",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["pearson-correlation", "t-test-independent"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "intraclass-correlation",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Intraclass_correlation",
    name: "Intraclass Correlation (ICC)",
    description: "Measures reliability or agreement for observations that are organized into groups.",
    assumptions: ["Grouped/clustered data", "Ratio or interval scale"],
    whenToUse: ["Inter-rater reliability", "Test-retest reliability", "Cluster analysis"],
    alternatives: ["Cohen's kappa (categorical)", "Pearson correlation"],
    methodFamily: "Reliability",
    category: "Correlation",
    categoryId: "correlation",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "paired/repeated measures",
    level: "intermediate",
    alternativeLinks: ["cohens-kappa", "linear-mixed-model"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "associate" },
    boosts: {
      outcomeScale: { continuous: 3 },
      sampleStructure: { paired: 2, repeated: 2 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  
  // === ADDITIONAL CATEGORICAL ===
  {
    id: "cochran-q",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cochran%27s_Q_test",
    name: "Cochran's Q Test",
    description: "Extension of McNemar test for comparing three or more matched proportions.",
    assumptions: ["Binary outcome", "Matched samples", "Three or more conditions"],
    whenToUse: ["Repeated measures binary data", "Multiple raters", "Before-during-after binary"],
    alternatives: ["McNemar test (2 conditions)", "Friedman test"],
    methodFamily: "Nonparametric",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "binary",
    predictorStructure: "single categorical",
    design: "paired/repeated measures",
    level: "intermediate",
    alternativeLinks: ["mcnemar-test", "friedman-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "categorical_assoc", tableType: "paired_binary_3plus" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "cramers-v",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V",
    name: "Cramér's V",
    description: "Measure of association between two categorical variables, normalized chi-square.",
    assumptions: ["Nominal variables", "Contingency table"],
    whenToUse: ["Effect size for chi-square", "Comparing association strength", "Nominal data"],
    alternatives: ["Phi coefficient (2x2)", "Contingency coefficient"],
    methodFamily: "Effect Size",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["chi-square", "cohens-kappa"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { categorical_assoc: 3, utilities: 3, estimate: 3 },
    },
    kind: "effectsize",
  },
  },
  {
    id: "cohens-kappa",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cohen%27s_kappa",
    name: "Cohen's Kappa",
    description: "Measures agreement between two raters for categorical items, adjusting for chance.",
    assumptions: ["Categorical data", "Two raters", "Same categories"],
    whenToUse: ["Inter-rater reliability", "Diagnostic agreement", "Coding reliability"],
    alternatives: ["Fleiss' kappa (3+ raters)", "ICC (continuous)"],
    methodFamily: "Reliability",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["fleiss-kappa", "intraclass-correlation"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, associate: 2, utilities: 3 },
    },
    kind: "effectsize",
  },
  },
  {
    id: "fleiss-kappa",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Fleiss%27_kappa",
    name: "Fleiss' Kappa",
    description: "Extends Cohen's kappa to measure agreement among three or more raters.",
    assumptions: ["Categorical data", "Multiple raters", "Fixed categories"],
    whenToUse: ["Multiple rater agreement", "Content analysis", "Medical diagnosis"],
    alternatives: ["Cohen's kappa (2 raters)", "Krippendorff's alpha"],
    methodFamily: "Reliability",
    category: "Categorical",
    categoryId: "categorical",
    outcomeScale: "nominal",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["cohens-kappa"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, associate: 2, utilities: 3 },
    },
    kind: "effectsize",
  },
  },
  
  // === ADDITIONAL REGRESSION ===
  {
    id: "negative-binomial",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Negative_binomial_regression",
    name: "Negative Binomial Regression",
    description: "Models count data with overdispersion (variance greater than mean).",
    assumptions: ["Count outcome", "Overdispersion present", "Log-linear relationship"],
    whenToUse: ["Overdispersed counts", "Zero-inflated alternatives", "Event count modeling"],
    alternatives: ["Poisson regression", "Zero-inflated models", "Quasi-Poisson"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "count",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["poisson-regression", "zero-inflated-poisson"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "zero-inflated-poisson",
    name: "Zero-Inflated Poisson",
    description: "Models count data with excess zeros using a two-part model.",
    assumptions: ["Count outcome", "Excess zeros", "Two processes generating data"],
    whenToUse: ["Many zeros in count data", "Structural and sampling zeros", "Two-stage process"],
    alternatives: ["Negative binomial", "Hurdle models", "Poisson regression"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "count",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "advanced",
    alternativeLinks: ["poisson-regression", "negative-binomial"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "count" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "quantile-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Quantile_regression",
    name: "Quantile Regression",
    description: "Models conditional quantiles (e.g., median) rather than the mean.",
    assumptions: ["No distributional assumptions", "Continuous outcome"],
    whenToUse: ["Non-normal outcomes", "Heterogeneous effects", "Median modeling"],
    alternatives: ["Robust regression", "Linear regression"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "advanced",
    alternativeLinks: ["linear-regression", "robust-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 2, prediction: 1 },
      stance: { robust: 3, unsure: 1 },
    },
  },
  },
  {
    id: "robust-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Robust_regression",
    name: "Robust Regression",
    description: "Regression methods resistant to outliers and violations of assumptions.",
    assumptions: ["Linear relationship", "Potential outliers or leverage points"],
    whenToUse: ["Outliers present", "Heavy-tailed errors", "Robust inference"],
    alternatives: ["Quantile regression", "M-estimation"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["linear-regression", "quantile-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "continuous" },
    boosts: {
      modelingFocus: { inference: 2, prediction: 1 },
      stance: { robust: 3, unsure: 1 },
    },
  },
  },
  {
    id: "probit-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Probit_model",
    name: "Probit Regression",
    description: "Models binary outcomes using the cumulative normal distribution function.",
    assumptions: ["Binary outcome", "Latent variable interpretation", "Independence"],
    whenToUse: ["Binary classification", "Dose-response", "Latent variable models"],
    alternatives: ["Logistic regression", "Complementary log-log"],
    methodFamily: "Regression-based",
    category: "Regression",
    categoryId: "regression",
    outcomeScale: "binary",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["logistic-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", outcomeScale: "binary" },
    boosts: {
      modelingFocus: { inference: 3, prediction: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  
  // === ADDITIONAL ML METHODS ===
  {
    id: "svm",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Support-vector_machine",
    name: "Support Vector Machine (SVM)",
    description: "Finds optimal hyperplane to separate classes, can use kernels for non-linear boundaries.",
    assumptions: ["Scaled features recommended", "Sufficient training data"],
    whenToUse: ["Binary classification", "High-dimensional data", "Clear margin of separation"],
    alternatives: ["Logistic regression", "Random forest", "Neural networks"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "binary",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["logistic-regression", "random-forest"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 3 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "xgboost",
    wikipediaUrl: "https://en.wikipedia.org/wiki/XGBoost",
    name: "XGBoost",
    description: "Optimized gradient boosting library with regularization and parallel processing.",
    assumptions: ["Sufficient training data", "Hyperparameter tuning required"],
    whenToUse: ["Structured/tabular data", "Kaggle competitions", "High accuracy needed"],
    alternatives: ["LightGBM", "CatBoost", "Random forest"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["gradient-boosting", "lightgbm", "catboost"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "lightgbm",
    wikipediaUrl: "https://en.wikipedia.org/wiki/LightGBM",
    name: "LightGBM",
    description: "Gradient boosting framework using leaf-wise tree growth for faster training.",
    assumptions: ["Large datasets", "Categorical features supported"],
    whenToUse: ["Large datasets", "Fast training needed", "Memory efficiency"],
    alternatives: ["XGBoost", "CatBoost", "Random forest"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["xgboost", "catboost"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "catboost",
    wikipediaUrl: "https://en.wikipedia.org/wiki/CatBoost",
    name: "CatBoost",
    description: "Gradient boosting with native categorical feature support and ordered boosting.",
    assumptions: ["Categorical features present", "Sufficient training data"],
    whenToUse: ["Many categorical features", "Minimal preprocessing", "Prevent overfitting"],
    alternatives: ["XGBoost", "LightGBM", "Random forest"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["xgboost", "lightgbm"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2, nominal: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "knn",
    wikipediaUrl: "https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm",
    name: "k-Nearest Neighbors (k-NN)",
    description: "Classifies or predicts based on the k closest training examples in feature space.",
    assumptions: ["Meaningful distance metric", "Scaled features", "No noise dominance"],
    whenToUse: ["Simple baseline", "Non-linear patterns", "Instance-based learning"],
    alternatives: ["SVM", "Random forest", "Decision tree"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["random-forest", "svm"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 1, binary: 2, nominal: 2 },
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "naive-bayes",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Naive_Bayes_classifier",
    name: "Naive Bayes",
    description: "Probabilistic classifier based on Bayes' theorem with independence assumption.",
    assumptions: ["Feature independence (often violated)", "Sufficient class representation"],
    whenToUse: ["Text classification", "Fast training needed", "Baseline model"],
    alternatives: ["Logistic regression", "SVM", "Random forest"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "binary",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["logistic-regression", "random-forest"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { binary: 3, nominal: 3 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "decision-tree",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Decision_tree_learning",
    name: "Decision Tree",
    description: "Tree-structured model making sequential splits based on feature values.",
    assumptions: ["No strict distributional assumptions", "Sufficient training data"],
    whenToUse: ["Interpretable model needed", "Non-linear relationships", "Feature importance"],
    alternatives: ["Random forest", "Gradient boosting", "Rule-based models"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["random-forest", "gradient-boosting"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 1, binary: 2, nominal: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "elastic-net",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Elastic_net_regularization",
    name: "Elastic Net",
    description: "Regularized regression combining L1 (Lasso) and L2 (Ridge) penalties.",
    assumptions: ["Linear relationships", "High-dimensional data possible"],
    whenToUse: ["Many correlated predictors", "Variable selection + shrinkage", "Combining Lasso and Ridge"],
    alternatives: ["Lasso", "Ridge regression", "Principal components regression"],
    methodFamily: "Regression-based",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple continuous",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["lasso-ridge", "multiple-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model" },
    boosts: {
      outcomeScale: { continuous: 3 },
      modelingFocus: { inference: 1, prediction: 2 },
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "neural-network-mlp",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Multilayer_perceptron",
    name: "Neural Network (MLP)",
    description: "Multi-layer perceptron with hidden layers for learning complex patterns.",
    assumptions: ["Sufficient training data", "Scaled features", "Hyperparameter tuning"],
    whenToUse: ["Complex non-linear patterns", "Large datasets", "Deep learning baseline"],
    alternatives: ["Random forest", "Gradient boosting", "Deep learning architectures"],
    methodFamily: "Machine Learning",
    category: "Prediction",
    categoryId: "ml",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "advanced",
    alternativeLinks: ["random-forest", "gradient-boosting"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "model", modelingFocus: "prediction" },
    boosts: {
      outcomeScale: { continuous: 2, binary: 2 },
      stance: { unsure: 1 },
    },
  },
  },
  {
    id: "dbscan",
    wikipediaUrl: "https://en.wikipedia.org/wiki/DBSCAN",
    name: "DBSCAN",
    description: "Density-based clustering that finds arbitrarily shaped clusters and identifies outliers.",
    assumptions: ["Meaningful distance metric", "Similar density clusters"],
    whenToUse: ["Unknown number of clusters", "Non-spherical clusters", "Outlier detection"],
    alternatives: ["K-means", "HDBSCAN", "OPTICS"],
    methodFamily: "Machine Learning",
    category: "Clustering",
    categoryId: "clustering",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["kmeans", "gaussian-mixture"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { nonparametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "gaussian-mixture",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Mixture_model",
    name: "Gaussian Mixture Model",
    description: "Probabilistic model assuming data comes from a mixture of Gaussian distributions.",
    assumptions: ["Gaussian clusters", "Known or estimated number of components"],
    whenToUse: ["Soft clustering", "Probabilistic assignment", "Elliptical clusters"],
    alternatives: ["K-means", "DBSCAN", "Hierarchical clustering"],
    methodFamily: "Machine Learning",
    category: "Clustering",
    categoryId: "clustering",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["kmeans", "dbscan"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "clustering" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "tsne",
    wikipediaUrl: "https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding",
    name: "t-SNE",
    description: "Non-linear dimensionality reduction technique for visualization of high-dimensional data.",
    assumptions: ["Local structure preservation", "Perplexity parameter choice"],
    whenToUse: ["Visualization", "Cluster exploration", "High-dimensional data"],
    alternatives: ["UMAP", "PCA", "MDS"],
    methodFamily: "Machine Learning",
    category: "Dimension Reduction",
    categoryId: "dimension",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["umap", "pca"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "embedding" },
    boosts: {
      stance: { nonparametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "umap",
    wikipediaUrl: "https://en.wikipedia.org/wiki/UMAP",
    name: "UMAP",
    description: "Uniform Manifold Approximation for fast non-linear dimension reduction preserving global structure.",
    assumptions: ["Manifold assumption", "Sufficient neighbors"],
    whenToUse: ["Fast visualization", "Preserving global structure", "Large datasets"],
    alternatives: ["t-SNE", "PCA", "Isomap"],
    methodFamily: "Machine Learning",
    category: "Dimension Reduction",
    categoryId: "dimension",
    outcomeScale: "multivariate",
    predictorStructure: "none",
    design: "cross-sectional",
    level: "intermediate",
    alternativeLinks: ["tsne", "pca"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "unsupervised", unsupTask: "embedding" },
    boosts: {
      stance: { nonparametric: 1, unsure: 2 },
    },
  },
  },
  
  // === ADDITIONAL TIME SERIES ===
  {
    id: "prophet",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Prophet_(software)",
    name: "Prophet",
    description: "Automated forecasting procedure by Facebook for time series with seasonality and holidays.",
    assumptions: ["Regular time intervals", "Additive/multiplicative seasonality"],
    whenToUse: ["Business forecasting", "Multiple seasonality", "Missing data/outliers"],
    alternatives: ["ARIMA", "Exponential smoothing", "Neural Prophet"],
    methodFamily: "Time-series",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["arima", "exponential-smoothing"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "forecast" },
    boosts: {
      stance: { unsure: 2 },
    },
  },
  },
  {
    id: "adf-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Augmented_Dickey%E2%80%93Fuller_test",
    name: "Augmented Dickey-Fuller Test",
    description: "Tests for unit root to determine if a time series is stationary.",
    assumptions: ["Time series data", "AR process"],
    whenToUse: ["Stationarity testing", "Before ARIMA modeling", "Cointegration analysis"],
    alternatives: ["KPSS test", "Phillips-Perron test"],
    methodFamily: "Diagnostic",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["ljung-box"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "diagnostics" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "granger-causality",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Granger_causality",
    name: "Granger Causality Test",
    description: "Tests whether one time series helps predict another (temporal precedence).",
    assumptions: ["Stationary series", "Linear relationships", "No confounders"],
    whenToUse: ["Predictive causality", "Lead-lag relationships", "VAR models"],
    alternatives: ["Cross-correlation", "Transfer entropy"],
    methodFamily: "Time-series",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "multiple continuous",
    design: "time-series",
    level: "advanced",
    alternativeLinks: ["var"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "multivariate" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "ljung-box",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Ljung%E2%80%93Box_test",
    name: "Ljung-Box Test",
    description: "Tests whether any autocorrelations in a series are non-zero.",
    assumptions: ["Time series residuals", "Specified lag order"],
    whenToUse: ["Model diagnostics", "White noise testing", "ARIMA residual check"],
    alternatives: ["Durbin-Watson", "Box-Pierce test"],
    methodFamily: "Diagnostic",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "continuous",
    predictorStructure: "none",
    design: "time-series",
    level: "intermediate",
    alternativeLinks: ["adf-test", "durbin-watson"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "diagnostics" },
    boosts: {
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "var",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Vector_autoregression",
    name: "Vector Autoregression (VAR)",
    description: "Models multiple time series where each variable depends on its own and others' past values.",
    assumptions: ["Stationary series", "Linear relationships", "Sufficient observations"],
    whenToUse: ["Multiple related time series", "Impulse response", "Forecasting systems"],
    alternatives: ["VECM (cointegrated)", "Structural VAR"],
    methodFamily: "Time-series",
    category: "Time Series",
    categoryId: "time-series",
    outcomeScale: "multivariate",
    predictorStructure: "multiple continuous",
    design: "time-series",
    level: "advanced",
    alternativeLinks: ["arima", "granger-causality"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "time_series", tsTask: "multivariate" },
    boosts: {
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  
  // === BAYESIAN METHODS ===
  {
    id: "bayesian-t-test",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bayes_factor",
    name: "Bayesian t-Test",
    description: "Bayesian alternative to t-test providing posterior probability of hypotheses.",
    assumptions: ["Prior specification", "Normal distribution"],
    whenToUse: ["Quantifying evidence for null", "Prior information available", "Uncertainty quantification"],
    alternatives: ["Frequentist t-test", "Bayesian estimation"],
    methodFamily: "Bayesian",
    category: "Bayesian Methods",
    categoryId: "bayesian",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["t-test-independent", "bayesian-anova"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { stance: "bayesian" },
    boosts: {
      goal: { compare: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
  },
  },
  {
    id: "bayesian-regression",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bayesian_linear_regression",
    name: "Bayesian Regression",
    description: "Regression with prior distributions on parameters, yielding posterior distributions.",
    assumptions: ["Prior specification", "Likelihood model"],
    whenToUse: ["Uncertainty quantification", "Prior knowledge incorporation", "Small samples"],
    alternatives: ["Frequentist regression", "Ridge/Lasso"],
    methodFamily: "Bayesian",
    category: "Bayesian Methods",
    categoryId: "bayesian",
    outcomeScale: "continuous",
    predictorStructure: "multiple mixed",
    design: "cross-sectional",
    level: "advanced",
    alternativeLinks: ["linear-regression", "multiple-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { stance: "bayesian" },
    boosts: {
      goal: { model: 3, associate: 1 },
      outcomeScale: { continuous: 2, binary: 1 },
    },
  },
  },
  {
    id: "bayesian-anova",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Bayesian_statistics",
    name: "Bayesian ANOVA",
    description: "Bayesian approach to comparing group means with Bayes factors.",
    assumptions: ["Prior specification", "Normal distribution"],
    whenToUse: ["Evidence for null hypothesis", "Prior information", "Model comparison"],
    alternatives: ["Frequentist ANOVA", "Bayesian mixed models"],
    methodFamily: "Bayesian",
    category: "Bayesian Methods",
    categoryId: "bayesian",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "intermediate",
    alternativeLinks: ["one-way-anova", "bayesian-t-test"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { stance: "bayesian" },
    boosts: {
      goal: { compare: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "3plus": 2 },
    },
  },
  },
  
  // === ADDITIONAL SURVIVAL ANALYSIS ===
  {
    id: "accelerated-failure-time",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Accelerated_failure_time_model",
    name: "Accelerated Failure Time Model",
    description: "Parametric survival model where covariates accelerate or decelerate time to event.",
    assumptions: ["Specified distribution (Weibull, log-normal)", "Multiplicative effect on survival time"],
    whenToUse: ["Parametric survival", "Direct time interpretation", "When proportional hazards fails"],
    alternatives: ["Cox regression", "Parametric survival models"],
    methodFamily: "Survival",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["cox-regression"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "regression" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 2, unsure: 1 },
    },
  },
  },
  {
    id: "competing-risks",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Competing_risks",
    name: "Competing Risks Analysis",
    description: "Analyzes time-to-event when multiple event types can occur, only one observed.",
    assumptions: ["Mutually exclusive events", "Independent censoring"],
    whenToUse: ["Multiple failure types", "Cause-specific analysis", "Medical outcomes"],
    alternatives: ["Kaplan-Meier (single event)", "Fine-Gray model"],
    methodFamily: "Survival",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["cox-regression", "kaplan-meier"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "competing" },
    boosts: {
      goal: { survival: 3, compare: 1 },
      stance: { parametric: 1, unsure: 1 },
    },
  },
  },
  {
    id: "random-survival-forest",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Survival_analysis",
    name: "Random Survival Forest",
    description: "Extension of random forest to survival data with censoring.",
    assumptions: ["Sufficient training data", "Right-censored data"],
    whenToUse: ["Non-linear survival patterns", "Variable importance", "Prediction without proportional hazards"],
    alternatives: ["Cox regression", "Gradient boosted survival"],
    methodFamily: "Machine Learning",
    category: "Survival Analysis",
    categoryId: "survival",
    outcomeScale: "time-to-event",
    predictorStructure: "multiple mixed",
    design: "longitudinal",
    level: "advanced",
    alternativeLinks: ["cox-regression", "random-forest"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: { goal: "survival", survivalTask: "ml" },
    boosts: {
      goal: { survival: 3 },
      stance: { unsure: 2 },
    },
  },
  },
  
  // === EFFECT SIZE MEASURES ===
  {
    id: "cohens-d",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Effect_size#Cohen%27s_d",
    name: "Cohen's d",
    description: "Standardized measure of effect size for difference between two means.",
    assumptions: ["Continuous outcome", "Two groups"],
    whenToUse: ["Reporting effect size", "Power analysis", "Meta-analysis"],
    alternatives: ["Hedges' g (small samples)", "Glass's delta"],
    methodFamily: "Effect Size",
    category: "Effect Size",
    categoryId: "effectsize",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["hedges-g", "eta-squared"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3, estimate: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
    kind: "effectsize",
  },
  },
  {
    id: "hedges-g",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Effect_size#Hedges%27_g",
    name: "Hedges' g",
    description: "Bias-corrected version of Cohen's d for small sample sizes.",
    assumptions: ["Continuous outcome", "Two groups", "Small samples"],
    whenToUse: ["Small sample effect size", "Meta-analysis", "Unbiased estimate"],
    alternatives: ["Cohen's d", "Glass's delta"],
    methodFamily: "Effect Size",
    category: "Effect Size",
    categoryId: "effectsize",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["cohens-d"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3, estimate: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "2": 2 },
    },
    kind: "effectsize",
  },
  },
  {
    id: "eta-squared",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Effect_size#Eta-squared",
    name: "Eta-squared / Partial Eta-squared",
    description: "Proportion of variance explained by a factor in ANOVA designs.",
    assumptions: ["ANOVA context", "Continuous outcome"],
    whenToUse: ["ANOVA effect size", "Variance explained", "Reporting results"],
    alternatives: ["Omega-squared", "Cohen's f"],
    methodFamily: "Effect Size",
    category: "Effect Size",
    categoryId: "effectsize",
    outcomeScale: "continuous",
    predictorStructure: "single categorical",
    design: "independent groups",
    level: "basic",
    alternativeLinks: ["cohens-d", "odds-ratio"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { compare: 2, utilities: 3, estimate: 3 },
      outcomeScale: { continuous: 2 },
      nGroups: { "3plus": 2 },
    },
    kind: "effectsize",
  },
  },
  {
    id: "odds-ratio",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Odds_ratio",
    name: "Odds Ratio",
    description: "Ratio of odds of an event occurring in one group vs another.",
    assumptions: ["Binary outcome", "Two groups or conditions"],
    whenToUse: ["Case-control studies", "Logistic regression", "Risk communication"],
    alternatives: ["Risk ratio", "Hazard ratio"],
    methodFamily: "Effect Size",
    category: "Effect Size",
    categoryId: "effectsize",
    outcomeScale: "binary",
    predictorStructure: "single categorical",
    design: "cross-sectional",
    level: "basic",
    alternativeLinks: ["eta-squared"],
    verified: false,
    pythonCode: "",
    rCode: "",
    rules: {
    requires: {},
    boosts: {
      goal: { categorical_assoc: 2, model: 1, utilities: 3, estimate: 3 },
      outcomeScale: { binary: 3 },
    },
    kind: "effectsize",
  },
  },
];

// ── Routing Engine ─────────────────────────────────────────────────────

/** Check if every key in `requires` matches the context */
function matchesRequires(ctx: WizardContext, req: Partial<WizardContext> | undefined): boolean {
  if (!req) return true;
  for (const [key, value] of Object.entries(req)) {
    const ctxVal = ctx[key as keyof WizardContext];
    if (ctxVal === undefined) continue; // unset context key → don't reject
    if (ctxVal !== value) return false;
  }
  return true;
}

/** Sum soft-score boosts for matching context values */
function scoreByBoosts(ctx: WizardContext, boosts: StatTestRule["boosts"] | undefined): number {
  if (!boosts) return 0;
  let score = 0;
  for (const [key, mapping] of Object.entries(boosts)) {
    const ctxVal = ctx[key as keyof WizardContext];
    if (ctxVal !== undefined && mapping[ctxVal as string] !== undefined) {
      score += mapping[ctxVal as string];
    }
  }
  return score;
}

const PRIMARY_KINDS: TestKind[] = ["primary"];
const COMPANION_KINDS: TestKind[] = ["assumption", "posthoc", "diagnostic", "effectsize", "resampling", "planning"];

/** Main recommendation engine */
export function recommend(ctx: WizardContext, allTests: StatTest[]): Recommendation {
  // Separate tests by kind
  const primaryTests: StatTest[] = [];
  const companionPool: StatTest[] = [];

  for (const test of allTests) {
    const kind = test.rules.kind ?? "primary";
    if (PRIMARY_KINDS.includes(kind)) {
      primaryTests.push(test);
    } else {
      companionPool.push(test);
    }
  }

  // Filter primary tests by hard constraints
  const passing = primaryTests.filter(t => matchesRequires(ctx, t.rules.requires));

  // Score and sort
  const scored = passing.map(t => ({
    test: t,
    score: scoreByBoosts(ctx, t.rules.boosts),
  }));
  scored.sort((a, b) => b.score - a.score);

  // Top 2 are primary, next batch are alternatives (up to 4 more)
  const primary = scored.slice(0, 2).map(s => s.test);
  const alternatives = scored.slice(2, 6).map(s => s.test);

  // Attach companions that pass hard constraints
  const companions = companionPool.filter(t => matchesRequires(ctx, t.rules.requires));

  return { primary, alternatives, companions };
}

/** Backward-compatible wrapper: returns a flat list of recommended primary tests */
export function getRecommendedTests(selections: Record<string, string>): StatTest[] {
  // Map old selection keys to WizardContext
  const ctx: WizardContext = {};

  // Map old goal values to new Goal type
  const goalMap: Record<string, Goal> = {
    compare: "compare",
    relationship: "associate",
    predict: "model",
    independence: "categorical_assoc",
    time: "time_series",
    unsupervised: "unsupervised",
    estimate: "compare", // estimate used comparison/effectsize/resampling
    power: "power",
  };
  if (selections["research-goal"]) {
    ctx.goal = goalMap[selections["research-goal"]] ?? "compare";
  }
  // Also map any new-style keys
  if (selections["goal"]) {
    ctx.goal = selections["goal"] as Goal;
  }

  // Map outcome
  const outcomeMap: Record<string, OutcomeScale> = {
    continuous: "continuous",
    counts: "count",
    ordinal: "ordinal",
    categorical: "nominal",
    binary: "binary",
    "time-to-event": "time-to-event",
    multivariate: "multivariate",
  };
  if (selections["outcome-type"]) {
    ctx.outcomeScale = outcomeMap[selections["outcome-type"]] ?? (selections["outcome-type"] as OutcomeScale);
  }
  if (selections["outcomeScale"]) {
    ctx.outcomeScale = selections["outcomeScale"] as OutcomeScale;
  }

  // Map sample structure
  const structMap: Record<string, SampleStructure> = {
    independent: "independent",
    paired: "paired",
    clustered: "clustered",
    longitudinal: "repeated",
    "time-series": "time-series",
  };
  if (selections["sample-structure"]) {
    ctx.sampleStructure = structMap[selections["sample-structure"]] ?? (selections["sample-structure"] as SampleStructure);
  }
  if (selections["sampleStructure"]) {
    ctx.sampleStructure = selections["sampleStructure"] as SampleStructure;
  }

  // Map assumptions / stance
  const stanceMap: Record<string, AssumptionStance> = {
    parametric: "parametric",
    nonparametric: "nonparametric",
    robust: "robust",
    bayesian: "bayesian",
    unsure: "unsure",
  };
  if (selections["assumptions"]) {
    ctx.stance = stanceMap[selections["assumptions"]] ?? (selections["assumptions"] as AssumptionStance);
  }
  if (selections["stance"]) {
    ctx.stance = selections["stance"] as AssumptionStance;
  }

  // Copy any other new-style keys directly
  for (const key of ["nGroups", "equalVar", "normality", "tableType", "modelingFocus", "predictorsCount", "mixedEffects", "tsTask", "survivalTask", "unsupTask"] as const) {
    if (selections[key]) {
      (ctx as any)[key] = selections[key];
    }
  }

  const result = recommend(ctx, statisticalTests);
  return [...result.primary, ...result.alternatives];
}


export const categoryGroups = [
  { id: "comparison", label: "Group Comparison", tests: ["t-test-independent", "paired-t-test", "one-way-anova", "two-way-anova", "repeated-measures-anova", "mann-whitney", "wilcoxon-signed-rank", "kruskal-wallis", "friedman-test", "welch-t-test", "welch-anova", "ancova", "manova"] },
  { id: "correlation", label: "Correlation", tests: ["pearson-correlation", "spearman-correlation", "partial-correlation", "kendall-tau", "point-biserial", "intraclass-correlation"] },
  { id: "regression", label: "Regression", tests: ["linear-regression", "multiple-regression", "logistic-regression", "poisson-regression", "ordinal-regression", "negative-binomial", "zero-inflated-poisson", "quantile-regression", "robust-regression", "probit-regression"] },
  { id: "categorical", label: "Categorical", tests: ["chi-square", "fisher-exact", "mcnemar-test", "cochran-q", "cramers-v", "cohens-kappa", "fleiss-kappa"] },
  { id: "mixed", label: "Mixed Models", tests: ["linear-mixed-model", "glmm"] },
  { id: "time-series", label: "Time Series", tests: ["arima", "exponential-smoothing", "prophet", "adf-test", "granger-causality", "ljung-box", "var"] },
  { id: "survival", label: "Survival Analysis", tests: ["kaplan-meier", "log-rank-test", "cox-regression", "accelerated-failure-time", "competing-risks", "random-survival-forest"] },
  { id: "clustering", label: "Clustering", tests: ["kmeans", "hierarchical-clustering", "dbscan", "gaussian-mixture"] },
  { id: "dimension", label: "Dimension Reduction", tests: ["pca", "factor-analysis", "tsne", "umap"] },
  { id: "ml", label: "Machine Learning", tests: ["random-forest", "gradient-boosting", "lasso-ridge", "svm", "xgboost", "lightgbm", "catboost", "knn", "naive-bayes", "decision-tree", "elastic-net", "neural-network-mlp"] },
  { id: "resampling", label: "Resampling", tests: ["bootstrap", "permutation-test"] },
  { id: "assumption", label: "Assumption Testing", tests: ["levene-test", "bartlett-test", "brown-forsythe", "fligner-killeen", "hartley-fmax", "shapiro-wilk", "kolmogorov-smirnov", "anderson-darling", "dagostino-pearson", "durbin-watson", "breusch-pagan", "vif"] },
  { id: "posthoc", label: "Post-hoc Tests", tests: ["tukey-hsd", "bonferroni", "holm-bonferroni", "benjamini-hochberg", "dunnett-test", "games-howell", "scheffe-test", "dunn-test"] },
  { id: "bayesian", label: "Bayesian Methods", tests: ["bayesian-t-test", "bayesian-regression", "bayesian-anova"] },
  { id: "effectsize", label: "Effect Size", tests: ["cohens-d", "hedges-g", "eta-squared", "odds-ratio"] },
  { id: "planning", label: "Study Planning", tests: ["power-analysis"] },
];
