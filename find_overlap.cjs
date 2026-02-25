const fs = require("fs");

const glossary = fs.readFileSync("client/src/lib/glossaryData.ts", "utf-8");
const stats = fs.readFileSync("client/src/lib/statsData.ts", "utf-8");

const regex = /name:\s*"([^"]+)"/g;
let match;
const statNames = new Set();
while ((match = regex.exec(stats)) !== null) {
  statNames.add(match[1].toLowerCase());
}

const glossaryTerms = [];
const termRegex = /term:\s*"([^"]+)"/g;
while ((match = termRegex.exec(glossary)) !== null) {
  glossaryTerms.push(match[1]);
}

const overlaps = glossaryTerms.filter((t) => statNames.has(t.toLowerCase()));

fs.writeFileSync("overlaps.json", JSON.stringify(overlaps, null, 2));
console.log("Done");
