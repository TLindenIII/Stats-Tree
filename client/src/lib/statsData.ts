export interface WizardStep {
  id: string;
  title: string;
  question: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

export interface StatTest {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  whenToUse: string[];
  alternatives: string[];
  methodFamily: string;
  category: string;
}

export const wizardSteps: WizardStep[] = [
  {
    id: "research-goal",
    title: "Research Goal",
    question: "What is your primary research goal?",
    options: [
      { value: "estimate", label: "Estimate a parameter", description: "Confidence intervals, point estimates" },
      { value: "compare", label: "Compare groups", description: "Test differences between two or more groups" },
      { value: "relationship", label: "Assess relationships", description: "Correlation, association between variables" },
      { value: "predict", label: "Predict outcomes", description: "Regression, classification models" },
      { value: "independence", label: "Test independence / association", description: "Chi-square tests, contingency tables" },
      { value: "time", label: "Model time or sequential structure", description: "Time series, survival analysis" },
      { value: "unsupervised", label: "Discover patterns (unsupervised)", description: "Clustering, dimension reduction" },
      { value: "power", label: "Plan sample size / power", description: "Power analysis, sample size calculation" },
    ],
  },
  {
    id: "outcome-type",
    title: "Outcome Type",
    question: "What type of outcome variable do you have?",
    options: [
      { value: "continuous", label: "Numeric (continuous)", description: "Measurements like height, weight, temperature" },
      { value: "counts", label: "Numeric (counts/rates)", description: "Count data like number of events" },
      { value: "ordinal", label: "Ordinal", description: "Ranked categories like Likert scales" },
      { value: "categorical", label: "Categorical (nominal)", description: "Unordered categories like colors, types" },
      { value: "binary", label: "Binary", description: "Two outcomes like yes/no, success/failure" },
      { value: "time-to-event", label: "Time-to-event", description: "Survival data with censoring" },
      { value: "multivariate", label: "Multivariate", description: "Multiple outcome variables" },
      { value: "high-dimensional", label: "High-dimensional (p >> n)", description: "More variables than observations" },
      { value: "text", label: "Text data", description: "Natural language, documents" },
    ],
  },
  {
    id: "sample-structure",
    title: "Sample Structure",
    question: "What is your sample structure?",
    options: [
      { value: "independent", label: "Independent samples", description: "Different subjects in each group" },
      { value: "paired", label: "Paired/matched samples", description: "Same subjects measured twice or matched pairs" },
      { value: "clustered", label: "Clustered/hierarchical", description: "Nested data like students in schools" },
      { value: "longitudinal", label: "Longitudinal/repeated measures", description: "Multiple measurements over time" },
      { value: "time-series", label: "Time series", description: "Sequential observations over time" },
      { value: "spatial", label: "Spatially indexed data", description: "Geographic or spatial locations" },
    ],
  },
  {
    id: "study-design",
    title: "Study Design",
    question: "What type of study design are you using?",
    options: [
      { value: "randomized", label: "Randomized experiment", description: "Random assignment to groups" },
      { value: "blocking", label: "Blocking/factorial design", description: "Controlled experimental design" },
      { value: "crossover", label: "Crossover design", description: "Subjects receive all treatments" },
      { value: "cross-sectional", label: "Cross-sectional observational", description: "Single time point observation" },
      { value: "case-control", label: "Case-control", description: "Compare cases vs controls retrospectively" },
      { value: "cohort", label: "Cohort", description: "Follow groups over time" },
    ],
  },
  {
    id: "assumptions",
    title: "Assumptions",
    question: "What assumptions can your data meet?",
    options: [
      { value: "parametric", label: "Parametric assumptions met", description: "Normal distribution, equal variances, linearity" },
      { value: "nonparametric", label: "Need non-parametric methods", description: "Skewed data, ordinal outcomes, small samples" },
      { value: "robust", label: "Need robust/outlier-resistant", description: "Data has outliers or heavy tails" },
      { value: "bayesian", label: "Prefer Bayesian approach", description: "Prior information, uncertainty quantification" },
      { value: "unsure", label: "Not sure", description: "Will provide recommendations for multiple approaches" },
    ],
  },
];

export const statisticalTests: StatTest[] = [
  // Group Comparison - Parametric
  {
    id: "t-test-independent",
    name: "Independent Samples t-Test",
    description: "Compares means of two independent groups to determine if they are statistically different.",
    assumptions: ["Normal distribution in each group", "Equal variances (can be relaxed with Welch's t-test)", "Independent observations", "Continuous outcome"],
    whenToUse: ["Comparing two independent group means", "Sample size > 30 per group (or normally distributed)", "Continuous outcome variable"],
    alternatives: ["Mann-Whitney U test (non-parametric)", "Welch's t-test (unequal variances)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
  },
  {
    id: "paired-t-test",
    name: "Paired Samples t-Test",
    description: "Compares means from the same group at two different times or under two different conditions.",
    assumptions: ["Differences are normally distributed", "Paired/matched observations", "Continuous outcome"],
    whenToUse: ["Before-after comparisons", "Matched pairs design", "Crossover studies"],
    alternatives: ["Wilcoxon signed-rank test (non-parametric)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
  },
  {
    id: "one-way-anova",
    name: "One-Way ANOVA",
    description: "Tests whether there are statistically significant differences between the means of three or more independent groups.",
    assumptions: ["Normal distribution in each group", "Equal variances (homoscedasticity)", "Independent observations"],
    whenToUse: ["Comparing 3+ group means", "One categorical predictor", "Continuous outcome"],
    alternatives: ["Kruskal-Wallis H test (non-parametric)", "Welch's ANOVA (unequal variances)"],
    methodFamily: "Parametric",
    category: "Group Comparison",
  },
  {
    id: "two-way-anova",
    name: "Two-Way ANOVA",
    description: "Tests the effect of two independent categorical variables on a continuous outcome, including their interaction.",
    assumptions: ["Normal distribution", "Equal variances", "Independent observations", "No significant outliers"],
    whenToUse: ["Two categorical predictors", "Factorial experimental design", "Testing interaction effects"],
    alternatives: ["Robust ANOVA", "Aligned ranks transformation"],
    methodFamily: "Parametric",
    category: "Group Comparison",
  },
  {
    id: "repeated-measures-anova",
    name: "Repeated Measures ANOVA",
    description: "Tests differences across multiple time points or conditions for the same subjects.",
    assumptions: ["Sphericity", "Normal distribution", "No significant outliers"],
    whenToUse: ["Multiple measurements on same subjects", "Longitudinal within-subject design", "Before-during-after comparisons"],
    alternatives: ["Friedman test (non-parametric)", "Mixed-effects models"],
    methodFamily: "Parametric",
    category: "Group Comparison",
  },
  // Group Comparison - Non-parametric
  {
    id: "mann-whitney",
    name: "Mann-Whitney U Test",
    description: "Non-parametric test that compares distributions of two independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Non-normal distributions", "Ordinal data", "Small sample sizes"],
    alternatives: ["Independent t-test (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
  },
  {
    id: "wilcoxon-signed-rank",
    name: "Wilcoxon Signed-Rank Test",
    description: "Non-parametric test for comparing two related samples or repeated measurements.",
    assumptions: ["Paired observations", "Ordinal or continuous outcome", "Symmetric distribution of differences"],
    whenToUse: ["Paired data with non-normal differences", "Ordinal outcomes", "Before-after comparisons"],
    alternatives: ["Paired t-test (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
  },
  {
    id: "kruskal-wallis",
    name: "Kruskal-Wallis H Test",
    description: "Non-parametric alternative to one-way ANOVA for comparing three or more independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Comparing 3+ groups with non-normal data", "Ordinal outcomes", "Unequal group sizes"],
    alternatives: ["One-way ANOVA (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
  },
  {
    id: "friedman-test",
    name: "Friedman Test",
    description: "Non-parametric alternative to repeated measures ANOVA for ordinal or non-normal data.",
    assumptions: ["Related samples", "Ordinal or continuous outcome", "Same subjects across conditions"],
    whenToUse: ["Repeated measures with non-normal data", "Ordinal outcomes", "Blocked designs"],
    alternatives: ["Repeated measures ANOVA (parametric)"],
    methodFamily: "Nonparametric",
    category: "Group Comparison",
  },
  // Relationship/Correlation
  {
    id: "pearson-correlation",
    name: "Pearson Correlation",
    description: "Measures the linear relationship between two continuous variables.",
    assumptions: ["Linear relationship", "Bivariate normality", "No outliers", "Continuous variables"],
    whenToUse: ["Measuring linear association", "Both variables continuous", "Normally distributed data"],
    alternatives: ["Spearman correlation (non-parametric)", "Kendall's tau (ordinal)"],
    methodFamily: "Parametric",
    category: "Correlation",
  },
  {
    id: "spearman-correlation",
    name: "Spearman Rank Correlation",
    description: "Non-parametric measure of monotonic relationship between two variables.",
    assumptions: ["Monotonic relationship", "Ordinal or continuous data", "Independent observations"],
    whenToUse: ["Non-linear monotonic relationships", "Ordinal data", "Outliers present"],
    alternatives: ["Pearson correlation (parametric)", "Kendall's tau"],
    methodFamily: "Nonparametric",
    category: "Correlation",
  },
  {
    id: "partial-correlation",
    name: "Partial Correlation",
    description: "Measures association between two variables while controlling for one or more other variables.",
    assumptions: ["Linear relationships", "No multicollinearity", "Continuous variables"],
    whenToUse: ["Controlling for confounders", "Isolating relationships", "Multiple predictors"],
    alternatives: ["Multiple regression", "Path analysis"],
    methodFamily: "Parametric",
    category: "Correlation",
  },
  // Regression
  {
    id: "linear-regression",
    name: "Linear Regression",
    description: "Models the relationship between a continuous outcome and one or more predictors.",
    assumptions: ["Linear relationship", "Normal residuals", "Homoscedasticity", "Independence of errors"],
    whenToUse: ["Predicting continuous outcomes", "Multiple predictors", "Quantifying relationships"],
    alternatives: ["Robust regression (outliers)", "Quantile regression"],
    methodFamily: "Regression-based",
    category: "Regression",
  },
  {
    id: "multiple-regression",
    name: "Multiple Linear Regression",
    description: "Models relationship between continuous outcome and multiple predictors simultaneously.",
    assumptions: ["Linear relationships", "Normal residuals", "No multicollinearity", "Homoscedasticity"],
    whenToUse: ["Multiple predictors", "Controlling for confounders", "Prediction with covariates"],
    alternatives: ["Ridge/Lasso regression", "Partial least squares"],
    methodFamily: "Regression-based",
    category: "Regression",
  },
  {
    id: "logistic-regression",
    name: "Logistic Regression",
    description: "Models the probability of a binary outcome based on one or more predictors.",
    assumptions: ["Binary outcome", "Independence of observations", "No multicollinearity", "Linear relationship with log-odds"],
    whenToUse: ["Binary classification", "Odds ratio estimation", "Multiple predictors"],
    alternatives: ["Probit regression", "Discriminant analysis"],
    methodFamily: "Regression-based",
    category: "Regression",
  },
  {
    id: "poisson-regression",
    name: "Poisson Regression",
    description: "Models count data as a function of predictors, assuming counts follow a Poisson distribution.",
    assumptions: ["Count outcome", "Mean equals variance", "Independence", "Log-linear relationship"],
    whenToUse: ["Count outcomes", "Rate data", "Event frequencies"],
    alternatives: ["Negative binomial regression (overdispersion)", "Zero-inflated models"],
    methodFamily: "Regression-based",
    category: "Regression",
  },
  {
    id: "ordinal-regression",
    name: "Ordinal Logistic Regression",
    description: "Models ordinal outcomes with three or more ordered categories.",
    assumptions: ["Ordinal outcome", "Proportional odds", "Independence"],
    whenToUse: ["Ordinal outcomes (Likert scales)", "Ranked categories", "Multiple predictors"],
    alternatives: ["Multinomial regression", "Cumulative link models"],
    methodFamily: "Regression-based",
    category: "Regression",
  },
  // Categorical Analysis
  {
    id: "chi-square",
    name: "Chi-Square Test of Independence",
    description: "Tests whether there is a significant association between two categorical variables.",
    assumptions: ["Expected cell count >= 5 in 80% of cells", "Independent observations", "Categorical variables"],
    whenToUse: ["Testing association between categorical variables", "Contingency tables", "Independence testing"],
    alternatives: ["Fisher's exact test (small samples)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
  },
  {
    id: "fisher-exact",
    name: "Fisher's Exact Test",
    description: "Exact test for association in 2x2 contingency tables, especially with small samples.",
    assumptions: ["2x2 table", "Fixed marginals", "Independent observations"],
    whenToUse: ["Small sample sizes", "Expected counts < 5", "2x2 tables"],
    alternatives: ["Chi-square test (larger samples)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
  },
  {
    id: "mcnemar-test",
    name: "McNemar's Test",
    description: "Tests for differences in paired proportions or matched case-control studies.",
    assumptions: ["Paired binary data", "Matched samples", "Sufficient discordant pairs"],
    whenToUse: ["Before-after binary outcomes", "Matched pairs", "Diagnostic test comparison"],
    alternatives: ["Cochran's Q test (3+ conditions)"],
    methodFamily: "Nonparametric",
    category: "Categorical",
  },
  // Mixed/Multilevel Models
  {
    id: "linear-mixed-model",
    name: "Linear Mixed Model",
    description: "Models continuous outcomes with both fixed and random effects for hierarchical/clustered data.",
    assumptions: ["Normal residuals", "Linear relationships", "Random effects normally distributed"],
    whenToUse: ["Clustered/nested data", "Repeated measures", "Unbalanced designs"],
    alternatives: ["Generalized estimating equations", "Hierarchical Bayesian models"],
    methodFamily: "Mixed Models",
    category: "Mixed Models",
  },
  {
    id: "glmm",
    name: "Generalized Linear Mixed Model",
    description: "Extends GLM to include random effects for non-normal outcomes with clustering.",
    assumptions: ["Appropriate link function", "Random effects specification", "Conditional independence"],
    whenToUse: ["Non-normal outcomes with clustering", "Binary/count data in hierarchical structures"],
    alternatives: ["GEE", "Bayesian hierarchical models"],
    methodFamily: "Mixed Models",
    category: "Mixed Models",
  },
  // Time Series
  {
    id: "arima",
    name: "ARIMA Model",
    description: "Autoregressive integrated moving average model for time series forecasting.",
    assumptions: ["Stationarity (after differencing)", "No seasonality (or use SARIMA)", "Constant variance"],
    whenToUse: ["Time series forecasting", "Trend modeling", "Autocorrelated data"],
    alternatives: ["Exponential smoothing", "Prophet", "State-space models"],
    methodFamily: "Time-series",
    category: "Time Series",
  },
  {
    id: "exponential-smoothing",
    name: "Exponential Smoothing",
    description: "Weighted moving average methods for time series forecasting with trend and seasonality.",
    assumptions: ["Regular time intervals", "Stationary error variance"],
    whenToUse: ["Short-term forecasting", "Trend and seasonality", "Simpler interpretation"],
    alternatives: ["ARIMA", "Theta method"],
    methodFamily: "Time-series",
    category: "Time Series",
  },
  // Survival Analysis
  {
    id: "kaplan-meier",
    name: "Kaplan-Meier Estimator",
    description: "Non-parametric estimator of survival function from time-to-event data.",
    assumptions: ["Independent censoring", "Well-defined time origin", "No competing risks (or adjust)"],
    whenToUse: ["Estimating survival curves", "Handling censored data", "Descriptive survival analysis"],
    alternatives: ["Nelson-Aalen estimator", "Parametric survival models"],
    methodFamily: "Survival",
    category: "Survival Analysis",
  },
  {
    id: "log-rank-test",
    name: "Log-Rank Test",
    description: "Compares survival distributions between two or more groups.",
    assumptions: ["Proportional hazards", "Independent censoring", "Non-informative censoring"],
    whenToUse: ["Comparing survival curves", "Clinical trial endpoints", "Time-to-event comparisons"],
    alternatives: ["Wilcoxon-Gehan test", "Cox regression"],
    methodFamily: "Survival",
    category: "Survival Analysis",
  },
  {
    id: "cox-regression",
    name: "Cox Proportional Hazards",
    description: "Semi-parametric regression model for time-to-event data with covariates.",
    assumptions: ["Proportional hazards", "Independent censoring", "Linear covariate effects on log-hazard"],
    whenToUse: ["Survival with covariates", "Hazard ratio estimation", "Adjusting for confounders"],
    alternatives: ["Accelerated failure time models", "Parametric survival models"],
    methodFamily: "Survival",
    category: "Survival Analysis",
  },
  // Unsupervised Learning
  {
    id: "kmeans",
    name: "K-Means Clustering",
    description: "Partitions observations into k clusters by minimizing within-cluster variance.",
    assumptions: ["Spherical clusters", "Similar cluster sizes", "Numeric features"],
    whenToUse: ["Finding natural groupings", "Customer segmentation", "Pattern discovery"],
    alternatives: ["Hierarchical clustering", "DBSCAN", "Gaussian mixtures"],
    methodFamily: "Machine Learning",
    category: "Clustering",
  },
  {
    id: "hierarchical-clustering",
    name: "Hierarchical Clustering",
    description: "Builds a tree of clusters using agglomerative or divisive approaches.",
    assumptions: ["Meaningful distance metric", "Appropriate linkage method"],
    whenToUse: ["Exploring cluster hierarchy", "Dendrogram visualization", "Unknown number of clusters"],
    alternatives: ["K-means", "DBSCAN"],
    methodFamily: "Machine Learning",
    category: "Clustering",
  },
  {
    id: "pca",
    name: "Principal Component Analysis",
    description: "Reduces dimensionality by finding orthogonal directions of maximum variance.",
    assumptions: ["Linear relationships", "Continuous variables", "Standardized features"],
    whenToUse: ["Dimension reduction", "Feature extraction", "Visualization of high-dimensional data"],
    alternatives: ["Factor analysis", "t-SNE", "UMAP"],
    methodFamily: "Multivariate",
    category: "Dimension Reduction",
  },
  {
    id: "factor-analysis",
    name: "Factor Analysis",
    description: "Identifies latent factors underlying observed variables.",
    assumptions: ["Linear relationships", "Multivariate normality", "Sufficient sample size"],
    whenToUse: ["Scale development", "Latent construct identification", "Data reduction with theory"],
    alternatives: ["PCA", "Structural equation modeling"],
    methodFamily: "Multivariate",
    category: "Dimension Reduction",
  },
  // Machine Learning
  {
    id: "random-forest",
    name: "Random Forest",
    description: "Ensemble of decision trees for classification or regression with improved accuracy.",
    assumptions: ["No strict distributional assumptions", "Sufficient training data"],
    whenToUse: ["Complex non-linear relationships", "Feature importance", "Robust predictions"],
    alternatives: ["Gradient boosting", "Single decision tree", "Neural networks"],
    methodFamily: "Machine Learning",
    category: "Prediction",
  },
  {
    id: "gradient-boosting",
    name: "Gradient Boosting",
    description: "Sequentially builds weak learners to minimize prediction errors.",
    assumptions: ["Sufficient training data", "Proper hyperparameter tuning"],
    whenToUse: ["High prediction accuracy", "Structured/tabular data", "Competitions"],
    alternatives: ["Random forest", "XGBoost", "LightGBM"],
    methodFamily: "Machine Learning",
    category: "Prediction",
  },
  {
    id: "lasso-ridge",
    name: "Lasso/Ridge Regression",
    description: "Regularized regression methods that shrink coefficients to prevent overfitting.",
    assumptions: ["Linear relationships", "Standardized predictors recommended"],
    whenToUse: ["High-dimensional data", "Multicollinearity", "Variable selection (Lasso)"],
    alternatives: ["Elastic net", "Principal components regression"],
    methodFamily: "Regression-based",
    category: "Prediction",
  },
  // Resampling/Bootstrap
  {
    id: "bootstrap",
    name: "Bootstrap",
    description: "Resampling method to estimate sampling distributions and confidence intervals.",
    assumptions: ["Representative sample", "Independent observations"],
    whenToUse: ["Unknown sampling distribution", "Complex statistics", "Small samples"],
    alternatives: ["Jackknife", "Permutation tests"],
    methodFamily: "Resampling",
    category: "Resampling",
  },
  {
    id: "permutation-test",
    name: "Permutation Test",
    description: "Non-parametric test using random permutations to generate null distribution.",
    assumptions: ["Exchangeability under null", "Independent observations"],
    whenToUse: ["No distributional assumptions", "Small samples", "Complex test statistics"],
    alternatives: ["Bootstrap", "Parametric tests"],
    methodFamily: "Permutation-based",
    category: "Resampling",
  },
  // Power Analysis
  {
    id: "power-analysis",
    name: "Power Analysis",
    description: "Calculates required sample size or statistical power for detecting an effect.",
    assumptions: ["Specified effect size", "Known alpha level", "Appropriate test selection"],
    whenToUse: ["Study planning", "Grant applications", "Sample size justification"],
    alternatives: ["Simulation-based power", "Bayesian sample size"],
    methodFamily: "Planning",
    category: "Study Planning",
  },
];

export function getRecommendedTests(selections: Record<string, string>): StatTest[] {
  const { 
    "research-goal": goal, 
    "outcome-type": outcome, 
    "sample-structure": structure, 
    assumptions 
  } = selections;
  
  let recommended: StatTest[] = [];
  
  // Compare groups
  if (goal === "compare") {
    if (outcome === "continuous") {
      if (structure === "independent") {
        if (assumptions === "parametric") {
          recommended.push(
            statisticalTests.find(t => t.id === "t-test-independent")!,
            statisticalTests.find(t => t.id === "one-way-anova")!
          );
        } else {
          recommended.push(
            statisticalTests.find(t => t.id === "mann-whitney")!,
            statisticalTests.find(t => t.id === "kruskal-wallis")!
          );
        }
      } else if (structure === "paired") {
        if (assumptions === "parametric") {
          recommended.push(statisticalTests.find(t => t.id === "paired-t-test")!);
        } else {
          recommended.push(statisticalTests.find(t => t.id === "wilcoxon-signed-rank")!);
        }
      } else if (structure === "longitudinal") {
        if (assumptions === "parametric") {
          recommended.push(
            statisticalTests.find(t => t.id === "repeated-measures-anova")!,
            statisticalTests.find(t => t.id === "linear-mixed-model")!
          );
        } else {
          recommended.push(statisticalTests.find(t => t.id === "friedman-test")!);
        }
      } else if (structure === "clustered") {
        recommended.push(
          statisticalTests.find(t => t.id === "linear-mixed-model")!,
          statisticalTests.find(t => t.id === "glmm")!
        );
      }
    } else if (outcome === "binary" || outcome === "categorical") {
      recommended.push(
        statisticalTests.find(t => t.id === "chi-square")!,
        statisticalTests.find(t => t.id === "fisher-exact")!
      );
    }
  }
  
  // Relationships
  else if (goal === "relationship") {
    if (outcome === "continuous") {
      if (assumptions === "parametric") {
        recommended.push(
          statisticalTests.find(t => t.id === "pearson-correlation")!,
          statisticalTests.find(t => t.id === "partial-correlation")!
        );
      } else {
        recommended.push(statisticalTests.find(t => t.id === "spearman-correlation")!);
      }
    }
  }
  
  // Prediction
  else if (goal === "predict") {
    if (outcome === "continuous") {
      recommended.push(
        statisticalTests.find(t => t.id === "linear-regression")!,
        statisticalTests.find(t => t.id === "multiple-regression")!,
        statisticalTests.find(t => t.id === "random-forest")!
      );
      if (assumptions === "robust") {
        recommended.push(statisticalTests.find(t => t.id === "lasso-ridge")!);
      }
    } else if (outcome === "high-dimensional") {
      recommended.push(
        statisticalTests.find(t => t.id === "lasso-ridge")!,
        statisticalTests.find(t => t.id === "pca")!,
        statisticalTests.find(t => t.id === "random-forest")!
      );
    } else if (outcome === "binary") {
      recommended.push(
        statisticalTests.find(t => t.id === "logistic-regression")!,
        statisticalTests.find(t => t.id === "random-forest")!
      );
    } else if (outcome === "counts") {
      recommended.push(statisticalTests.find(t => t.id === "poisson-regression")!);
    } else if (outcome === "ordinal") {
      recommended.push(statisticalTests.find(t => t.id === "ordinal-regression")!);
    }
  }
  
  // Independence
  else if (goal === "independence") {
    recommended.push(
      statisticalTests.find(t => t.id === "chi-square")!,
      statisticalTests.find(t => t.id === "fisher-exact")!
    );
  }
  
  // Time/Survival
  else if (goal === "time") {
    if (outcome === "time-to-event") {
      recommended.push(
        statisticalTests.find(t => t.id === "kaplan-meier")!,
        statisticalTests.find(t => t.id === "log-rank-test")!,
        statisticalTests.find(t => t.id === "cox-regression")!
      );
    } else if (structure === "time-series") {
      recommended.push(
        statisticalTests.find(t => t.id === "arima")!,
        statisticalTests.find(t => t.id === "exponential-smoothing")!
      );
    }
  }
  
  // Unsupervised
  else if (goal === "unsupervised") {
    recommended.push(
      statisticalTests.find(t => t.id === "kmeans")!,
      statisticalTests.find(t => t.id === "hierarchical-clustering")!,
      statisticalTests.find(t => t.id === "pca")!,
      statisticalTests.find(t => t.id === "factor-analysis")!
    );
  }
  
  // Power analysis
  else if (goal === "power") {
    recommended.push(statisticalTests.find(t => t.id === "power-analysis")!);
  }
  
  // Default fallback
  if (recommended.length === 0 || assumptions === "unsure") {
    const baseRecommendations = [...recommended];
    
    if (goal === "compare" && outcome === "continuous") {
      recommended = [
        statisticalTests.find(t => t.id === "t-test-independent")!,
        statisticalTests.find(t => t.id === "mann-whitney")!,
        statisticalTests.find(t => t.id === "linear-mixed-model")!,
      ];
    } else if (baseRecommendations.length === 0) {
      recommended = [
        statisticalTests.find(t => t.id === "t-test-independent")!,
        statisticalTests.find(t => t.id === "chi-square")!,
        statisticalTests.find(t => t.id === "linear-regression")!,
      ];
    }
  }
  
  return recommended.filter(Boolean);
}

export const categoryGroups = [
  { id: "comparison", label: "Group Comparison", tests: ["t-test-independent", "paired-t-test", "one-way-anova", "two-way-anova", "repeated-measures-anova", "mann-whitney", "wilcoxon-signed-rank", "kruskal-wallis", "friedman-test"] },
  { id: "correlation", label: "Correlation", tests: ["pearson-correlation", "spearman-correlation", "partial-correlation"] },
  { id: "regression", label: "Regression", tests: ["linear-regression", "multiple-regression", "logistic-regression", "poisson-regression", "ordinal-regression"] },
  { id: "categorical", label: "Categorical", tests: ["chi-square", "fisher-exact", "mcnemar-test"] },
  { id: "mixed", label: "Mixed Models", tests: ["linear-mixed-model", "glmm"] },
  { id: "time-series", label: "Time Series", tests: ["arima", "exponential-smoothing"] },
  { id: "survival", label: "Survival Analysis", tests: ["kaplan-meier", "log-rank-test", "cox-regression"] },
  { id: "unsupervised", label: "Unsupervised", tests: ["kmeans", "hierarchical-clustering", "pca", "factor-analysis"] },
  { id: "ml", label: "Machine Learning", tests: ["random-forest", "gradient-boosting", "lasso-ridge"] },
  { id: "resampling", label: "Resampling", tests: ["bootstrap", "permutation-test"] },
  { id: "planning", label: "Study Planning", tests: ["power-analysis"] },
];
