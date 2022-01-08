<script lang="ts">
import type { SvelteComponent } from "svelte";

import { Link } from "svelte-routing";
    export let title: string | undefined = undefined;
    export let backTo: string | undefined = undefined;
    export let BottomButtonWrapper: typeof SvelteComponent | undefined = undefined;
</script>

<section>
    {#if backTo}
    <nav>
        <Link to={backTo}>
            BACK
        </Link>
    </nav>
    {/if}
    {#if title}
        <h1>{title}</h1>
    {/if}
    <article>
        <slot></slot>
    </article>
    {#if BottomButtonWrapper}
        <svelte:component this={BottomButtonWrapper}>
        </svelte:component>
    {/if}
</section>

<style>
    section {
        /* border: solid 1px red; */
    }

    nav {
        color: var(--accent-color-dark);
    }
</style>