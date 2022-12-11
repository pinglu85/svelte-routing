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
  const pathname = location.pathname;
  matchRoute(pathname);

  function matchRoute(pathname: string) {
    if (currComponent) currComponent.$destroy();

    const matchedRoute = routes.find((route) => route.url === pathname);
    const MatchedComponent = matchedRoute?.component ?? NotFound;
    currComponent = new MatchedComponent({
      target,
    });

    document.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', function (e) {
        if (a.target) return;

        e.preventDefault();

        const targetLocation = this.href;
        const targetPathname = new URL(targetLocation).pathname;

        // Update the URL without navigating
        history.pushState({}, undefined, targetPathname);

        // Match the component and render new content
        matchRoute(targetPathname);
      });
    });
  }
}
