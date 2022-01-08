<script lang="ts">
import type { SvelteComponent } from "svelte";

import { Link } from "svelte-routing";
    export let title: string | undefined = undefined;
    export let backTo: string | undefined = undefined;
    export let BottomButtonWrapper: typeof SvelteComponent | undefined = undefined;
</script>

<section>
    {#if backTo}
        <Link to={backTo}>
            BACK
        </Link>
    {/if}
    {#if title}
        <header>{title}</header>
    {/if}
    <article>
        <slot></slot>
    </article>
    {#if BottomButtonWrapper}
        <svelte:component this={BottomButtonWrapper}>
        </svelte:component>
    {/if}
</section>