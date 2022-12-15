import { createRouting } from './lib/routing';

createRouting({
  routes: [
    {
      url: /^\/$/,
      params: [],
      // To achieve code splitting and lazy loading, we cannot directly import
      // the component with `component: import('.../A.svelte')`, because although
      // the dynamic import helps us create a separate file, as soon as we call
      // `import()` the browser will download this file, so we need to call it
      // lazily.
      component: () => import('./routes/A.svelte'),
    },
    {
      url: /^\/b$/,
      params: [],
      component: () => import('./routes/B.svelte'),
    },
    {
      url: /^\/c$/,
      params: [],
      component: () => import('./routes/C.svelte'),
    },
    {
      url: /^\/shop\/(.+)$/,
      params: ['shopId'],
      component: () => import('./routes/Shop.svelte'),
    },
    {
      url: /^\/item\/(.+)\/(.+)$/,
      params: ['shopId', 'itemId'],
      component: () => import('./routes/Item.svelte'),
    },
  ],
  target: document.getElementById('app'),
});
