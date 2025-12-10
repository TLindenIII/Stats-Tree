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
      { value: "independence", label: "Test independence", description: "Chi-square tests, contingency tables" },
      { value: "time", label: "Model time structure", description: "Time series, survival analysis" },
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
    ],
  },
  {
    id: "num-groups",
    title: "Groups",
    question: "How many groups are you comparing?",
    options: [
      { value: "one", label: "One group", description: "Comparing to a known value or standard" },
      { value: "two", label: "Two groups", description: "Comparing two conditions or populations" },
      { value: "multiple", label: "Multiple groups", description: "Three or more groups" },
    ],
  },
  {
    id: "assumptions",
    title: "Assumptions",
    question: "Can you meet parametric assumptions?",
    options: [
      { value: "parametric", label: "Yes - Data is normally distributed", description: "Normal distribution, equal variances" },
      { value: "nonparametric", label: "No - Need non-parametric methods", description: "Skewed data, ordinal outcomes, small samples" },
      { value: "unsure", label: "Not sure", description: "Will provide recommendations for both" },
    ],
  },
];

export const statisticalTests: StatTest[] = [
  {
    id: "t-test-independent",
    name: "Independent Samples t-Test",
    description: "Compares means of two independent groups to determine if they are statistically different.",
    assumptions: ["Normal distribution in each group", "Equal variances (can be relaxed with Welch's t-test)", "Independent observations", "Continuous outcome"],
    whenToUse: ["Comparing two independent group means", "Sample size > 30 per group (or normally distributed)", "Continuous outcome variable"],
    alternatives: ["Mann-Whitney U test (non-parametric)", "Welch's t-test (unequal variances)"],
    methodFamily: "Parametric",
  },
  {
    id: "paired-t-test",
    name: "Paired Samples t-Test",
    description: "Compares means from the same group at two different times or under two different conditions.",
    assumptions: ["Differences are normally distributed", "Paired/matched observations", "Continuous outcome"],
    whenToUse: ["Before-after comparisons", "Matched pairs design", "Crossover studies"],
    alternatives: ["Wilcoxon signed-rank test (non-parametric)"],
    methodFamily: "Parametric",
  },
  {
    id: "one-way-anova",
    name: "One-Way ANOVA",
    description: "Tests whether there are statistically significant differences between the means of three or more independent groups.",
    assumptions: ["Normal distribution in each group", "Equal variances (homoscedasticity)", "Independent observations"],
    whenToUse: ["Comparing 3+ group means", "One categorical predictor", "Continuous outcome"],
    alternatives: ["Kruskal-Wallis H test (non-parametric)", "Welch's ANOVA (unequal variances)"],
    methodFamily: "Parametric",
  },
  {
    id: "mann-whitney",
    name: "Mann-Whitney U Test",
    description: "Non-parametric test that compares distributions of two independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Non-normal distributions", "Ordinal data", "Small sample sizes"],
    alternatives: ["Independent t-test (parametric)"],
    methodFamily: "Nonparametric",
  },
  {
    id: "chi-square",
    name: "Chi-Square Test of Independence",
    description: "Tests whether there is a significant association between two categorical variables.",
    assumptions: ["Expected cell count >= 5 in 80% of cells", "Independent observations", "Categorical variables"],
    whenToUse: ["Testing association between categorical variables", "Contingency tables", "Independence testing"],
    alternatives: ["Fisher's exact test (small samples)"],
    methodFamily: "Nonparametric",
  },
  {
    id: "pearson-correlation",
    name: "Pearson Correlation",
    description: "Measures the linear relationship between two continuous variables.",
    assumptions: ["Linear relationship", "Bivariate normality", "No outliers", "Continuous variables"],
    whenToUse: ["Measuring linear association", "Both variables continuous", "Normally distributed data"],
    alternatives: ["Spearman correlation (non-parametric)", "Kendall's tau (ordinal)"],
    methodFamily: "Parametric",
  },
  {
    id: "linear-regression",
    name: "Linear Regression",
    description: "Models the relationship between a continuous outcome and one or more predictors.",
    assumptions: ["Linear relationship", "Normal residuals", "Homoscedasticity", "Independence of errors"],
    whenToUse: ["Predicting continuous outcomes", "Multiple predictors", "Quantifying relationships"],
    alternatives: ["Robust regression (outliers)", "Quantile regression"],
    methodFamily: "Regression-based",
  },
  {
    id: "logistic-regression",
    name: "Logistic Regression",
    description: "Models the probability of a binary outcome based on one or more predictors.",
    assumptions: ["Binary outcome", "Independence of observations", "No multicollinearity", "Linear relationship with log-odds"],
    whenToUse: ["Binary classification", "Odds ratio estimation", "Multiple predictors"],
    alternatives: ["Probit regression", "Discriminant analysis"],
    methodFamily: "Regression-based",
  },
  {
    id: "wilcoxon-signed-rank",
    name: "Wilcoxon Signed-Rank Test",
    description: "Non-parametric test for comparing two related samples or repeated measurements.",
    assumptions: ["Paired observations", "Ordinal or continuous outcome", "Symmetric distribution of differences"],
    whenToUse: ["Paired data with non-normal differences", "Ordinal outcomes", "Before-after comparisons"],
    alternatives: ["Paired t-test (parametric)"],
    methodFamily: "Nonparametric",
  },
  {
    id: "kruskal-wallis",
    name: "Kruskal-Wallis H Test",
    description: "Non-parametric alternative to one-way ANOVA for comparing three or more independent groups.",
    assumptions: ["Independent samples", "Ordinal or continuous outcome", "Similar distribution shapes"],
    whenToUse: ["Comparing 3+ groups with non-normal data", "Ordinal outcomes", "Unequal group sizes"],
    alternatives: ["One-way ANOVA (parametric)"],
    methodFamily: "Nonparametric",
  },
];

export function getRecommendedTests(selections: Record<string, string>): StatTest[] {
  const { "research-goal": goal, "outcome-type": outcome, "sample-structure": structure, "num-groups": groups, assumptions } = selections;
  
  let recommended: StatTest[] = [];
  
  if (goal === "compare" && outcome === "continuous") {
    if (groups === "two") {
      if (structure === "independent") {
        if (assumptions === "parametric") {
          recommended.push(statisticalTests.find(t => t.id === "t-test-independent")!);
        } else {
          recommended.push(statisticalTests.find(t => t.id === "mann-whitney")!);
        }
      } else if (structure === "paired") {
        if (assumptions === "parametric") {
          recommended.push(statisticalTests.find(t => t.id === "paired-t-test")!);
        } else {
          recommended.push(statisticalTests.find(t => t.id === "wilcoxon-signed-rank")!);
        }
      }
    } else if (groups === "multiple") {
      if (assumptions === "parametric") {
        recommended.push(statisticalTests.find(t => t.id === "one-way-anova")!);
      } else {
        recommended.push(statisticalTests.find(t => t.id === "kruskal-wallis")!);
      }
    }
  } else if (goal === "relationship" && outcome === "continuous") {
    recommended.push(statisticalTests.find(t => t.id === "pearson-correlation")!);
  } else if (goal === "predict") {
    if (outcome === "continuous") {
      recommended.push(statisticalTests.find(t => t.id === "linear-regression")!);
    } else if (outcome === "binary") {
      recommended.push(statisticalTests.find(t => t.id === "logistic-regression")!);
    }
  } else if (goal === "independence" && (outcome === "categorical" || outcome === "binary")) {
    recommended.push(statisticalTests.find(t => t.id === "chi-square")!);
  }
  
  if (recommended.length === 0 || assumptions === "unsure") {
    if (goal === "compare" && groups === "two" && structure === "independent") {
      recommended = [
        statisticalTests.find(t => t.id === "t-test-independent")!,
        statisticalTests.find(t => t.id === "mann-whitney")!,
      ];
    } else if (goal === "compare" && groups === "multiple") {
      recommended = [
        statisticalTests.find(t => t.id === "one-way-anova")!,
        statisticalTests.find(t => t.id === "kruskal-wallis")!,
      ];
    } else {
      recommended = statisticalTests.slice(0, 3);
    }
  }
  
  return recommended.filter(Boolean);
}
