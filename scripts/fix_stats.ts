
import fs from 'fs';
import path from 'path';

const statsDataPath = path.join(process.cwd(), 'client/src/lib/statsData.ts');
let content = fs.readFileSync(statsDataPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];
let currentId = '';

for (const line of lines) {
  const idMatch = line.match(/id:\s*"([^"]+)"/);
  if (idMatch) {
    currentId = idMatch[1];
  }

  if (line.trim().startsWith('pythonCode:')) {
    if (currentId) {
      newLines.push(`    pythonCode: pythonSnippets["${currentId}"],`);
    } else {
      newLines.push(line);
    }
  } else if (line.trim().startsWith('rCode:')) {
    if (currentId) {
      newLines.push(`    rCode: rSnippets["${currentId}"],`);
    } else {
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync(statsDataPath, newLines.join('\n'));
console.log('Fixed statsData.ts');
