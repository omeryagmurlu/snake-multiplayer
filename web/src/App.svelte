<script lang="ts">
	import { Router, Link, Route } from "svelte-routing";
	import Chrome from './Chrome.svelte'

	import Home from "./routes/Home/index.svelte";
	import NewRoom from "./routes/NewRoom.svelte";
	import Room from "./routes/Room.svelte"; // lobby
	import Game from "./routes/Game/index.svelte";
</script>

<Router>
	<Chrome>
		<Route path="/" component={Home} />
		<Route path="/room/:code" component={Room} />
		<Route path="/newroom" component={NewRoom} />
		<Route path="/game/:code" component={Game} />
	</Chrome>
</Router>

<style>
</style>