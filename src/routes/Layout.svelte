<script>
  import { onMount } from 'svelte';

  // Test whether the component is newly created or is updated.
  let timer = 0;
  onMount(() => {
    setInterval(() => {
      timer++;
    }, 1000);
  });
</script>

<nav>This is the navigation bar {timer}</nav>

<div>
  <slot />
</div>

<footer>This is the footer</footer>

<style>
  div {
    margin: 8px;
    border: 8px solid black;
  }
</style>
