import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "client", "src", "lib", "statsData.ts");
const src = readFileSync(FILE, "utf-8");

// Find all test objects and extract id + rules
const lines = src.split("\n");
const byGoal = {};
let currentId = null;
let inRules = false;
let rulesDepth = 0;
let rulesText = "";

for (const line of lines) {
  const idMatch = line.match(/^\s+id:\s*"([^"]+)"/);
  if (idMatch) {
    currentId = idMatch[1];
  }
  
  if (currentId && line.includes("rules:") && line.includes("{")) {
    inRules = true;
    rulesDepth = 0;
    rulesText = "";
  }
  
  if (inRules) {
    rulesText += line + "\n";
    rulesDepth += (line.match(/\{/g) || []).length;
    rulesDepth -= (line.match(/\}/g) || []).length;
    
    if (rulesDepth <= 0) {
      inRules = false;
      
      // Parse requires goal
      const reqMatch = rulesText.match(/requires:\s*\{([^}]*)\}/);
      let reqGoal = null;
      if (reqMatch) {
        const gm = reqMatch[1].match(/goal:\s*"([^"]+)"/);
        if (gm) reqGoal = gm[1];
      }
      
      // Parse boost goals
      const boostGoalMatch = rulesText.match(/goal:\s*\{\s*([^}]+)\}/g);
      const boostGoals = [];
      if (boostGoalMatch) {
        for (const bg of boostGoalMatch) {
          if (bg.includes("requires")) continue; // skip requires
          const pairs = [...bg.matchAll(/(\w+):\s*(\d+)/g)];
          for (const p of pairs) {
            boostGoals.push({ goal: p[1], score: parseInt(p[2]) });
          }
        }
      }
      
      // Record
      if (reqGoal) {
        if (!byGoal[reqGoal]) byGoal[reqGoal] = [];
        byGoal[reqGoal].push({ id: currentId, type: "REQUIRES" });
      }
      for (const bg of boostGoals) {
        if (!byGoal[bg.goal]) byGoal[bg.goal] = [];
        byGoal[bg.goal].push({ id: currentId, type: `boost:${bg.score}` });
      }
      if (!reqGoal && boostGoals.length === 0) {
        if (!byGoal["(no goal)"] ) byGoal["(no goal)"] = [];
        byGoal["(no goal)"].push({ id: currentId, type: "-" });
      }
      
      currentId = null;
    }
  }
}

// Print
const goalOrder = ["compare", "associate", "model", "estimate", "categorical_assoc", "time_series", "survival", "unsupervised", "bayesian", "utilities", "power", "(no goal)"];

for (const goal of goalOrder) {
  const tests = byGoal[goal];
  if (!tests) { console.log(`\n## ${goal}: (0 tests)`); continue; }
  console.log(`\n## ${goal} (${tests.length} tests)`);
  for (const t of tests) {
    console.log(`  ${t.type.padEnd(12)} ${t.id}`);
  }
}
