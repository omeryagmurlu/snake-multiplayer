<script lang="ts">
    import type { Channel, Connection } from "protocol";
	import type { Channels } from 'protocol/dist/interfaces/Channels';
    import type { DetailedRoomState } from "protocol/dist/interfaces/Room";
    import { onDestroy, onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import ColorPicker from "../../components/ColorPicker.svelte";
    import Input from "../../components/Input.svelte";
    import Tab from "../../components/Tab.svelte";
    import Window from "../../components/Window.svelte";
    import YesNo from "../../components/YesNo.svelte";

    type ChM = Channels['room-management']
    type Ch = Channels['room-joined']

    export let connection: Connection<Channels>
    export let code: string

    let room: Channel<Ch[1], Ch[0]>;
    let roomState: DetailedRoomState | undefined = undefined;
    let registered = false;
    let name: string;
    let color: string;
    let gameStarting = false;

    const onReadyChange = async (e: CustomEvent<boolean>) => {
        room.send('ready', e.detail)
    }

    const register = async () => {
        registered = await room.send('register', { name, color });
    }
    
    onMount(async () => {
        const roomManagement = connection.createChannel<ChM[1], ChM[0]>('room-management')

        const success = await roomManagement.send('joinRoom', code)
        if (!success) window.history.back() // TODO, maybe error etc
        
        room = connection.createChannel<Ch[1], Ch[0]>('room-joined')
        room.send('getState').then(x => roomState = x)

        room.on("state", state => {
            roomState = state
        })

        room.on("startingIn", num => {
            gameStarting = true;
        })

        room.on("starting", () => {
            console.log("GAME ON")
            navigate('/game') // this is better off in starting
        })
    })

    onDestroy(() => { // this thing should be on all channels..., well whatevs doesn't matter that much
        room.send('leave')
        room.destroy()
    })

</script>

{#if gameStarting}
    <h2>game starting soon</h2>
{:else if roomState}
    <Window title={`room ${roomState.name}`}>
        <div>id: <span class="id">{roomState.id}</span></div>
        {#if !registered}
            <div>register:</div>
            <Tab>
                <div class="name">
                    <div>name: </div>
                    <Input bind:value={name} />
                </div>
                <div class="color">
                    <div style={color ? `color: ${color};` : ''}>color: </div>
                    <ColorPicker on:color={e => color = e.detail} />
                </div>
                <button disabled={!(color && name)} on:click={register}>register</button>
            </Tab>
        {:else}
            <div>
                ready:
                <YesNo on:checked={onReadyChange}/>
            </div>
        {/if}
        <div>players: ({roomState.current}/{roomState.max})</div>
        <Tab>
            <div class="grid">
                {#each roomState.players as player }
                    <span><span style={`color: ${player.color};`}>█</span> {player.name}</span>
                    <span>{player.ready ? 'ready' : 'not ready'}</span>
                {/each}
            </div>
        </Tab>
    </Window>
{:else}
    loading
{/if}

<style>
    .name, .color {
        display: flex;
        align-items: baseline;
        justify-content: baseline;
        margin-bottom: 4px;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: baseline;
        justify-content: center;
    }

    .id {
        user-select: all;
    }
</style>