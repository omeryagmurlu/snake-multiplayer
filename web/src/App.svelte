<script>
	// we cant use lang=ts here because svelte is broken
	import { Router, Route } from "svelte-routing";
	
	import Chrome from './Chrome.svelte'
	import Home from "./routes/Home/index.svelte";
	import NewRoom from "./routes/NewRoom.svelte";
	import Room from "./routes/Room.svelte"; // lobby
	import Game from "./routes/Game/index.svelte";
	import Connection from "./Connection.svelte";
</script>

<Router>
	<Chrome>
		<!-- this is the problematic part, connection is undefined no matter what I do -->
		<Connection let:connection={connection}>
			<Route path="/">
				<Home connection={connection} />
			</Route>
			<Route path="/room/:code" let:params>
				<Room code={params.code}/>
			</Route>
			<Route path="/newroom">
				<NewRoom />
			</Route>
			<Route path="/game/:code">
				<Game />
			</Route>
		</Connection>
	</Chrome>
</Router>

<style>
</style>