
import fs from 'fs';
import path from 'path';

const statsDataPath = path.join(process.cwd(), 'client/src/lib/statsData.ts');
let content = fs.readFileSync(statsDataPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];
let currentId = '';
let skippingPython = false;
let skippingR = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Track current ID
  const idMatch = line.match(/id:\s*"([^"]+)"/);
  if (idMatch) {
    currentId = idMatch[1];
  }

  // Handle Python Code
  if (skippingPython) {
    // Check for end of multi-line string
    if (line.trim().endsWith('`.trim(),') || line.trim().endsWith('`,') || line.trim().endsWith('",') || line.trim().endsWith("',")) {
      skippingPython = false;
    }
    continue;
  }

  if (line.trim().startsWith('pythonCode:')) {
    // If we've already replaced it (from previous run) with the correct lookup, we might need to be careful not to double replace or break valid code if it's already correct.
    // BUT my previous script replaced the line but left the garbage.
    // So the line might look like: `    pythonCode: pythonSnippets["welch-t-test"],`
    // And the NEXT line is `# a and b...`

    // Check if it's already fixed (single line ending in comma)
    // If it is fixed, we still output it, but we need to check if the NEXT lines are garbage from the previous bad run.

    // Actually, the simplest way is:
    // 1. Output the correct line.
    // 2. Check if the *original* line (before my bad edit) was multi-line.
    // BUT I overwrote the file! So I can't check the original property.
    // However, I can check if the *current* file (with errors) has garbage following this line.

    // In the broken file:
    // Line X: pythonCode: pythonSnippets["..."],
    // Line X+1: # garbage
    // ...
    // Line X+N: `.trim(),

    newLines.push(`    pythonCode: pythonSnippets["${currentId}"],`);

    // Look ahead to see if we need to enter skip mode to eat garbage
    // Garbage starts if it doesn't look like a property key or closing brace.
    // Typically garbage starts with `#` or `t_stat...` etc.
    // The garbage ends with `.trim(),`

    // Heuristic: If the current line ends with `,` and doesn't look like start of multi-line, we are good?
    // NO, because in the broken file, the line `pythonCode: ...` IS correct now. The garbage is AFTER it.

    // So, I need to check if the NEXT line is garbage.
    // Garbage lines do NOT start with a property name (e.g. `rCode:`, `category:`, `alternativeLinks:`) and are not `}`.

    // Let's look at the broken file state again.
    // It has `pythonCode: ...`, then garbage lines, then `rCode: ...` (or `rCode` might also be broken).

    // Strategy: Peek at next lines. If they don't start with `rCode:` or `}` (end of object), they are likely garbage from the old `pythonCode` value.
    // BUT `rCode:` might also have been replaced and have garbage after it!

    // Let's use a robust "Eat until known property or end of object" strategy.
    // Known next properties in `StatTest`: `rCode`.
    // After `rCode`: `}`.

    // So after `pythonCode`, eat lines until `rCode:` (or `rCode` garbage start) or `}`.
    let j = i + 1;
    while (j < lines.length) {
      const nextLine = lines[j].trim();
      if (nextLine.startsWith('rCode:') || nextLine.startsWith('}')) {
        break;
      }
      // It's garbage
      j++;
    }
    // Update i to skip garbage
    i = j - 1; // loop will increment i
    continue;
  }

  // Handle R Code
  if (line.trim().startsWith('rCode:')) {
    newLines.push(`    rCode: rSnippets["${currentId}"],`);

    // Eat garbage until `}` or next property (though rCode is usually last)
    let j = i + 1;
    while (j < lines.length) {
      const nextLine = lines[j].trim();
      if (nextLine.startsWith('}') || nextLine.startsWith('id:')) { // End of object or start of next (though `}` should come first)
        break;
      }
      // It's garbage
      j++;
    }
    i = j - 1;
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync(statsDataPath, newLines.join('\n'));
console.log('Fixed statsData.ts v2');
