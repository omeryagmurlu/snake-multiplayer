<script lang="ts">
    import type { Connection } from "protocol";
    import { onMount } from "svelte";
    import Window from "../../components/Window.svelte";
    import NewRoomLink from "./NewRoomLink.svelte";

    interface Receive {
    }
    interface Send {
        newRoom: [string, number, ((id: string) => void)?],
        joinRoom: [string, ((success: boolean) => void)?],
        getRoomStates: [((response: RoomState[]) => void)?],
    }

    interface RoomState {
        current: number,
        max: number,
        name: string,
        id: string
    }

    let availableRooms

    export let connection: Connection

    onMount(async () => {
        const roomManagement = connection.createChannel<Send, Receive>('room-management')

        availableRooms = await roomManagement.sendAndWait('getRoomStates')
    })

</script>

<Window
    title="Available Rooms"
    BottomButtonWrapper={NewRoomLink}
>
{connection.getId()}
{JSON.stringify(availableRooms)}
</Window>