const fs = require('fs');

const glossaryContent = fs.readFileSync('client/src/lib/glossaryData.ts', 'utf-8');
const statsContent = fs.readFileSync('client/src/lib/statsData.ts', 'utf-8');

const testNames = [];
const regex = /name:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(statsContent)) !== null) {
  testNames.push(match[1].toLowerCase());
}

const glossaryRegex = /term:\s*"([^"]+)"/g;
const overlaps = [];
while ((match = glossaryRegex.exec(glossaryContent)) !== null) {
  if (testNames.includes(match[1].toLowerCase())) {
     overlaps.push(match[1]);
  }
}

console.log("OVERLAPS:", overlaps);
