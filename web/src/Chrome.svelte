<script lang="ts">
    import { LeftTopBar, RightTopBar } from './stores/chromeStore'    
</script>

<section>
    <header>
        <svelte:component this={$LeftTopBar} />
        <svelte:component this={$RightTopBar} />
    </header>
    <main>
        <slot></slot>
    </main>
    <footer></footer>
</section>