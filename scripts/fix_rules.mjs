#!/usr/bin/env node
/**
 * Fix the misplaced rules from the first script run.
 * Problem: For tests with backtick rCode strings using .trim(),
 * the regex didn't match, so rules were inserted into the NEXT test.
 * 
 * This script:
 * 1. Removes the duplicate/misplaced rules from paired-t-test and welch-anova
 * 2. Adds correct rules to t-test-independent and welch-t-test
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "client", "src", "lib", "statsData.ts");

let src = readFileSync(FILE, "utf-8");
const lines = src.split("\n");

// Helper to find a line containing a string, starting from a given index
function findLine(text, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].includes(text)) return i;
  }
  return -1;
}

// 1. Fix t-test-independent: add rules before closing },
const tTestIdLine = findLine('id: "t-test-independent"');
console.log(`t-test-independent at line ${tTestIdLine + 1}`);
// Find the `.trim(),` line after rCode for this test
const tTestTrim = findLine('.trim(),', tTestIdLine);
console.log(`First .trim(), at line ${tTestTrim + 1}: ${lines[tTestTrim].trim()}`);
// The closing `},` should be right after it — but there should also be no rules yet
const lineAfterTrim = tTestTrim + 1;
console.log(`Line after: "${lines[lineAfterTrim].trim()}"`);
// Insert rules before the closing },
if (lines[lineAfterTrim].trim() === '},') {
  const rules = `    rules: {
      requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
      boosts: {
        normality: { yes: 3, unsure: 1 },
        equalVar: { yes: 3, unsure: 1 },
        stance: { parametric: 2, unsure: 1 },
      },
    },`;
  lines.splice(lineAfterTrim, 0, rules);
  console.log(`✅ Added rules to t-test-independent`);
} else {
  console.log(`⚠️ Unexpected structure for t-test-independent`);
}

// Recompute: now find paired-t-test and remove the misplaced rules block
let pairedIdLine = findLine('id: "paired-t-test"');
console.log(`\npaired-t-test at line ${pairedIdLine + 1}`);
// The misplaced rules block is right after the id line
const afterPairedId = pairedIdLine + 1;
console.log(`Line after paired-t-test id: "${lines[afterPairedId].trim()}"`);
if (lines[afterPairedId].trim().startsWith('rules:')) {
  // Count how many lines to remove (find the closing },  })
  let depth = 0;
  let endIdx = afterPairedId;
  for (let i = afterPairedId; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.includes('{')) depth++;
    if (trimmed.includes('}')) depth--;
    if (depth <= 0) {
      endIdx = i;
      break;
    }
  }
  const removedLines = lines.splice(afterPairedId, endIdx - afterPairedId + 1);
  console.log(`✅ Removed ${removedLines.length} misplaced rules lines from paired-t-test`);
} else {
  console.log(`⚠️ No misplaced rules found on paired-t-test`);
}

// 2. Fix welch-t-test: add rules before closing },
const welchIdLine = findLine('id: "welch-t-test"');
console.log(`\nwelch-t-test at line ${welchIdLine + 1}`);
const welchTrim = findLine('.trim(),', welchIdLine);
console.log(`welch-t-test .trim(), at line ${welchTrim + 1}: ${lines[welchTrim].trim()}`);
const welchLineAfter = welchTrim + 1;
console.log(`Line after: "${lines[welchLineAfter].trim()}"`);
if (lines[welchLineAfter].trim() === '},') {
  const rules = `    rules: {
      requires: { goal: "compare", outcomeScale: "continuous", nGroups: "2", sampleStructure: "independent" },
      boosts: {
        normality: { yes: 2, unsure: 1 },
        equalVar: { no: 3, unsure: 2 },
        stance: { parametric: 2, robust: 1, unsure: 2 },
      },
    },`;
  lines.splice(welchLineAfter, 0, rules);
  console.log(`✅ Added rules to welch-t-test`);
} else {
  console.log(`⚠️ Unexpected structure for welch-t-test`);
}

// Now find welch-anova and remove the misplaced rules block
let welchAnovaIdLine = findLine('id: "welch-anova"');
console.log(`\nwelch-anova at line ${welchAnovaIdLine + 1}`);
const afterWelchAnova = welchAnovaIdLine + 1;
console.log(`Line after welch-anova id: "${lines[afterWelchAnova].trim()}"`);
if (lines[afterWelchAnova].trim().startsWith('rules:')) {
  let depth = 0;
  let endIdx = afterWelchAnova;
  for (let i = afterWelchAnova; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.includes('{')) depth++;
    if (trimmed.includes('}')) depth--;
    if (depth <= 0) {
      endIdx = i;
      break;
    }
  }
  const removedLines = lines.splice(afterWelchAnova, endIdx - afterWelchAnova + 1);
  console.log(`✅ Removed ${removedLines.length} misplaced rules lines from welch-anova`);
} else {
  console.log(`⚠️ No misplaced rules found on welch-anova`);
}

writeFileSync(FILE, lines.join("\n"), "utf-8");
console.log("\n✅ All fixes applied.");
