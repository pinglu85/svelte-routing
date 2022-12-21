<script>
  let showMoreLinks = false;
</script>

<h1>A</h1>

<input type="checkbox" bind:checked={showMoreLinks} />

{#if showMoreLinks}
  <a href="/b">Go to <span>aaaa</span> B</a>
  <a href="/c">Go to C</a>
{/if}
