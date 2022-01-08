<script lang="ts">
    import type { Channel, Connection } from "protocol";
    import type { Channels } from "protocol/dist/interfaces/Channels";
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";

    import Input from "../components/Input.svelte";
    import Window from "../components/Window.svelte";

    type Ch = Channels['room-management']
    export let connection: Connection<Channels>
    let roomManagement: Channel<Ch[1], Ch[0]>

    let name: string;
    let count: number;
    // let sizeW: number;
    // let sizeH: number;

    const create = async () => {
        const id = await roomManagement.send('newRoom', name, count) // sizeW and sizeH njot in use (yet?)

        if (!id) return;
        navigate(`/room/${id}`)
    }

    onMount(async () => { // onDestroy would be good but I'm lazy, no one is gonna use this anyway
        roomManagement = connection.createChannel<Ch[1], Ch[0]>('room-management')
    })
</script>

<Window title="new room">
    <nav>
        <div>name: </div>
        <Input bind:value={name} />
    </nav>
    <nav>
        <div>player count: </div>
        <input type="number" bind:value={count} min="2" style="width: 50px;"/>
    </nav>
    <!-- <nav>
        <div>canvas size: </div>
        <div>
            <input type="number" bind:value={sizeW} min="0" style="width: 50px;"/>px
             to <input type="number" bind:value={sizeH} min="0" style="width: 50px;"/>px
        </div>
    </nav> -->
    <button disabled={!(name && count)} on:click={create}>create</button>
</Window>

<style>
    nav {
        display: flex;
        align-items: baseline;
        justify-content: baseline;
        margin-bottom: 4px;
    }
</style>