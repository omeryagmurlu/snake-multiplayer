import { Room } from "./Room";
import randomatic from 'randomatic';
import assert from "assert";
import { trace } from "./utils/Logger";
import { Connection } from "protocol";
import { RoomRegistration, RoomState } from "protocol/dist/interfaces/RoomManagement";
import { Channels } from "protocol/dist/interfaces/Channels";
import { ChannelManager } from "./utils/ChannelManager";

type Ch = Channels['room-management']

export class RoomManager {
    private chanman = new ChannelManager<Ch[0], Ch[1]>()
    private rooms: Room[] = []
    private roomIds: Set<string> = new Set();

    handleConnection(connection: Connection<Channels>) {
        const channel = this.chanman.manage(connection.createChannel('room-management'));
        trace(`created channel 'room-management'`);
        
        channel.on('newRoom', (registration, callback) => {
            trace(`'room-management': newRoom(`, registration);
            const id = this.createRoom(registration)
            callback(id);
            this.updateClients()
        })

        channel.on('joinRoom', (id, callback) => {
            trace(`'room-management': joinRoom(${id})`);
            callback(this.joinRoom(id, connection))
            this.updateClients()
        })

        channel.on('getRoomStates', (callback) => {
            trace(`'room-management': getRoomStates()`);

            callback(this.getRoomStates())
        })
    }

    getRoomStates(): RoomState[] {
        return this.rooms.map(x => {
            const { id, current, max, name, ingame } = x.getProperties()
            return { id, current, max, name, ingame };
        }).filter(x => {
            if (x.current >= x.max) return 0;
            if (x.ingame) return 0;
            return 1;
        })
    }

    updateClients() {
        this.chanman.broadcast('state', this.getRoomStates())
    }

    joinRoom(id: string, connection: Connection<Channels>): boolean {
        if (!this.roomIds.has(id)) return false;

        const room = this.rooms.find(x => x.getProperties().id === id);
        assert(typeof room !== 'undefined')
        return room.join(connection);
    }

    createRoom(registration: RoomRegistration) {
        let id = randomatic('A0', 5);
        while (this.roomIds.has(id)) id = randomatic('A0', 5); // this code will %99.999999 never run, but for the off case it's needed
        this.roomIds.add(id)
        this.rooms.push(new Room(id, registration))
        return id;
    }
}