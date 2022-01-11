<script lang="ts">
    import type { Channel, Connection } from "protocol";
    import { Vector } from "protocol/dist/classes/Game";
    import type { Channels } from "protocol/dist/interfaces/Channels";
    import { BoardConfiguration, Direction, GameConfiguration } from "protocol/dist/interfaces/Game";
    import { onMount } from "svelte";
    import { GameRenderer } from "./GameRenderer";

    type Ch = Channels['game']
    export let connection: Connection<Channels>

    let channel: Channel<Ch[1], Ch[0]>

    let gameConfig: GameConfiguration | undefined = undefined;
    let canvas: HTMLCanvasElement;
    let innerHeight: number;
    let innerWidth: number;
    let renderer: GameRenderer | undefined = undefined;

    $: if (gameConfig && canvas && innerWidth && innerHeight) {
        renderer = new GameRenderer(canvas, new Vector(innerWidth, innerHeight), gameConfig, connection.getId())
    } else {
        renderer = undefined;
    }

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
            if (!renderer) return;
            renderer.updateBoardConfiguration(b);
            renderer.render()
        })

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
    loading
{:else}
    <section>
        <canvas
            bind:this={canvas}
            width={innerWidth}
            height={innerHeight}
        ></canvas>
    </section>
{/if}