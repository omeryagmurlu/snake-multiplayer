import { readable } from 'svelte/store';
import App from './App.svelte';
import type { Dispathable } from './interfaces/Dispatchable';

const app = new App({
	target: document.body
});

export default app;