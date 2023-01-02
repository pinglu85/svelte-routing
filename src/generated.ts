import { match as int } from './params/int';
import { match as integer } from './params/integer';
import { createRouting } from './lib/routing';

createRouting({
  routes: [
    {
      url: /^\/item\/([^/]+)\/([^/]+)\/?$/,
      params: [
        {
          name: 'shopId',
          rest: false,
          matching: int,
        },
        {
          name: 'itemId',
          rest: false,
          matching: integer,
        },
      ],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/item/__layout.svelte'),
        () => import('./$/item/[shopId=int]/__layout.svelte'),
        () => import('./$/item/[shopId=int]/[itemId=integer].svelte'),
      ],
    },
    {
      url: /^\/item\/([^/]+)\/([^/]+)\/?$/,
      params: [
        {
          name: 'shopId',
          rest: false,
          matching: undefined,
        },
        {
          name: 'itemId',
          rest: false,
          matching: undefined,
        },
      ],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/item/__layout.svelte'),
        () => import('./$/item/[shopId]/__layout-root.svelte'),
        () => import('./$/item/[shopId]/__layout-foo@root.svelte'),
        () => import('./$/item/[shopId]/[itemId]@foo.svelte'),
      ],
    },
    {
      url: /^\/a\/b\/?$/,
      params: [],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/a/b.svelte'),
      ],
    },
    {
      url: /^\/shop\/([^/]+)\/?$/,
      params: [
        {
          name: 'shopId',
          rest: false,
          matching: undefined,
        },
      ],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/shop/__layout.svelte'),
        () => import('./$/shop/[shopId].svelte'),
      ],
    },
    {
      url: /^\/a(?:|\/(.+))\/?$/,
      params: [
        {
          name: 'rest',
          rest: true,
          matching: undefined,
        },
      ],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/a/[...rest].svelte'),
      ],
    },
    {
      url: /^\/b\/?$/,
      params: [],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/b.svelte'),
      ],
    },
    {
      url: /^\/c\/?$/,
      params: [],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/c.svelte'),
      ],
    },
    {
      url: /^\/\/?$/,
      params: [],
      components: [
        () => import('./$/__layout.svelte'),
        () => import('./$/index.svelte'),
      ],
    },
  ],
  target: document.getElementById('app'),
});
