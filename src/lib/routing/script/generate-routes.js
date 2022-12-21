import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

const outputFilePath = path.join(cwd, 'src/generated.ts');
const inputFolder = path.join(cwd, 'src/$');

fs.writeFileSync(
  outputFilePath,
  `
    import { createRouting } from './lib/routing';

    createRouting({
      routes: [],
      target: document.getElementById('app'),
    });
  `,
  'utf-8'
);
