<script lang="ts">
    import type { Channel, Connection } from "protocol";
    import { Vector } from "protocol/dist/classes/Game";
    import type { Channels } from "protocol/dist/interfaces/Channels";
    import type { BoardConfiguration, GameConfiguration } from "protocol/dist/interfaces/Game";
    import { onDestroy, onMount } from "svelte";
    import { controls } from "../../stores/settings";
    import { GameControls } from "./Controls";
    import { GameRenderer } from "./GameRenderer";

    type Ch = Channels['game']
    export let connection: Connection<Channels>

    let channel: Channel<Ch[1], Ch[0]>

    let gameConfig: GameConfiguration | undefined = undefined;
    let canvas: HTMLCanvasElement;
    let clientHeight: number;
    let clientWidth: number;

    let gameControl: GameControls = GameControls.get($controls)

    onMount(() => {
        channel = connection.createChannel('game')

        channel.on('configure-game', conf => {
            gameConfig = conf
            // console.log(conf)
            // let str = `
            // size: ${conf.size.x}x${conf.size.y}
            // players:
            // `;
            // for (const player of conf.players) {
                //     str += `name: ${player.name}
                //     color: ${player.color}
                //     score: ${player.score}
                //     dead: ${player.dead}
                //     due: ${player.dueGrowth}
                //     `
                // }
                // str += `ended: ${conf.ended}`
                // console.log(str)
                // document.getElementById('info').innerHTML = str;
        })
        
        channel.on('tick', (b: BoardConfiguration) => {
            if (!gameConfig) return;
            const renderer = new GameRenderer(canvas, new Vector(clientWidth, clientHeight), gameConfig, b, connection.getId());
            renderer.render()
        })
            
        gameControl.init(canvas)
        gameControl.onDirection(dir => channel.send('input', dir))
    })

    onDestroy(() => {
        gameControl.destroy()
        channel.send('leave');
        channel.destroy()
    })
</script>

<section bind:clientWidth={clientWidth} bind:clientHeight={clientHeight}>
        {#if !gameConfig}
            loading
        {/if}
        <canvas
            class:hidden={!gameConfig}
            bind:this={canvas}
            width={clientWidth}
            height={clientHeight}
        ></canvas>
    </section>

<style>
    section {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
    }

    canvas.hidden {
        display: none;
    }
</style>