<script lang="ts">
    import { Link } from "svelte-routing";
    import Window from "../components/Window.svelte";
</script>

<Window title="multiplayer snake">
    <div><Link to="/rooms">rooms</Link></div>
    <div><Link to="/controls">controls</Link></div>
</Window>