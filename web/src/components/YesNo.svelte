<script type="ts">
import { createEventDispatcher } from "svelte";
    export let checked: boolean = false;
    const dispatch = createEventDispatcher<{ checked: boolean }>()
</script>

<span on:click={() => {
    checked = !checked;
    dispatch('checked', checked)
}} style="cursor:pointer;" >
    {#if checked}
        ✔
    {:else}
        ✘
    {/if}
</span>