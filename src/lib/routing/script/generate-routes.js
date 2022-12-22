import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

const outputFilePath = path.join(cwd, 'src/generated.ts');
const inputFolder = path.join(cwd, 'src/$');
const routes = exploreFolders(inputFolder);

fs.writeFileSync(
  outputFilePath,
  // We need to write `routes: [ ${routes.map(...)} ]` instead of
  // `routes: ${routes.map(...)}`, because without `[ ]` we'll get
  // `routes: {}, {}, ...` in the `generated.ts` file. The reason for
  // that is the values that are interpolated into a template literal
  // are converted to their string representation. For objects and
  // arrays, that means calling their `.toString()` method.
  `
    import { createRouting } from './lib/routing';

    createRouting({
      routes: [
        ${routes
          .map(({ componentPath, relativePath }) => {
            const component = relativePath.replace(/\.svelte$/, '');
            const segments = component.split('/');
            if (segments[segments.length - 1] === 'index') {
              segments[segments.length - 1] = '';
            }

            const regExp = `/^\\/${segments.join('\\/')}\\/?$/`;

            return `{
            url: ${regExp},
            params: [],
            components: [() => import('./$/${relativePath}')],
          }`;
          })
          .join(',\n')}
      ],
      target: document.getElementById('app'),
    });
  `,
  'utf-8'
);

function exploreFolders(rootRouteDirectory) {
  const routes = [];

  function _explore(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        _explore(filePath);
      } else {
        routes.push({
          componentPath: filePath,
          relativePath: path.relative(rootRouteDirectory, filePath),
        });
      }
    }
  }
  _explore(rootRouteDirectory);

  return routes;
}
