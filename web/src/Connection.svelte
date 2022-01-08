<script lang="ts">
	import { Connection } from 'protocol';
	import { io } from 'socket.io-client';
	
	import { onMount } from "svelte";
	import { config } from "./lib/config";

	let connection: Connection | undefined = undefined

	onMount(() => {
		const socket = io(config.gameServer)
		socket.on('connect', async () => {
			connection = new Connection(socket)
		})
	})
</script>

{#if typeof connection !== 'undefined'}
    <slot connection={connection}></slot>
{/if}

<style>
</style>