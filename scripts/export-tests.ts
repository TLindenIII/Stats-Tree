import { statisticalTests, categoryGroups, getWikipediaUrl } from "../client/src/lib/statsData";
import * as fs from "fs";
import * as path from "path";

const exportData = {
  exportedAt: new Date().toISOString(),
  totalTests: statisticalTests.length,
  categories: [...new Set(statisticalTests.map(t => t.category))].sort(),
  methodFamilies: [...new Set(statisticalTests.map(t => t.methodFamily))].sort(),
  categoryGroups: categoryGroups.map(g => ({
    id: g.id,
    label: g.label,
    testCount: g.tests.length
  })),
  tests: statisticalTests.map(test => ({
    id: test.id,
    name: test.name,
    description: test.description,
    category: test.category,
    categoryId: test.categoryId,
    methodFamily: test.methodFamily,
    assumptions: test.assumptions,
    whenToUse: test.whenToUse,
    alternatives: test.alternatives,
    outcomeScale: test.outcomeScale ?? null,
    predictorStructure: test.predictorStructure ?? null,
    design: test.design ?? null,
    level: test.level ?? null,
    alternativeLinks: test.alternativeLinks ?? [],
    wikipediaUrl: getWikipediaUrl(test.id)
  })),
  schemaVersion: 2
};

const outputPath = path.join(process.cwd(), "client", "public", "statistical-tests-export.json");
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

console.log(`Exported ${statisticalTests.length} statistical tests to ${outputPath}`);
