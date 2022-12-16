import type { SvelteComponent } from 'svelte';

import LoadingIndicator from './LoadingIndicator.svelte';

const NotFound = () => import('./NotFound.svelte');

interface Route {
  url: RegExp;
  params: string[];
  component: () => Promise<{ default: typeof SvelteComponent }>;
}

export function createRouting({
  routes,
  target,
}: {
  routes: Route[];
  target: HTMLElement;
}) {
  let currComponent: typeof SvelteComponent | undefined;
  let currComponentInstance: SvelteComponent | undefined;
  const indicator = new LoadingIndicator({
    target: document.body,
  });

  function matchRoute(pathname: string) {
    const matchedRouteParams: Record<string, string> = {};
    let matchedRoute: Route | undefined;

    for (const route of routes) {
      const match = pathname.match(route.url);
      if (match) {
        matchedRoute = route;

        for (let i = 0; i < route.params.length; i++) {
          const param = route.params[i];
          matchedRouteParams[param] = match[i + 1];
        }

        break;
      }
    }

    const matchedComponentPromise = matchedRoute?.component ?? NotFound;
    showLoadingIndicator();

    matchedComponentPromise().then(({ default: matchedComponent }) => {
      hideLoadingIndicator();

      if (currComponent === matchedComponent) {
        currComponentInstance.$set(matchedRouteParams);
      } else {
        if (currComponentInstance) currComponentInstance.$destroy();

        currComponentInstance = new matchedComponent({
          target,
          props: matchedRouteParams,
        });
        currComponent = matchedComponent;
      }
    });
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
