<script>
	// we cant use lang=ts here because svelte is broken
	import { Router, Route } from "svelte-routing";
	
	import RoomList from "./routes/RoomList/index.svelte";
	import NewRoom from "./routes/NewRoom.svelte";
	import Room from "./routes/Room/index.svelte"; // lobby
	import Game from "./routes/Game/index.svelte";
	import Connection from "./Connection.svelte";

</script>

<Router>
	<!-- this is the problematic part, connection is undefined no matter what I do -->
	<Connection let:connection={connection}>
		<Route path="/">
			<RoomList connection={connection} />
		</Route>
		<Route path="/room/:code" let:params>
			<Room connection={connection} code={params.code}/>
		</Route>
		<Route path="/newroom">
			<NewRoom connection={connection} />
		</Route>
		<Route path="/game">
			<Game connection={connection} />
		</Route>
	</Connection>
</Router>

<style>
</style>