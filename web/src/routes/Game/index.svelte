<script lang="ts">
    import type { Channel, Connection } from "protocol";
    import type { Channels } from "protocol/dist/interfaces/Channels";
    import { Direction, GameConfiguration } from "protocol/dist/interfaces/Game";
    import { onMount } from "svelte";
    import { BLOCK_SIZE_IN_PIXEL, createTick } from "./tick";

    type Ch = Channels['game']
    export let connection: Connection<Channels>

    let channel: Channel<Ch[1], Ch[0]>

    let gameConfig: GameConfiguration | undefined = {
        size: {x: 40, y: 40},
        players: [
            {
                name: 'kir',
                color: 'red',
                score: 100,
                dead: false,
                dueGrowth: 0
            },
            {
                name: 'mav',
                color: 'blue',
                score: 50,
                dead: false,
                dueGrowth: 0
            }
        ],
        ended: false,
        startTime: Date.now(),
        totalTime: 240000,
        solid: []
    };
    // let gameConfig: GameConfiguration | undefined = undefined;
    let canvas: HTMLCanvasElement;
    let innerHeight: number;
    let innerWidth: number;

    let tick: () => void;
    $: if (gameConfig && canvas) {
        tick = createTick(canvas, gameConfig, innerWidth, innerHeight)
    } else {
        tick = () => {}
    }

    onMount(() => {
        channel = connection.createChannel('game')

        // channel.on('configure-game', conf => {
        //     // console.log(conf)
        //     let str = `
        //     size: ${conf.size.x}x${conf.size.y}
        //     players:
        //     `;
        //     for (const player of conf.players) {
        //         str += `name: ${player.name}
        //         color: ${player.color}
        //         score: ${player.score}
        //         dead: ${player.dead}
        //         due: ${player.dueGrowth}
        //         `
        //     }
        //     str += `ended: ${conf.ended}`
        //     gameConfig = conf
        //     console.log(str)
        //     // document.getElementById('info').innerHTML = str;
        // })

        // channel.on('tick', tick)
        const a = () => {
            tick()
            window.requestAnimationFrame(a)
        }
        a();

        document.onkeydown = checkKey;
        function checkKey(e: any) {
            e = e || window.event;
            if (e.keyCode == '38') {
                channel.send('input', Direction.Up)
            }
            else if (e.keyCode == '40') {
                channel.send('input', Direction.Down)
            }
            else if (e.keyCode == '37') {
                channel.send('input', Direction.Left)
            }
            else if (e.keyCode == '39') {
                channel.send('input', Direction.Right)
            }
        }
    })
</script>

<svelte:window bind:innerHeight={innerHeight} bind:innerWidth={innerWidth}/>
{#if !gameConfig}
    game starting soon
{:else}
    <section>
        <canvas
            bind:this={canvas}
            width={Math.min(BLOCK_SIZE_IN_PIXEL * gameConfig.size.x, innerWidth)}
            height={Math.min(BLOCK_SIZE_IN_PIXEL * gameConfig.size.y, innerHeight)}
        ></canvas>
    </section>
{/if}