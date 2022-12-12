import type { SvelteComponent } from 'svelte';

import NotFound from './NotFound.svelte';

interface Route {
  url: string;
  component: typeof SvelteComponent;
}

export function createRouting({
  routes,
  target,
}: {
  routes: Route[];
  target: HTMLElement;
}) {
  let currComponent: SvelteComponent | undefined;
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

  function matchRoute(pathname: string) {
    if (currComponent) currComponent.$destroy();

    const matchedRoute = routes.find((route) => route.url === pathname);
    const MatchedComponent = matchedRoute?.component ?? NotFound;
    currComponent = new MatchedComponent({
      target,
    });
  }
}

function findAnchorTag(clickTarget: EventTarget): null | HTMLAnchorElement {
  if (clickTarget instanceof Element) return clickTarget.closest('a');

  return null;
}
