import { readable } from 'svelte/store';

interface Config {
    gameServer: string,
    title: string
}

interface Metadata {
    title: string
}

let config: Config;
export const populate = async () => {
    config = await (fetch('/config.json').then(r => r.json()))
}

// it will never be undefined as long as `populate` is called before, which should be in sync
export const webpageMetadata = readable(undefined as unknown as Metadata, function start(set) {
	set({
        title: config.title
    })
});