#!/usr/bin/env node
/**
 * Fix rules that need a goal requirement.
 * Tests that only make sense for specific branches should require the goal.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "client", "src", "lib", "statsData.ts");

let src = readFileSync(FILE, "utf-8");

// Map of test ID → the goal that should be added to requires
const fixes = {
  // Survival tests — need goal: "survival"
  "kaplan-meier":             { add: 'goal: "survival"', field: "survivalTask" },
  "log-rank-test":            { add: 'goal: "survival"', field: "survivalTask" },
  "cox-regression":           { add: 'goal: "survival"', field: "survivalTask" },
  "accelerated-failure-time": { add: 'goal: "survival"', field: "survivalTask" },
  "competing-risks":          { add: 'goal: "survival"', field: "survivalTask" },
  "random-survival-forest":   { add: 'goal: "survival"', field: "survivalTask" },
  
  // Time series tests — need goal: "time_series"
  "arima":                    { add: 'goal: "time_series"', field: "tsTask" },
  "exponential-smoothing":    { add: 'goal: "time_series"', field: "tsTask" },
  "prophet":                  { add: 'goal: "time_series"', field: "tsTask" },
  "adf-test":                 { add: 'goal: "time_series"', field: "tsTask" },
  "granger-causality":        { add: 'goal: "time_series"', field: "tsTask" },
  "ljung-box":                { add: 'goal: "time_series"', field: "tsTask" },
  "var":                      { add: 'goal: "time_series"', field: "tsTask" },
  
  // Unsupervised tests — need goal: "unsupervised"
  "kmeans":                   { add: 'goal: "unsupervised"', field: "unsupTask" },
  "hierarchical-clustering":  { add: 'goal: "unsupervised"', field: "unsupTask" },
  "pca":                      { add: 'goal: "unsupervised"', field: "unsupTask" },
  "factor-analysis":          { add: 'goal: "unsupervised"', field: "unsupTask" },
  "dbscan":                   { add: 'goal: "unsupervised"', field: "unsupTask" },
  "gaussian-mixture":         { add: 'goal: "unsupervised"', field: "unsupTask" },
  "tsne":                     { add: 'goal: "unsupervised"', field: "unsupTask" },
  "umap":                     { add: 'goal: "unsupervised"', field: "unsupTask" },
  
  // Bayesian tests — need stance: "bayesian"
  "bayesian-t-test":          { add: 'goal: "bayesian"', field: "stance" },
  "bayesian-regression":      { add: 'goal: "bayesian"', field: "stance" },
  "bayesian-anova":           { add: 'goal: "bayesian"', field: "stance" },
};

let modified = 0;

for (const [id, fix] of Object.entries(fixes)) {
  const idPattern = `id: "${id}"`;
  const idIdx = src.indexOf(idPattern);
  if (idIdx === -1) {
    console.log(`⚠️ "${id}" not found`);
    continue;
  }
  
  // Find the requires block after this id
  const afterId = src.slice(idIdx);
  const requiresMatch = afterId.match(/requires:\s*\{([^}]*)\}/);
  if (!requiresMatch) {
    console.log(`⚠️ No requires for "${id}"`);
    continue;
  }
  
  const requiresContent = requiresMatch[1];
  
  // Check if goal is already in requires
  if (requiresContent.includes(fix.add.split(':')[0].trim() + ':')) {
    // Already has the field — but check the specific tests
    // For survival/time-series/unsupervised, goal should already be there
    // For bayesian, goal should be there
    console.log(`⏭️ "${id}" already has ${fix.add.split(':')[0].trim()} in requires`);
    continue;
  }
  
  // Insert the goal requirement into requires
  const fullMatch = requiresMatch[0];
  const insertPosition = idIdx + afterId.indexOf(fullMatch) + 'requires: {'.length;
  
  // If requires is empty `requires: {}`, insert differently
  if (requiresContent.trim() === '') {
    const newRequires = `requires: { ${fix.add} }`;
    src = src.slice(0, idIdx + afterId.indexOf(fullMatch)) + newRequires + src.slice(idIdx + afterId.indexOf(fullMatch) + fullMatch.length);
  } else {
    // Add goal at the beginning of requires
    const newRequires = fullMatch.replace('requires: {', `requires: { ${fix.add},`);
    src = src.slice(0, idIdx + afterId.indexOf(fullMatch)) + newRequires + src.slice(idIdx + afterId.indexOf(fullMatch) + fullMatch.length);
  }
  
  modified++;
  console.log(`✅ Added ${fix.add} to "${id}"`);
}

writeFileSync(FILE, src, "utf-8");
console.log(`\n✅ Done. Modified: ${modified}`);
