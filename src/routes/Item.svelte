<script>
  import { onMount } from 'svelte';

  export let shopId;
  export let itemId;

  // Test whether the component is newly created or is updated.
  let timer = 0;
  onMount(() => {
    setInterval(() => {
      timer++;
    }, 1000);
  });
</script>

<h1>Item {shopId} {itemId} {JSON.stringify($$props)}</h1>

{timer}

<a href="/item/007/007">James Bond</a>
