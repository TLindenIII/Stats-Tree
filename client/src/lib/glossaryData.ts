export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "P-value",
    definition: "The probability of obtaining test results at least as extreme as the results actually observed, under the assumption that the null hypothesis is correct.",
    category: "Inference",
  },
  {
    term: "Null Hypothesis",
    definition: "A general statement or default position that there is no relationship between two measured phenomena, or no association among groups.",
    category: "Inference",
    relatedTerms: ["Alternative Hypothesis", "P-value"],
  },
  {
    term: "Alternative Hypothesis",
    definition: "The hypothesis that sample observations are influenced by some non-random cause.",
    category: "Inference",
    relatedTerms: ["Null Hypothesis"],
  },
  {
    term: "Normal Distribution",
    definition: "A probability distribution that is symmetric about the mean, showing that data near the mean are more frequent in occurrence than data far from the mean.",
    category: "Distribution",
  },
  {
    term: "Type I Error",
    definition: "The rejection of a true null hypothesis (false positive).",
    category: "Inference",
  },
  {
    term: "Type II Error",
    definition: "The failure to reject a false null hypothesis (false negative).",
    category: "Inference",
  },
  {
    term: "Confidence Interval",
    definition: "A range of values so defined that there is a specified probability that the value of a parameter lies within it.",
    category: "Estimation",
  },
];
