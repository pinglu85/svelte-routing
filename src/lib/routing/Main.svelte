<script>
  export let matchedComponents = [];
  export let matchedRouteParams = {};

  // $: matchedComponent0 = matchedComponents[0];
  // $: matchedComponent1 = matchedComponents[1];
  // $: matchedComponent2 = matchedComponents[2];
  // $: matchedComponent3 = matchedComponents[3];
</script>

<!-- Recursively render child components-->
{#if matchedComponents.length === 1}
  <svelte:component this={matchedComponents[0]} {...matchedRouteParams} />
{:else if matchedComponents.length > 1}
  <svelte:component this={matchedComponents[0]} {...matchedRouteParams}>
    <svelte:self
      matchedComponents={matchedComponents.slice(1)}
      {matchedRouteParams}
    />
  </svelte:component>
{/if}

<!-- <svelte:component this={matchedComponent0} {...matchedRouteParams}>
  <svelte:component this={matchedComponent1} {...matchedRouteParams}>
    <svelte:component this={matchedComponent2} {...matchedRouteParams}>
      <svelte:component this={matchedComponent3} {...matchedRouteParams} />
    </svelte:component>
  </svelte:component>
</svelte:component> -->
