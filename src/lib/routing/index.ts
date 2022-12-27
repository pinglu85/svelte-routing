import type { SvelteComponent } from 'svelte';

import Main from './Main.svelte';
import LoadingIndicator from './LoadingIndicator.svelte';

const NotFound = [() => import('./NotFound.svelte')];

interface Route {
  url: RegExp;
  params: Array<{
    name: string;
    matching?: (param: string) => boolean;
    rest?: boolean;
  }>;
  components: Array<() => Promise<{ default: typeof SvelteComponent }>>;
}

export function createRouting({
  routes,
  target,
}: {
  routes: Route[];
  target: HTMLElement;
}) {
  let main: SvelteComponent;
  const indicator = new LoadingIndicator({
    target: document.body,
  });

  function matchRoute(pathname: string) {
    let matchedRouteParams: Record<string, string | string[]> = {};
    let matchedRoute: Route | undefined;

    route_matching: for (const route of routes) {
      const match = pathname.match(route.url);
      if (match) {
        const params: Record<string, string | string[]> = {};

        for (let i = 0; i < route.params.length; i++) {
          const {
            name: paramName,
            matching: paramMatchingFn,
            rest: paramIsRest,
          } = route.params[i];
          const paramValue = match[i + 1] ?? '';

          if (typeof paramMatchingFn === 'function') {
            if (!paramMatchingFn(paramValue)) continue route_matching;
          }

          if (!paramIsRest) {
            params[paramName] = paramValue;
          } else {
            const paramValues: string[] = [];

            let value = '';
            for (let i = 0; i < paramValue.length; i++) {
              const char = paramValue[i];

              if (char === '/') {
                if (value === '') break;

                paramValues.push(value);
                value = '';
              } else {
                value += char;
              }
            }

            if (value !== '') paramValues.push(value);

            params[paramName] = paramValues;
          }
        }

        matchedRoute = route;
        matchedRouteParams = params;
        break;
      }
    }

    const matchedComponentPromises = matchedRoute?.components ?? NotFound;
    showLoadingIndicator();

    Promise.all(matchedComponentPromises.map((fn) => fn())).then(
      (matchedComponentModules) => {
        hideLoadingIndicator();

        const matchedComponents = matchedComponentModules.map(
          (module) => module.default
        );

        if (main) {
          main.$set({ matchedComponents, matchedRouteParams });
        } else {
          main = new Main({
            props: {
              matchedComponents,
              matchedRouteParams,
            },
            target,
          });
        }
      }
    );
  }

  function showLoadingIndicator() {
    indicator.show();
  }

  function hideLoadingIndicator() {
    indicator.hide();
  }

  matchRoute(location.pathname);

  window.addEventListener('click', (e) => {
    const anchorTag = findAnchorTag(e.target);
    if (!anchorTag) return;

    if (anchorTag.target) return;

    if (anchorTag.hasAttribute('no-routing')) return;

    e.preventDefault();

    const targetLocation = anchorTag.href;
    const targetPathname = new URL(targetLocation).pathname;

    // Update the URL without navigating
    history.pushState({}, undefined, targetPathname);

    // Match the component and render new content
    matchRoute(targetPathname);
  });

  // Handle browser back button click
  window.addEventListener('popstate', () => {
    matchRoute(location.pathname);
  });
}

function findAnchorTag(clickTarget: EventTarget): null | HTMLAnchorElement {
  if (clickTarget instanceof Element) return clickTarget.closest('a');

  return null;
}
