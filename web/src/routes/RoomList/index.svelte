<script lang="ts">
    import type { Channel, Connection } from "protocol";
	import type { Channels } from 'protocol/dist/interfaces/Channels';
    import type { RoomState } from "protocol/dist/interfaces/RoomManagement";
    import { onDestroy, onMount } from "svelte";
    import Window from "../../components/Window.svelte";
    import { Link } from "svelte-routing";
    import Tab from "../../components/Tab.svelte";
    import LinkButton from "../../components/LinkButton.svelte";

    type Ch = Channels['room-management']
    export let connection: Connection<Channels>
    
    let rooms: RoomState[] = []
    let channel: Channel<Ch[1], Ch[0]>;

    onMount(async () => {
        channel = connection.createChannel<Ch[1], Ch[0]>('room-management')
        
        channel.on('state', state => {
            rooms = state;
        })
        rooms = await channel.send('getRoomStates')
    })

    onDestroy(() => {
        channel.destroy();
    })
</script>

<Window
    title="available rooms"
>
    <Link to="/newroom" >new room</Link>
    <div>rooms:</div>
    <Tab>
        <div class="grid">
            {#each rooms as room}
            <div>{room.name}</div>
            <div style="user-select: all;">{room.id}</div>
            <div>{room.current}/{room.max}</div>
            <div>
                <LinkButton to={`/room/${room.id}`}>join</LinkButton>
            </div>
            {/each}
        </div>
    </Tab>
</Window>

<style>
    .grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        align-items: baseline;
        justify-content: center;
    }
</style>