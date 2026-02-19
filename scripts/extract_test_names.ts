
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { statisticalTests } from '../client/src/lib/statsData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the output file path (root directory)
const outputPath = path.resolve(__dirname, '../test_names.txt');

// Extract names
const testNames = statisticalTests.map(test => test.name);

// Join names with newlines
const fileContent = testNames.join('\n');

// Write to file
fs.writeFileSync(outputPath, fileContent, 'utf-8');

console.log(`Successfully wrote ${testNames.length} test names to ${outputPath}`);
console.log('Test Names:');
console.log(fileContent);
