interface Config {
    gameServer: string,
    title: string
}

interface Metadata {
    gameServer: string,
    title: string
}

export let config: Config;

export const populate = async () => {
    config = await (fetch('/config.json').then(r => r.json()))
}