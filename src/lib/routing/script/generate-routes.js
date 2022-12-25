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
          .map(({ relativePath, components }) => {
            const { regex, params } = getRegExpAndParams(relativePath);

            return `{
              url: ${regex},
              params: [
                ${params
                  .map(
                    ({ name, rest }) =>
                      `{ name: ${JSON.stringify(name)}, 
                         rest: ${rest ? 'true' : 'false'} 
                        }`
                  )
                  .join(',\n')}
              ],
              components: [${components
                .map((relativePath) => `() => import('./$/${relativePath}')`)
                .join(',')}],
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
  const layouts = {};

  function _explore(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
      const relativePath = path.relative(rootRouteDirectory, filePath);

      if (isDirectory) {
        _explore(filePath);
      } else if (file === '__layout.svelte') {
        layouts[relativePath] = {
          componentPath: filePath,
          relativePath,
        };
      } else {
        routes.push({
          componentPath: filePath,
          relativePath,
          components: [relativePath],
        });
      }
    }
  }
  _explore(rootRouteDirectory);

  for (const route of routes) {
    let dirname = route.relativePath;

    while (dirname !== '.') {
      // Get the directory
      dirname = path.dirname(dirname);

      const layoutCandidate =
        dirname === '.' ? '__layout.svelte' : `${dirname}/__layout.svelte`;
      const layout = layouts[layoutCandidate];

      if (layout) route.components.push(layout.relativePath);
    }

    route.components.reverse();
  }

  // console.log(routes);
  return routes;
}

function getRegExpAndParams(relativePath) {
  const component = relativePath.replace(/\.svelte$/, '');
  const segments = component.split('/');

  const params = [];
  const regexSegments = [];

  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i];

    if (i === segments.length - 1 && segment === 'index') {
      segment = '';
    }

    if (segment.indexOf('[') === -1) {
      segment = `\\/${segment}`;
    } else {
      let paramName = '';
      let regexStr = '';
      let isOpening = false;
      let isRest = false;

      // a[baaac]c
      // paramName = 'baaac'
      // regexStr = a + ([^/]+) + c
      for (let j = 0; j < segment.length; j++) {
        const char = segment[j];

        if (char === '[') {
          if (isOpening) {
            throw new Error(
              `Invalid path ${relativePath}, encounter "[" after another "["`
            );
          }

          isOpening = true;

          if (
            segment[j + 1] === '.' &&
            segment[j + 2] === '.' &&
            segment[j + 3] === '.'
          ) {
            isRest = true;
            j += 3;
          }
        } else if (char === ']') {
          if (!isOpening) {
            throw new Error(
              `Invalid path ${relativePath}, encounter "]" before "["`
            );
          }

          if (paramName === '') {
            throw new Error(
              `Invalid path ${relativePath}, encounter "[]" without parameter name`
            );
          }

          params.push({
            name: paramName,
            rest: isRest,
          });

          if (!isRest) {
            regexStr += '([^/]+)';
          } else {
            regexStr += '(?:|\\/(.+))';
          }

          isOpening = false;
          paramName = '';
        } else {
          if (isOpening) {
            paramName += char;
          } else {
            regexStr += char;
          }
        }
      }

      if (isOpening) {
        throw new Error(`Invalid path ${relativePath}, unclosed "["`);
      }

      segment = isRest ? regexStr : `\\/${regexStr}`;
    }

    regexSegments.push(segment);
  }

  return {
    regex: `/^${regexSegments.join('')}\\/?$/`,
    params,
  };
}
