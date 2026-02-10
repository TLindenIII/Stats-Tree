export type WizardOption = {
  value: string;
  label: string;
  set_tags?: Record<string, any>;
  next: string;
};

export type WizardStep = {
  id: string;
  title: string;
  question: string;
  options: WizardOption[];
};

export type RecommendationRule = {
    id: string;
    when: Record<string, any>; // This can trigger on partial matches
    recommend: string[];
    alternatives: string[];
    add_ons: string[];
};


export const wizardLogic = {
  version: "1.0.0",
  intent: "recommended_only_wizard",
  tag_schema: {
    goal: [
      "compare_groups",
      "association",
      "categorical_association",
      "model_with_predictors",
      "unsupervised",
      "time_series",
      "survival",
      "power_planning",
      "diagnostics_posthoc_effectsize"
    ],
    outcome: ["continuous", "binary", "categorical", "count", "ordinal", "time_to_event", "none"],
    design: ["independent", "paired", "repeated", "clustered", "none"],
    groups: ["two", "three_plus", "none"],
    factors: ["one", "two_plus", "none"],
    assumption: {
      normality: ["yes", "no", "unknown", "na"],
      equal_variance: ["yes", "no", "unknown", "na"],
      small_counts: ["yes", "no", "unknown", "na"],
      overdispersion: ["yes", "no", "unknown", "na"],
      excess_zeros: ["yes", "no", "unknown", "na"]
    },
    task: [
      "independence_test",
      "agreement",
      "effect_size",
      "forecasting",
      "stationarity",
      "model_adequacy",
      "multivariate_dynamics",
      "causality",
      "describe_survival",
      "compare_survival",
      "model_survival",
      "clustering",
      "dim_reduction",
      "power_sample_size",
      "none"
    ],
    modeling_preference: ["interpretable", "predictive_ml", "regularized", "none"]
  },
  steps: [
    {
      id: "goal",
      title: "Research Goal",
      question: "What is your primary goal?",
      options: [
        { value: "compare_groups", label: "Compare groups (differences)", set_tags: { goal: "compare_groups" }, next: "compare_outcome" },
        { value: "association", label: "Measure association (correlation/relationship)", set_tags: { goal: "association" }, next: "assoc_types" },
        { value: "categorical_association", label: "Categorical association / agreement", set_tags: { goal: "categorical_association" }, next: "cat_assoc_task" },
        { value: "model_with_predictors", label: "Model outcome with predictors", set_tags: { goal: "model_with_predictors" }, next: "model_outcome" },
        { value: "unsupervised", label: "Unsupervised learning", set_tags: { goal: "unsupervised" }, next: "unsup_task" },
        { value: "time_series", label: "Time series", set_tags: { goal: "time_series" }, next: "ts_task" },
        { value: "survival", label: "Survival / time-to-event", set_tags: { goal: "survival" }, next: "surv_task" },
        { value: "power_planning", label: "Power / sample size planning", set_tags: { goal: "power_planning" }, next: "power_task" },
        { value: "diagnostics_posthoc_effectsize", label: "Diagnostics / post-hoc / corrections / effect sizes", set_tags: { goal: "diagnostics_posthoc_effectsize" }, next: "diag_task" }
      ]
    },

    {
      id: "compare_outcome",
      title: "Outcome Type",
      question: "What is the outcome type?",
      options: [
        { value: "continuous", label: "Continuous / numeric", set_tags: { outcome: "continuous" }, next: "compare_design_cont" },
        { value: "categorical", label: "Categorical (counts/proportions)", set_tags: { outcome: "categorical" }, next: "compare_design_cat" }
      ]
    },

    {
      id: "compare_design_cont",
      title: "Study Design",
      question: "What is the design?",
      options: [
        { value: "independent", label: "Independent groups", set_tags: { design: "independent" }, next: "compare_groups_n" },
        { value: "paired_repeated", label: "Paired / repeated measures", set_tags: { design: "paired" }, next: "compare_conditions_n" }
      ]
    },

    {
      id: "compare_groups_n",
      title: "Number of Groups",
      question: "How many groups are you comparing?",
      options: [
        { value: "two", label: "Two", set_tags: { groups: "two" }, next: "compare_normality_2g" },
        { value: "three_plus", label: "Three or more", set_tags: { groups: "three_plus" }, next: "compare_factors_3g" }
      ]
    },

    {
      id: "compare_normality_2g",
      title: "Distribution Shape",
      question: "Is the outcome roughly normal/symmetric (or is n large enough that mean-based methods are reasonable)?",
      options: [
        { value: "yes", label: "Yes / roughly normal", set_tags: { assumption: { normality: "yes" } }, next: "compare_equal_var_2g" },
        { value: "no", label: "No / ordinal / heavy tails", set_tags: { assumption: { normality: "no" } }, next: "leaf" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { normality: "unknown" } }, next: "compare_equal_var_2g" }
      ]
    },

    {
      id: "compare_equal_var_2g",
      title: "Variance Similarity",
      question: "Do the groups have similar variance?",
      options: [
        { value: "unknown_default_robust", label: "Not sure / prefer robust default", set_tags: { assumption: { equal_variance: "unknown" } }, next: "leaf" },
        { value: "yes", label: "Yes", set_tags: { assumption: { equal_variance: "yes" } }, next: "leaf" },
        { value: "no", label: "No / clearly unequal", set_tags: { assumption: { equal_variance: "no" } }, next: "leaf" }
      ]
    },

    {
      id: "compare_factors_3g",
      title: "Number of Factors",
      question: "How many categorical factors define groups?",
      options: [
        { value: "one", label: "One factor", set_tags: { factors: "one" }, next: "compare_anova_assumptions" },
        { value: "two_plus", label: "Two or more factors", set_tags: { factors: "two_plus" }, next: "leaf" }
      ]
    },

    {
      id: "compare_anova_assumptions",
      title: "Assumptions",
      question: "Are normality and equal-variance assumptions reasonable?",
      options: [
        { value: "yes", label: "Yes", set_tags: { assumption: { normality: "yes", equal_variance: "yes" } }, next: "posthoc_needed" },
        { value: "no_equal_var", label: "Normal-ish but variances unequal", set_tags: { assumption: { normality: "yes", equal_variance: "no" } }, next: "posthoc_needed" },
        { value: "no", label: "No / ordinal / heavy tails", set_tags: { assumption: { normality: "no" } }, next: "posthoc_needed" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { normality: "unknown", equal_variance: "unknown" } }, next: "posthoc_needed" }
      ]
    },

    {
      id: "posthoc_needed",
      title: "Post-hoc",
      question: "If you find an overall difference, do you need post-hoc comparisons?",
      options: [
        { value: "none", label: "No / not now", set_tags: { task: "none" }, next: "leaf" },
        { value: "all_pairwise", label: "All pairwise comparisons", set_tags: { task: "none" }, next: "leaf" },
        { value: "vs_control", label: "Compare to a control group", set_tags: { task: "none" }, next: "leaf" }
      ]
    },

    {
      id: "compare_conditions_n",
      title: "Conditions",
      question: "How many conditions/timepoints per subject?",
      options: [
        { value: "two", label: "Two", set_tags: { groups: "two", design: "paired" }, next: "paired_normality" },
        { value: "three_plus", label: "Three or more", set_tags: { groups: "three_plus", design: "repeated" }, next: "repeated_normality" }
      ]
    },

    {
      id: "paired_normality",
      title: "Distribution Shape",
      question: "Is the paired difference roughly normal/symmetric?",
      options: [
        { value: "yes", label: "Yes", set_tags: { assumption: { normality: "yes" } }, next: "leaf" },
        { value: "no", label: "No / ordinal / heavy tails", set_tags: { assumption: { normality: "no" } }, next: "leaf" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { normality: "unknown" } }, next: "leaf" }
      ]
    },

    {
      id: "repeated_normality",
      title: "Assumptions",
      question: "Are normality-based repeated-measures assumptions reasonable?",
      options: [
        { value: "yes", label: "Yes", set_tags: { assumption: { normality: "yes" } }, next: "leaf" },
        { value: "no", label: "No / ordinal / heavy tails", set_tags: { assumption: { normality: "no" } }, next: "leaf" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { normality: "unknown" } }, next: "leaf" }
      ]
    },

    {
      id: "compare_design_cat",
      title: "Study Design",
      question: "What is the design?",
      options: [
        { value: "independent", label: "Independent groups", set_tags: { design: "independent" }, next: "cat_table_shape" },
        { value: "paired_binary", label: "Paired binary (pre/post on same units)", set_tags: { design: "paired", outcome: "binary" }, next: "leaf" }
      ]
    },

    {
      id: "cat_table_shape",
      title: "Contingency Table",
      question: "What best describes the table?",
      options: [
        { value: "two_by_two", label: "2×2", set_tags: { groups: "two" }, next: "small_counts" },
        { value: "rx_c", label: "r×c (larger than 2×2)", set_tags: { groups: "three_plus" }, next: "leaf" }
      ]
    },

    {
      id: "small_counts",
      title: "Expected Counts",
      question: "Are expected counts small (e.g., many cells < 5)?",
      options: [
        { value: "yes", label: "Yes / small counts", set_tags: { assumption: { small_counts: "yes" } }, next: "leaf" },
        { value: "no", label: "No / adequate counts", set_tags: { assumption: { small_counts: "no" } }, next: "leaf" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { small_counts: "unknown" } }, next: "leaf" }
      ]
    },

    {
      id: "assoc_types",
      title: "Variable Types",
      question: "What variables are you associating?",
      options: [
        { value: "cont_cont", label: "Continuous–continuous", set_tags: { outcome: "none" }, next: "assoc_shape" },
        { value: "bin_cont", label: "Binary–continuous", set_tags: { outcome: "none" }, next: "leaf" }
      ]
    },

    {
      id: "assoc_shape",
      title: "Relationship Shape",
      question: "What best describes the relationship / measurement scale?",
      options: [
        { value: "linear_normalish", label: "Linear-ish and normal-ish", set_tags: { assumption: { normality: "yes" } }, next: "partial_needed" },
        { value: "monotone_robust", label: "Monotone/ordinal or want robustness", set_tags: { assumption: { normality: "no" } }, next: "partial_needed" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { normality: "unknown" } }, next: "partial_needed" }
      ]
    },

    {
      id: "partial_needed",
      title: "Control Variables",
      question: "Do you need the association controlling for other variables?",
      options: [
        { value: "no", label: "No", set_tags: { task: "none" }, next: "leaf" },
        { value: "yes", label: "Yes", set_tags: { task: "none" }, next: "leaf" }
      ]
    },

    {
      id: "cat_assoc_task",
      title: "Categorical Focus",
      question: "What do you need?",
      options: [
        { value: "independence", label: "Test independence (contingency table)", set_tags: { task: "independence_test" }, next: "cat_assoc_counts" },
        { value: "agreement", label: "Agreement between raters", set_tags: { task: "agreement" }, next: "agreement_raters" },
        { value: "effect_size", label: "Effect size for association", set_tags: { task: "effect_size" }, next: "leaf" }
      ]
    },

    {
      id: "cat_assoc_counts",
      title: "Counts",
      question: "Are expected counts small (especially in a 2×2)?",
      options: [
        { value: "yes", label: "Yes / small counts", set_tags: { assumption: { small_counts: "yes" } }, next: "leaf" },
        { value: "no", label: "No / adequate counts", set_tags: { assumption: { small_counts: "no" } }, next: "leaf" },
        { value: "unknown", label: "Not sure", set_tags: { assumption: { small_counts: "unknown" } }, next: "leaf" }
      ]
    },

    {
      id: "agreement_raters",
      title: "Raters",
      question: "How many raters?",
      options: [
        { value: "two", label: "Two", set_tags: { groups: "two" }, next: "leaf" },
        { value: "three_plus", label: "Three or more", set_tags: { groups: "three_plus" }, next: "leaf" }
      ]
    },

    {
      id: "model_outcome",
      title: "Outcome Type",
      question: "What is the outcome type?",
      options: [
        { value: "continuous", label: "Continuous", set_tags: { outcome: "continuous" }, next: "model_preference_cont" },
        { value: "binary", label: "Binary", set_tags: { outcome: "binary" }, next: "model_preference_bin" },
        { value: "count", label: "Count", set_tags: { outcome: "count" }, next: "count_behavior" },
        { value: "ordinal", label: "Ordinal", set_tags: { outcome: "ordinal" }, next: "leaf" },
        { value: "time_to_event", label: "Time-to-event", set_tags: { outcome: "time_to_event" }, next: "leaf" },
        { value: "multivariate", label: "Multiple continuous outcomes", set_tags: { outcome: "continuous" }, next: "leaf" }
      ]
    },

    {
      id: "model_preference_cont",
      title: "Modeling Preference",
      question: "What is your priority?",
      options: [
        { value: "interpretable", label: "Interpretable inference", set_tags: { modeling_preference: "interpretable" }, next: "clustered_data" },
        { value: "regularized", label: "Regularized (many predictors)", set_tags: { modeling_preference: "regularized" }, next: "clustered_data" },
        { value: "predictive_ml", label: "Predictive ML (nonlinear)", set_tags: { modeling_preference: "predictive_ml" }, next: "clustered_data" }
      ]
    },

    {
      id: "model_preference_bin",
      title: "Modeling Preference",
      question: "What is your priority?",
      options: [
        { value: "interpretable", label: "Interpretable inference", set_tags: { modeling_preference: "interpretable" }, next: "clustered_data" },
        { value: "predictive_ml", label: "Predictive ML (nonlinear)", set_tags: { modeling_preference: "predictive_ml" }, next: "clustered_data" }
      ]
    },

    {
      id: "count_behavior",
      title: "Count Behavior",
      question: "What best describes the count outcome?",
      options: [
        { value: "standard", label: "Typical counts", set_tags: { assumption: { overdispersion: "unknown", excess_zeros: "unknown" } }, next: "clustered_data" },
        { value: "overdispersed", label: "Overdispersed (variance >> mean)", set_tags: { assumption: { overdispersion: "yes" } }, next: "clustered_data" },
        { value: "excess_zeros", label: "Many zeros", set_tags: { assumption: { excess_zeros: "yes" } }, next: "clustered_data" }
      ]
    },

    {
      id: "clustered_data",
      title: "Dependence Structure",
      question: "Is the data clustered/repeated (subjects, sites, random effects)?",
      options: [
        { value: "no", label: "No", set_tags: { design: "none" }, next: "leaf" },
        { value: "yes", label: "Yes", set_tags: { design: "clustered" }, next: "leaf" }
      ]
    },

    {
      id: "unsup_task",
      title: "Unsupervised Task",
      question: "What do you want to do?",
      options: [
        { value: "clustering", label: "Clustering", set_tags: { task: "clustering" }, next: "leaf" },
        { value: "dim_reduction", label: "Dimension reduction / embedding", set_tags: { task: "dim_reduction" }, next: "leaf" }
      ]
    },

    {
      id: "ts_task",
      title: "Time Series Task",
      question: "What is your primary time-series task?",
      options: [
        { value: "forecasting", label: "Forecasting", set_tags: { task: "forecasting" }, next: "leaf" },
        { value: "stationarity", label: "Stationarity check", set_tags: { task: "stationarity" }, next: "leaf" },
        { value: "model_adequacy", label: "Model adequacy / autocorrelation", set_tags: { task: "model_adequacy" }, next: "leaf" },
        { value: "multivariate", label: "Multivariate dynamics", set_tags: { task: "multivariate_dynamics" }, next: "leaf" },
        { value: "causality", label: "Causality between series", set_tags: { task: "causality" }, next: "leaf" }
      ]
    },

    {
      id: "surv_task",
      title: "Survival Task",
      question: "What do you need?",
      options: [
        { value: "describe", label: "Describe survival curve", set_tags: { task: "describe_survival", outcome: "time_to_event" }, next: "leaf" },
        { value: "compare", label: "Compare survival curves", set_tags: { task: "compare_survival", outcome: "time_to_event" }, next: "leaf" },
        { value: "model", label: "Model survival with covariates", set_tags: { task: "model_survival", outcome: "time_to_event" }, next: "leaf" }
      ]
    },

    {
      id: "power_task",
      title: "Power",
      question: "Do you need power/sample size planning?",
      options: [
        { value: "yes", label: "Yes", set_tags: { task: "power_sample_size" }, next: "leaf" }
      ]
    },

    {
      id: "diag_task",
      title: "Diagnostics & Add-ons",
      question: "What do you need?",
      options: [
        { value: "normality", label: "Normality check", set_tags: { task: "none" }, next: "leaf" },
        { value: "equal_variance", label: "Equal variance check", set_tags: { task: "none" }, next: "leaf" },
        { value: "autocorr", label: "Regression autocorrelation", set_tags: { task: "none" }, next: "leaf" },
        { value: "heterosk", label: "Heteroskedasticity", set_tags: { task: "none" }, next: "leaf" },
        { value: "multiple_testing", label: "Multiple testing correction", set_tags: { task: "none" }, next: "leaf" },
        { value: "posthoc", label: "Post-hoc comparisons", set_tags: { task: "none" }, next: "leaf" },
        { value: "effect_size", label: "Effect size", set_tags: { task: "effect_size" }, next: "leaf" }
      ]
    }
  ],
  recommendation_rules: [
    {
      id: "cmp_cont_ind_2g_nonNormal",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "two", assumption: { normality: "no" } },
      recommend: ["mann-whitney"],
      alternatives: ["bootstrap", "permutation-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },
    {
      id: "cmp_cont_ind_2g_normal_default",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "two", assumption: { normality: "yes" } },
      recommend: ["welch-t-test"],
      alternatives: ["t-test-independent", "bayesian-t-test", "bootstrap", "permutation-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },
    {
      id: "cmp_cont_ind_2g_normal_equalVarYes",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "two", assumption: { normality: "yes", equal_variance: "yes" } },
      recommend: ["t-test-independent"],
      alternatives: ["welch-t-test", "bayesian-t-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },
    {
      id: "cmp_cont_ind_2g_normal_equalVarNo",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "two", assumption: { normality: "yes", equal_variance: "no" } },
      recommend: ["welch-t-test"],
      alternatives: ["t-test-independent", "bayesian-t-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },

    {
      id: "cmp_cont_paired_2g_normal",
      when: { goal: "compare_groups", outcome: "continuous", design: "paired", groups: "two", assumption: { normality: "yes" } },
      recommend: ["paired-t-test"],
      alternatives: ["bayesian-t-test", "bootstrap", "permutation-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },
    {
      id: "cmp_cont_paired_2g_nonNormal",
      when: { goal: "compare_groups", outcome: "continuous", design: "paired", groups: "two", assumption: { normality: "no" } },
      recommend: ["wilcoxon-signed-rank"],
      alternatives: ["bootstrap", "permutation-test"],
      add_ons: ["cohens-d", "hedges-g"]
    },

    {
      id: "cmp_cont_ind_3p_1factor_equalVar",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "three_plus", factors: "one", assumption: { normality: "yes", equal_variance: "yes" } },
      recommend: ["one-way-anova"],
      alternatives: ["welch-anova", "bayesian-anova"],
      add_ons: ["eta-squared"]
    },
    {
      id: "cmp_cont_ind_3p_1factor_unequalVar",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "three_plus", factors: "one", assumption: { equal_variance: "no" } },
      recommend: ["welch-anova"],
      alternatives: ["one-way-anova", "bayesian-anova"],
      add_ons: ["eta-squared"]
    },
    {
      id: "cmp_cont_ind_3p_1factor_nonNormal",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "three_plus", factors: "one", assumption: { normality: "no" } },
      recommend: ["kruskal-wallis"],
      alternatives: ["bootstrap", "permutation-test"],
      add_ons: ["eta-squared"]
    },
    {
      id: "cmp_cont_ind_3p_2plusFactors",
      when: { goal: "compare_groups", outcome: "continuous", design: "independent", groups: "three_plus", factors: "two_plus" },
      recommend: ["two-way-anova"],
      alternatives: ["ancova", "manova", "bayesian-anova"],
      add_ons: ["eta-squared"]
    },

    {
      id: "cmp_cont_rep_3p_normal",
      when: { goal: "compare_groups", outcome: "continuous", design: "repeated", groups: "three_plus", assumption: { normality: "yes" } },
      recommend: ["repeated-measures-anova"],
      alternatives: ["linear-mixed-model", "bayesian-anova"],
      add_ons: ["eta-squared"]
    },
    {
      id: "cmp_cont_rep_3p_nonNormal",
      when: { goal: "compare_groups", outcome: "continuous", design: "repeated", groups: "three_plus", assumption: { normality: "no" } },
      recommend: ["friedman-test"],
      alternatives: ["bootstrap", "permutation-test"],
      add_ons: ["eta-squared"]
    },

    {
      id: "cmp_cat_paired_binary",
      when: { goal: "compare_groups", outcome: "binary", design: "paired" },
      recommend: ["mcnemar-test"],
      alternatives: ["cochran-q"],
      add_ons: ["odds-ratio"]
    },
    {
      id: "cmp_cat_ind_2x2_small",
      when: { goal: "compare_groups", outcome: "categorical", design: "independent", groups: "two", assumption: { small_counts: "yes" } },
      recommend: ["fisher-exact"],
      alternatives: ["chi-square"],
      add_ons: ["odds-ratio", "cramers-v"]
    },
    {
      id: "cmp_cat_ind_2x2_ok",
      when: { goal: "compare_groups", outcome: "categorical", design: "independent", groups: "two", assumption: { small_counts: "no" } },
      recommend: ["chi-square"],
      alternatives: ["fisher-exact"],
      add_ons: ["odds-ratio", "cramers-v"]
    },
    {
      id: "cmp_cat_ind_rxc",
      when: { goal: "compare_groups", outcome: "categorical", design: "independent", groups: "three_plus" },
      recommend: ["chi-square"],
      alternatives: [],
      add_ons: ["cramers-v"]
    },

    {
      id: "assoc_contcont_linear",
      when: { goal: "association", assumption: { normality: "yes" } },
      recommend: ["pearson-correlation"],
      alternatives: ["spearman-correlation", "kendall-tau"],
      add_ons: []
    },
    {
      id: "assoc_contcont_robust",
      when: { goal: "association", assumption: { normality: "no" } },
      recommend: ["spearman-correlation"],
      alternatives: ["kendall-tau"],
      add_ons: []
    },
    {
      id: "assoc_partial",
      when: { goal: "association", task: "none", assumption: { normality: "unknown" } },
      recommend: ["spearman-correlation"],
      alternatives: ["pearson-correlation", "kendall-tau"],
      add_ons: []
    },
    {
      id: "assoc_control_vars",
      when: { goal: "association", task: "none" },
      recommend: ["partial-correlation"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "assoc_bin_cont",
      when: { goal: "association" },
      recommend: ["point-biserial"],
      alternatives: [],
      add_ons: []
    },

    {
      id: "cat_assoc_independence_small",
      when: { goal: "categorical_association", task: "independence_test", assumption: { small_counts: "yes" } },
      recommend: ["fisher-exact"],
      alternatives: ["chi-square"],
      add_ons: ["cramers-v", "odds-ratio"]
    },
    {
      id: "cat_assoc_independence_ok",
      when: { goal: "categorical_association", task: "independence_test", assumption: { small_counts: "no" } },
      recommend: ["chi-square"],
      alternatives: ["fisher-exact"],
      add_ons: ["cramers-v", "odds-ratio"]
    },
    {
      id: "cat_assoc_agreement_2",
      when: { goal: "categorical_association", task: "agreement", groups: "two" },
      recommend: ["cohens-kappa"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "cat_assoc_agreement_3p",
      when: { goal: "categorical_association", task: "agreement", groups: "three_plus" },
      recommend: ["fleiss-kappa"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "cat_assoc_effect_size",
      when: { goal: "categorical_association", task: "effect_size" },
      recommend: ["cramers-v"],
      alternatives: ["odds-ratio"],
      add_ons: []
    },

    {
      id: "model_cont_interpretable",
      when: { goal: "model_with_predictors", outcome: "continuous", modeling_preference: "interpretable", design: "none" },
      recommend: ["multiple-regression"],
      alternatives: ["linear-regression", "robust-regression", "quantile-regression", "bayesian-regression"],
      add_ons: ["breusch-pagan", "durbin-watson"]
    },
    {
      id: "model_cont_regularized",
      when: { goal: "model_with_predictors", outcome: "continuous", modeling_preference: "regularized", design: "none" },
      recommend: ["elastic-net"],
      alternatives: ["lasso-ridge"],
      add_ons: []
    },
    {
      id: "model_cont_predictive",
      when: { goal: "model_with_predictors", outcome: "continuous", modeling_preference: "predictive_ml", design: "none" },
      recommend: ["random-forest"],
      alternatives: ["gradient-boosting", "xgboost", "lightgbm", "catboost", "svm", "knn", "decision-tree", "neural-network-mlp"],
      add_ons: []
    },
    {
      id: "model_bin_interpretable",
      when: { goal: "model_with_predictors", outcome: "binary", modeling_preference: "interpretable", design: "none" },
      recommend: ["logistic-regression"],
      alternatives: ["probit-regression", "bayesian-regression"],
      add_ons: ["odds-ratio"]
    },
    {
      id: "model_bin_predictive",
      when: { goal: "model_with_predictors", outcome: "binary", modeling_preference: "predictive_ml", design: "none" },
      recommend: ["random-forest"],
      alternatives: ["gradient-boosting", "xgboost", "lightgbm", "catboost", "svm", "knn", "decision-tree", "naive-bayes", "neural-network-mlp"],
      add_ons: []
    },
    {
      id: "model_count_standard",
      when: { goal: "model_with_predictors", outcome: "count", design: "none" },
      recommend: ["poisson-regression"],
      alternatives: ["negative-binomial", "zero-inflated-poisson"],
      add_ons: []
    },
    {
      id: "model_count_overdisp",
      when: { goal: "model_with_predictors", outcome: "count", assumption: { overdispersion: "yes" }, design: "none" },
      recommend: ["negative-binomial"],
      alternatives: ["poisson-regression"],
      add_ons: []
    },
    {
      id: "model_count_zeros",
      when: { goal: "model_with_predictors", outcome: "count", assumption: { excess_zeros: "yes" }, design: "none" },
      recommend: ["zero-inflated-poisson"],
      alternatives: ["negative-binomial", "poisson-regression"],
      add_ons: []
    },
    {
      id: "model_ordinal",
      when: { goal: "model_with_predictors", outcome: "ordinal" },
      recommend: ["ordinal-regression"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "model_survival",
      when: { goal: "model_with_predictors", outcome: "time_to_event" },
      recommend: ["cox-regression"],
      alternatives: ["accelerated-failure-time", "random-survival-forest"],
      add_ons: []
    },
    {
      id: "model_multivariate_outcomes",
      when: { goal: "model_with_predictors", outcome: "continuous" },
      recommend: ["manova"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "model_clustered_cont",
      when: { goal: "model_with_predictors", outcome: "continuous", design: "clustered" },
      recommend: ["linear-mixed-model"],
      alternatives: ["bayesian-regression"],
      add_ons: []
    },
    {
      id: "model_clustered_nonNormal",
      when: { goal: "model_with_predictors", design: "clustered" },
      recommend: ["glmm"],
      alternatives: [],
      add_ons: []
    },

    {
      id: "unsup_cluster",
      when: { goal: "unsupervised", task: "clustering" },
      recommend: ["kmeans"],
      alternatives: ["hierarchical-clustering", "dbscan", "gaussian-mixture"],
      add_ons: []
    },
    {
      id: "unsup_dimred",
      when: { goal: "unsupervised", task: "dim_reduction" },
      recommend: ["pca"],
      alternatives: ["factor-analysis", "tsne", "umap"],
      add_ons: []
    },

    {
      id: "ts_forecast",
      when: { goal: "time_series", task: "forecasting" },
      recommend: ["arima"],
      alternatives: ["exponential-smoothing", "prophet"],
      add_ons: ["ljung-box", "adf-test"]
    },
    {
      id: "ts_stationarity",
      when: { goal: "time_series", task: "stationarity" },
      recommend: ["adf-test"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "ts_adequacy",
      when: { goal: "time_series", task: "model_adequacy" },
      recommend: ["ljung-box"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "ts_var",
      when: { goal: "time_series", task: "multivariate_dynamics" },
      recommend: ["var"],
      alternatives: [],
      add_ons: ["granger-causality"]
    },
    {
      id: "ts_granger",
      when: { goal: "time_series", task: "causality" },
      recommend: ["granger-causality"],
      alternatives: ["var"],
      add_ons: []
    },

    {
      id: "surv_describe",
      when: { goal: "survival", task: "describe_survival" },
      recommend: ["kaplan-meier"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "surv_compare",
      when: { goal: "survival", task: "compare_survival" },
      recommend: ["log-rank-test"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "surv_model",
      when: { goal: "survival", task: "model_survival" },
      recommend: ["cox-regression"],
      alternatives: ["accelerated-failure-time", "competing-risks", "random-survival-forest"],
      add_ons: []
    },

    {
      id: "power",
      when: { goal: "power_planning", task: "power_sample_size" },
      recommend: ["power-analysis"],
      alternatives: [],
      add_ons: []
    },

    {
      id: "diag_normality",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["shapiro-wilk"],
      alternatives: ["anderson-darling", "dagostino-pearson", "kolmogorov-smirnov"],
      add_ons: []
    },
    {
      id: "diag_equal_var",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["levene-test"],
      alternatives: ["brown-forsythe", "bartlett-test", "fligner-killeen", "hartley-fmax"],
      add_ons: []
    },
    {
      id: "diag_autocorr",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["durbin-watson"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "diag_heterosk",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["breusch-pagan"],
      alternatives: [],
      add_ons: []
    },
    {
      id: "diag_multiple_testing",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["holm-bonferroni"],
      alternatives: ["bonferroni", "benjamini-hochberg"],
      add_ons: []
    },
    {
      id: "diag_posthoc_anova",
      when: { goal: "diagnostics_posthoc_effectsize" },
      recommend: ["tukey-hsd"],
      alternatives: ["games-howell", "scheffe-test", "dunnett-test", "dunn-test"],
      add_ons: []
    },
    {
      id: "diag_effect_size",
      when: { goal: "diagnostics_posthoc_effectsize", task: "effect_size" },
      recommend: ["cohens-d"],
      alternatives: ["hedges-g", "eta-squared", "odds-ratio", "cramers-v"],
      add_ons: []
    }
  ],
  leaf_resolution: {
    strategy: "first_match_with_most_specificity",
    tie_breakers: ["more_keys_in_when", "prefer_rules_order"],
    fallback: {
      recommend: [],
      alternatives: [],
      add_ons: [],
      message: "No exact match. Consider browsing all tests or relaxing assumptions/inputs."
    }
  }
};
