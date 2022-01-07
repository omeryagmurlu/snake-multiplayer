<script lang="ts">
	import { Router, Link, Route } from "svelte-routing";
	import Chrome from './Chrome.svelte'

	import Home from "./routes/Home.svelte";
	import NewRoom from "./routes/NewRoom.svelte";
	import Room from "./routes/Room.svelte"; // lobby
	import Game from "./routes/Game/index.svelte";
</script>

<Router>
	<Chrome>
		<nav>
			<Link to="/">Home</Link>
			<Link to="/newroom">nr</Link>
			<Link to="/room/3">r3</Link>
			<Link to="/room/42">r42</Link>
			<Link to="/game">g</Link>
			<!-- <Link to="about">About</Link> -->
		</nav>
		<div>
		  <!-- <Route path="blog/:id" component="{BlogPost}" /> -->
		  <Route path="/" component={Home} />
		  <Route path="/game" component={Game} />
		  <Route path="/room/:code" component={Room} />
		  <Route path="/newroom" component={NewRoom} />
		</div>
	</Chrome>
</Router>

<style>
</style>