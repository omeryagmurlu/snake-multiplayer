<script lang="ts">
    export let value: string
    export let minWidth = "50px"
</script>

<span role="textbox" spellcheck="false" contenteditable bind:textContent={value} style={`min-width: ${minWidth};`}></span>

<style>
    span {
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        border: none;
        outline: none;
        color: inherit;
        border-bottom: 1px solid var(--accent-color);
    }
</style>