<script lang="ts">
    import type { Channel, Connection } from "protocol";
    import { Vector } from "protocol/dist/classes/Game";
    import type { Channels } from "protocol/dist/interfaces/Channels";
    import type { BoardConfiguration, GameConfiguration, Player } from "protocol/dist/interfaces/Game";
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

    let time = 0;
    $: d = gameConfig ? {
        me: gameConfig.players.find(({ id }) => connection.getId() === id),
        remaining: gameConfig.players.filter(x => !x.dead).length
    } : null;

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
            time = Math.floor((Date.now() - gameConfig.startTime) / 1000);
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
    <canvas
        class:hidden={!gameConfig}
        bind:this={canvas}
        width={clientWidth}
        height={clientHeight}
    ></canvas>
    {#if d && d.me && gameConfig}
        <aside class="score" style:color={d.me.color}>{d.me.score}</aside>
        <aside class="death" class:dead={d.me.dead}>YOU LOSE</aside>
        <aside class="win" class:we={gameConfig.ended && !d.me.dead}>YOU WIN</aside>
    {/if}
    {#if !gameConfig}
        loading
    {:else if d}
        <aside class="remaining">{d.remaining} pl.</aside>
        <!-- following is a bug but fuck that I don't care -->
        <aside class="end" class:really={gameConfig.ended && !d.me}>GAME ENDED</aside>
        <aside class="time">{time} / {gameConfig.totalTime / 1000}</aside>
    {/if}
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
    
    aside {
        position: absolute;
        font-size: 3em;
        color: var(--accent-color-dark);
        z-index: 10;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .score {
        top: 0;
        left: 0;
        font-size: 4em;
        text-align: left;
    }

    .time {
        top: 0;
        right: 0;
        text-align: right;
        font-size: 2em;
    }

    .remaining {
        bottom: 0;
        left: 0;
        text-align: left;
    }

    .death, .win, .end {
        height: 100vh;
        width: 100vw;
        line-height: 100vh;
        text-align: center;
        z-index: 20;
        display: none;
    }

    .death.dead {
        display: block;
    }

    .we.win {
        display: block;
    }

    .really.end {
        display: block;
    }
</style>