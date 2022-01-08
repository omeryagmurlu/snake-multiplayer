<script>
    import { Link } from "svelte-routing";

    let pr;
    $: ({ ...pr } = $$props);
</script>

<Link {...pr}>
    <button>
        <slot></slot>
    </button>
</Link>