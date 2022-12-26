import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

const outputFilePath = path.join(cwd, 'src/generated.ts');
const inputFolder = path.join(cwd, 'src/$');
const paramsFolder = path.join(cwd, 'src/params');

const matches = new Set();
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
    ${Array.from(matches)
      .map((match) => `import { match as ${match} } from './params/${match}';`)
      .join('\n')}
    import { createRouting } from './lib/routing';

    createRouting({
      routes: [
        ${routes
          .map(({ components, regex, params }) => {
            return `{
              url: ${regex},
              params: [
                ${params
                  .map(
                    ({ name, rest, match }) =>
                      `{ 
                          name: ${JSON.stringify(name)}, 
                          rest: ${rest ? 'true' : 'false'},
                          matching: ${match}
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

  // Apply layouts
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

  // Extract regex and params
  for (const route of routes) {
    const { regex, params } = getRegExpAndParams(route.relativePath);
    route.regex = regex;
    route.params = params;
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

          let match;
          if (paramName.indexOf('=') > -1) {
            [paramName, match] = paramName.split('=');

            if (!fs.existsSync(path.join(paramsFolder, `${match}.ts`))) {
              throw new Error(
                `Invalid path ${relativePath}, unknown matching function: "${match}"`
              );
            }

            matches.add(match);
          }

          params.push({
            name: paramName,
            rest: isRest,
            match,
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
