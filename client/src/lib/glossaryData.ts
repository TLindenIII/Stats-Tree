export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  // --- Inference + reporting ---
  {
    term: "Significance Level (α)",
    definition:
      "A pre-specified threshold used to decide whether a result is statistically significant; it controls the long-run Type I error rate for a single test (commonly 0.05).",
    category: "Inference",
    relatedTerms: ["Type I Error", "Statistical Significance", "P-value"],
  },
  {
    term: "Statistical Significance",
    definition:
      "A decision that an observed result is unlikely under the null hypothesis, usually determined by comparing a p-value to a significance level (α).",
    category: "Inference",
    relatedTerms: ["P-value", "Significance Level (α)", "Null Hypothesis"],
  },
  {
    term: "Practical Significance",
    definition:
      "Whether an effect is large enough to matter in real-world or domain terms, regardless of statistical significance.",
    category: "Inference",
    relatedTerms: ["Effect Size", "Statistical Significance", "Confidence Interval"],
  },
  {
    term: "Effect Size",
    definition:
      "A quantitative measure of the magnitude of a relationship or difference (e.g., standardized mean difference, correlation strength), distinct from p-values.",
    category: "Inference",
    relatedTerms: ["Practical Significance", "Confidence Interval", "Statistical Significance"],
  },
  {
    term: "Power",
    definition:
      "The probability that a study will detect a specified effect (i.e., reject the null) when the effect is truly present; equals 1 − Type II error rate.",
    category: "Power & Planning",
    relatedTerms: ["Type II Error", "Effect Size", "Sample Size"],
  },
  {
    term: "Power Analysis",
    definition:
      "Planning calculations used to choose sample size (or detectable effect) to achieve a target power at a chosen significance level.",
    category: "Power & Planning",
    relatedTerms: ["Power", "Significance Level (α)", "Effect Size", "Sample Size"],
  },
  {
    term: "Multiple Comparisons",
    definition:
      "Performing many statistical tests on the same dataset, which increases the chance of false positives unless adjustments are used.",
    category: "Inference",
    relatedTerms: ["Family-wise Error Rate (FWER)", "False Discovery Rate (FDR)"],
  },
  {
    term: "Family-wise Error Rate (FWER)",
    definition:
      "The probability of making at least one Type I error (false positive) across a set (family) of tests.",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "Type I Error"],
  },
  {
    term: "False Discovery Rate (FDR)",
    definition:
      "The expected proportion of false positives among results declared significant (discoveries).",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "Type I Error"],
  },
  {
    term: "Confidence Level",
    definition:
      "The long-run proportion of confidence intervals that would contain the true parameter if the procedure were repeated many times (e.g., 95%).",
    category: "Estimation",
    relatedTerms: ["Confidence Interval"],
  },
  {
    term: "Odds Ratio",
    definition:
      "A measure of association for a binary outcome: the ratio of the odds of an event in one group (or per unit increase in a predictor) to another.",
    category: "Modeling",
    relatedTerms: ["Binary Outcome", "Logistic Regression"],
  },

  // --- Study design + data structure ---
  {
    term: "Independent Observations",
    definition:
      "Measurements are independent when knowing one observation gives no information about another; violations commonly occur with repeated measures or clustered data.",
    category: "Design",
    relatedTerms: ["Repeated Measures", "Clustered Data"],
  },
  {
    term: "Independent Samples",
    definition:
      "Groups are independent when the observations in one group are not paired or linked to observations in another group.",
    category: "Design",
    relatedTerms: ["Paired Data", "Independent Observations"],
  },
  {
    term: "Paired Data",
    definition:
      "Observations are paired when each measurement in one condition/group is linked to a specific measurement in another (e.g., pre/post on the same subject, matched pairs).",
    category: "Design",
    relatedTerms: ["Repeated Measures", "Independent Samples"],
  },
  {
    term: "Repeated Measures",
    definition:
      "Data where multiple observations are collected from the same unit (person, item, site) across time or conditions, creating within-unit correlation.",
    category: "Design",
    relatedTerms: ["Independent Observations", "Clustered Data"],
  },
  {
    term: "Clustered Data",
    definition:
      "Data where observations are grouped into clusters (e.g., students within classes), often leading to correlation within each cluster.",
    category: "Design",
    relatedTerms: ["Random Effects", "Fixed Effects", "Repeated Measures"],
  },
  {
    term: "Covariate",
    definition:
      "An additional variable included in an analysis/model to adjust for differences or explain variation in the outcome.",
    category: "Design",
    relatedTerms: ["Confounder", "Predictor"],
  },
  {
    term: "Confounder",
    definition:
      "A variable associated with both the predictor and the outcome that can distort (bias) the estimated relationship if not controlled for.",
    category: "Design",
    relatedTerms: ["Covariate", "Bias"],
  },
  {
    term: "Fixed Effects",
    definition:
      "Model effects interpreted as applying to the specific levels in the dataset (e.g., particular clinics), often treated as non-random parameters.",
    category: "Modeling",
    relatedTerms: ["Random Effects", "Clustered Data"],
  },
  {
    term: "Random Effects",
    definition:
      "Model terms representing cluster-level variability as draws from a distribution, used to account for correlation in clustered or repeated-measures data.",
    category: "Modeling",
    relatedTerms: ["Fixed Effects", "Clustered Data", "Mixed Models"],
  },

  // --- Assumptions + diagnostics ---
  {
    term: "Normality",
    definition:
      "An assumption that a variable (often model residuals or paired differences) follows a normal distribution; many methods are robust to mild deviations with adequate sample size.",
    category: "Assumptions",
    relatedTerms: ["Normal Distribution", "Residuals"],
  },
  {
    term: "Homoscedasticity",
    definition:
      "An assumption that variability (variance) is roughly constant across predictor values or groups; also called equal variance.",
    category: "Assumptions",
    relatedTerms: ["Heteroskedasticity", "Residuals"],
  },
  {
    term: "Heteroskedasticity",
    definition:
      "Non-constant variance across predictor values or groups; it can distort standard errors and inference if unaddressed.",
    category: "Assumptions",
    relatedTerms: ["Homoscedasticity", "Standard Error"],
  },
  {
    term: "Outlier",
    definition:
      "An observation far from the bulk of the data; it may be a data issue or a valid extreme case and can strongly affect some analyses.",
    category: "Diagnostics",
    relatedTerms: ["Influential Point", "Leverage"],
  },
  {
    term: "Leverage",
    definition:
      "How unusual an observation’s predictor values are relative to the dataset; high-leverage points can strongly affect fitted models.",
    category: "Diagnostics",
    relatedTerms: ["Influential Point", "Outlier"],
  },
  {
    term: "Influential Point",
    definition:
      "A data point that substantially changes model estimates or predictions if removed; often related to leverage and residual size.",
    category: "Diagnostics",
    relatedTerms: ["Leverage", "Outlier", "Residuals"],
  },
  {
    term: "Multicollinearity",
    definition:
      "High correlation among predictors in a model, which can make individual coefficient estimates unstable and inflate standard errors.",
    category: "Diagnostics",
    relatedTerms: ["Predictor", "Standard Error"],
  },
  {
    term: "Overdispersion",
    definition:
      "For count data, when the variance exceeds the mean; this can indicate that a simple Poisson model is too restrictive.",
    category: "Assumptions",
    relatedTerms: ["Count Outcome", "Poisson Regression", "Negative Binomial Regression"],
  },

  // --- Multiple-testing adjustments (methods, not tests) ---
  {
    term: "Bonferroni Correction",
    definition:
      "A multiple-comparisons adjustment that uses a stricter threshold (α divided by the number of tests) to control the family-wise error rate.",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "Family-wise Error Rate (FWER)"],
  },
  {
    term: "Holm–Bonferroni",
    definition:
      "A stepwise multiple-comparisons adjustment that controls family-wise error rate and is typically less conservative than Bonferroni.",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "Family-wise Error Rate (FWER)"],
  },
  {
    term: "Benjamini–Hochberg Procedure",
    definition:
      "A multiple-comparisons procedure that controls false discovery rate (FDR), often used when running many tests.",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "False Discovery Rate (FDR)"],
  },
  {
    term: "Post-hoc Comparison",
    definition:
      "A follow-up comparison conducted after an overall analysis indicates differences exist; typically paired with multiple-comparisons control.",
    category: "Inference",
    relatedTerms: ["Multiple Comparisons", "Family-wise Error Rate (FWER)", "False Discovery Rate (FDR)"],
  },

  // --- Regression + GLM-family (models, not tests page content) ---
  {
    term: "Linear Regression",
    definition:
      "A model that relates a continuous outcome to one or more predictors using a linear function; inference typically focuses on residual behavior and uncertainty of coefficients.",
    category: "Modeling",
    relatedTerms: ["Residuals", "Predictor"],
  },
  {
    term: "Logistic Regression",
    definition:
      "A model for binary outcomes that links predictors to the log-odds of the event; effects are often summarized using odds ratios.",
    category: "Modeling",
    relatedTerms: ["Binary Outcome", "Odds Ratio"],
  },
  {
    term: "Poisson Regression",
    definition:
      "A model for count outcomes that assumes the mean equals the variance; violations often appear as overdispersion.",
    category: "Modeling",
    relatedTerms: ["Count Outcome", "Overdispersion"],
  },
  {
    term: "Negative Binomial Regression",
    definition:
      "A model for count outcomes that allows variance to exceed the mean, commonly used when overdispersion is present.",
    category: "Modeling",
    relatedTerms: ["Count Outcome", "Overdispersion"],
  },
  {
    term: "Ordinal Logistic Regression",
    definition:
      "A model for ordered categorical outcomes (e.g., Likert scales) that respects the natural ordering of categories.",
    category: "Modeling",
    relatedTerms: ["Ordinal Outcome"],
  },
  {
    term: "Quantile Regression",
    definition:
      "A regression approach that models conditional quantiles (e.g., median) rather than the conditional mean, useful when effects differ across the outcome distribution.",
    category: "Modeling",
    relatedTerms: ["Linear Regression"],
  },
  {
    term: "Generalized Estimating Equations (GEE)",
    definition:
      "A modeling framework for correlated observations (e.g., repeated measures) that focuses on population-average effects without requiring full random-effects specification.",
    category: "Modeling",
    relatedTerms: ["Repeated Measures", "Clustered Data"],
  },
  {
    term: "Mixed Models",
    definition:
      "Models that include both fixed effects and random effects to handle clustered or repeated-measures data (e.g., LMM/GLMM).",
    category: "Modeling",
    relatedTerms: ["Fixed Effects", "Random Effects", "Clustered Data", "Repeated Measures"],
  },

  // --- Survival concepts (non-test terms) ---
  {
    term: "Censoring",
    definition:
      "In time-to-event data, censoring occurs when the event is not observed for some units during the study period (e.g., study ends before the event).",
    category: "Survival",
    relatedTerms: ["Time-to-Event Outcome"],
  },
  {
    term: "Proportional Hazards Assumption",
    definition:
      "An assumption that the hazard ratio between groups (or per predictor change) is constant over time, commonly used in Cox modeling.",
    category: "Survival",
    relatedTerms: ["Hazard", "Hazard Ratio"],
  },
  {
    term: "Competing Risks",
    definition:
      "A survival setting where multiple event types are possible and the occurrence of one type prevents the others from occurring.",
    category: "Survival",
    relatedTerms: ["Censoring", "Time-to-Event Outcome"],
  },

  // --- Time series concepts (non-test terms) ---
  {
    term: "Stationarity",
    definition:
      "A time series property where key characteristics (like mean and variance) are stable over time; many classical time-series models rely on it.",
    category: "Time Series",
    relatedTerms: ["Autocorrelation"],
  },
  {
    term: "Autocorrelation",
    definition:
      "Correlation of a time series with its own past values; important for diagnosing and modeling time-dependent structure.",
    category: "Time Series",
    relatedTerms: ["Stationarity"],
  },

  // --- Dimension reduction + clustering (concepts) ---
  {
    term: "Dimensionality Reduction",
    definition:
      "Techniques that represent data using fewer variables (dimensions) while preserving important structure, often for visualization or modeling efficiency.",
    category: "Unsupervised",
    relatedTerms: ["PCA", "Embedding"],
  },
  {
    term: "Principal Component",
    definition:
      "A new variable created as a weighted combination of original variables, chosen to capture as much variance as possible (in order).",
    category: "Unsupervised",
    relatedTerms: ["PCA", "Variance"],
  },
  {
    term: "Cluster",
    definition:
      "A group of observations that are more similar to each other than to observations in other groups, as identified by a clustering method.",
    category: "Unsupervised",
    relatedTerms: ["Clustering", "Distance Metric"],
  },
  {
    term: "Clustering",
    definition:
      "Unsupervised methods that group observations based on similarity without using labeled outcomes.",
    category: "Unsupervised",
    relatedTerms: ["Cluster", "Distance Metric"],
  },
  {
    term: "Distance Metric",
    definition:
      "A rule for measuring similarity/dissimilarity between observations (e.g., Euclidean distance), used heavily in clustering and k-NN-style methods.",
    category: "Unsupervised",
    relatedTerms: ["Clustering"],
  },

  // --- ML evaluation / general modeling concepts (non-test entries) ---
  {
    term: "Training Set",
    definition:
      "The subset of data used to fit a model’s parameters.",
    category: "Machine Learning",
    relatedTerms: ["Validation Set", "Test Set", "Data Leakage"],
  },
  {
    term: "Validation Set",
    definition:
      "A subset of data used during model development to tune settings (hyperparameters) and select models, separate from the final test set.",
    category: "Machine Learning",
    relatedTerms: ["Training Set", "Test Set", "Cross-Validation"],
  },
  {
    term: "Test Set",
    definition:
      "A held-out subset of data used once at the end to estimate out-of-sample performance after model selection is complete.",
    category: "Machine Learning",
    relatedTerms: ["Training Set", "Validation Set", "Data Leakage"],
  },
  {
    term: "Cross-Validation",
    definition:
      "A resampling approach that repeatedly splits data into training/validation parts to estimate performance more reliably and tune models.",
    category: "Machine Learning",
    relatedTerms: ["Validation Set", "Overfitting"],
  },
  {
    term: "Overfitting",
    definition:
      "When a model learns patterns specific to the training data (including noise) and performs worse on new data.",
    category: "Machine Learning",
    relatedTerms: ["Regularization", "Cross-Validation"],
  },
  {
    term: "Regularization",
    definition:
      "Techniques that constrain model complexity to reduce overfitting (e.g., penalties on coefficient size).",
    category: "Machine Learning",
    relatedTerms: ["Overfitting"],
  },
  {
    term: "Data Leakage",
    definition:
      "When information from outside the training process (e.g., from a test/validation set or future data) accidentally influences model training or feature creation, inflating performance estimates.",
    category: "Machine Learning",
    relatedTerms: ["Training Set", "Validation Set", "Test Set"],
  },

  // --- Shared “types” used throughout the wizard ---
  {
    term: "Continuous Outcome",
    definition:
      "An outcome measured on a numeric scale with many possible values (e.g., height, time, temperature).",
    category: "Data Types",
    relatedTerms: ["Binary Outcome", "Count Outcome", "Ordinal Outcome"],
  },
  {
    term: "Binary Outcome",
    definition:
      "An outcome with exactly two possible values (e.g., yes/no, success/failure).",
    category: "Data Types",
    relatedTerms: ["Continuous Outcome", "Count Outcome", "Ordinal Outcome"],
  },
  {
    term: "Count Outcome",
    definition:
      "An outcome representing non-negative integer counts (e.g., number of events).",
    category: "Data Types",
    relatedTerms: ["Overdispersion"],
  },
  {
    term: "Ordinal Outcome",
    definition:
      "A categorical outcome with an inherent order (e.g., low/medium/high; Likert scale).",
    category: "Data Types",
    relatedTerms: ["Ordinal Logistic Regression"],
  },
  {
    term: "Time-to-Event Outcome",
    definition:
      "An outcome representing the time until an event occurs (e.g., time to relapse), often with censoring.",
    category: "Data Types",
    relatedTerms: ["Censoring"],
  },

  // --- Small but useful terms referenced by the above ---
  {
    term: "Residuals",
    definition:
      "The differences between observed outcomes and model-predicted values; residual behavior is central to many diagnostics.",
    category: "Diagnostics",
    relatedTerms: ["Homoscedasticity", "Normality", "Influential Point"],
  },
  {
    term: "Standard Error",
    definition:
      "A measure of uncertainty in an estimated quantity (like a mean or regression coefficient), reflecting sampling variability.",
    category: "Estimation",
    relatedTerms: ["Confidence Interval"],
  },
  {
    term: "Sample Size",
    definition:
      "The number of observations (or experimental units) included in an analysis; larger samples typically reduce uncertainty.",
    category: "Power & Planning",
    relatedTerms: ["Power", "Standard Error", "Effect Size"],
  },
  {
    term: "Predictor",
    definition:
      "An input variable used to explain or predict an outcome in a model (also called an independent variable or feature).",
    category: "Modeling",
    relatedTerms: ["Covariate", "Multicollinearity"],
  },
  {
    term: "Bias",
    definition:
      "Systematic error that shifts estimates away from the true value (e.g., from confounding, selection effects, or measurement error).",
    category: "Inference",
    relatedTerms: ["Confounder"],
  },
  {
    term: "Hazard",
    definition:
      "In survival analysis, the instantaneous event rate at a given time, conditional on having survived up to that time.",
    category: "Survival",
    relatedTerms: ["Hazard Ratio", "Time-to-Event Outcome"],
  },
  {
    term: "Hazard Ratio",
    definition:
      "A relative measure comparing hazards between groups (or per unit change in a predictor); values >1 indicate higher hazard in the numerator group.",
    category: "Survival",
    relatedTerms: ["Hazard", "Proportional Hazards Assumption"],
  },
  {
    term: "Variance",
    definition:
      "A measure of spread describing how far values tend to deviate from the mean; it is the square of the standard deviation.",
    category: "Foundations",
    relatedTerms: ["Standard Deviation", "Principal Component"],
  },
  {
    term: "Standard Deviation",
    definition:
      "The square root of variance; a common measure of spread on the original scale of the data.",
    category: "Foundations",
    relatedTerms: ["Variance"],
  },
  {
    term: "Embedding",
    definition:
      "A mapping from high-dimensional data into a lower-dimensional space intended to preserve meaningful structure (often for visualization or downstream modeling).",
    category: "Unsupervised",
    relatedTerms: ["Dimensionality Reduction"],
  },
];