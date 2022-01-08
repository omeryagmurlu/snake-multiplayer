import App from './App.svelte';
import { populate } from './config'


// hmm. [!] Error: Module format iife does not support top-level await. Use the "es" or "system" output formats rather.
(async () => {
	await populate();
	
	const app = new App({
		target: document.body
	});

	// console.log('welcome');
})()