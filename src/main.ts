import { createRouting } from './lib/routing';

createRouting({
  routes: [
    {
      url: '/',
      // To achieve code splitting and lazy loading, we cannot directly import
      // the component with `component: import('.../A.svelte')`, because although
      // the dynamic import helps us create a separate file, as soon as we call
      // `import()` the browser will download this file, so we need to call it
      // lazily.
      component: () => import('./routes/A.svelte'),
    },
    {
      url: '/b',
      component: () => import('./routes/B.svelte'),
    },
    {
      url: '/c',
      component: () => import('./routes/C.svelte'),
    },
  ],
  target: document.getElementById('app'),
});
