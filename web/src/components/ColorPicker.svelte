<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let colors = [ // Apple Macintosh default 16-color palette
        '#FFFFFF',
        '#1FB714',
        '#FBF305',
        '#006412',
        '#FF6403',
        '#562C05',
        '#DD0907',
        '#90713A',
        '#F20884',
        '#C0C0C0',
        '#4700A5',
        '#808080',
        '#0000D3',
        '#404040',
        '#02ABEA',
        '#000000',
    ]
    export let disabled = false;

    const dispatch = createEventDispatcher<{ color: string }>();
</script>

<div class:disabled>
    {#each colors as col}
        <nav style={`background-color: ${col};`} on:click={() => !disabled && dispatch('color', col)} />
    {/each}
</div>

<style>
    div {
        display: grid;
        background-color: black;
        grid-template-columns: 1fr 1fr 1fr 1fr;
    }

    nav {
        width: 16px;
        height: 16px;
    }

    div.disabled > nav {
        opacity: 0.5;
    }
</style>