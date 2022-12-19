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
      url: /^\/b\/?$/,
      params: [],
      component: () => import('./routes/B.svelte'),
    },
    {
      url: /^\/c\/?$/,
      params: [],
      component: () => import('./routes/C.svelte'),
    },
    {
      url: /^\/shop\/([^/]+)\/?$/,
      params: [{ name: 'shopId' }],
      component: () => import('./routes/Shop.svelte'),
    },
    {
      url: /^\/item\/([^/]+)\/([^/]+)\/?$/,
      params: [
        { name: 'shopId', matching: (shopId) => /^\d+$/.test(shopId) },
        { name: 'itemId', matching: (itemId) => /^\d+$/.test(itemId) },
      ],
      component: () => import('./routes/Item.svelte'),
    },
    {
      url: /^\/item\/([^/]+)\/([^/]+)\/?$/,
      params: [{ name: 'shopId' }, { name: 'itemId' }],
      component: () => import('./routes/Haha.svelte'),
    },
    {
      // Rest Parameters:
      // a/[...rest].svelte
      // a/1
      // a/1/2/
      // a/1/2/3/
      // a/1/2/3/4 -> rest: ['1', '2', '3', '4']
      url: /^\/a(?:\/(.+))?\/?$/,
      params: [{ name: 'rest', rest: true }],
      component: () => import('./routes/Rest.svelte'),
    },
  ],
  target: document.getElementById('app'),
});
