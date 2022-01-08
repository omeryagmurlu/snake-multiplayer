import { Room } from "./Room";
import randomatic from 'randomatic';
import assert from "assert";
import { trace } from "./utils/Logger";
import { ChannelArray, Connection } from "protocol";
import { RoomState } from "protocol/dist/interfaces/RoomManagement";
import { Channels } from "protocol/dist/interfaces/Channels";

type Ch = Channels['room-management']

export class RoomManager {
    private channels = new ChannelArray<Ch[0], Ch[1]>()
    private rooms: Room[] = []
    private roomIds: Set<string> = new Set();

    handleConnection(connection: Connection<Channels>) {
        const channel = connection.createChannel<Ch[0], Ch[1]>('room-management');
        this.channels.push(channel);
        trace(`created channel 'room-management'`);
        
        channel.on('newRoom', (name, playerCount, callback) => {
            trace(`'room-management': newRoom(${name}, ${playerCount})`);
            const id = this.createRoom(name, playerCount)
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

        channel.onDisconnect(() => {
            this.channels.remove(channel);
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
        this.channels.broadcast('state', this.getRoomStates())
    }

    joinRoom(id: string, connection: Connection<Channels>): boolean {
        if (!this.roomIds.has(id)) return false;

        const room = this.rooms.find(x => x.getProperties().id === id);
        assert(typeof room !== 'undefined')
        return room.join(connection);
    }

    createRoom(name: string, playerCount: number) {
        let id = randomatic('A0', 5);
        while (this.roomIds.has(id)) id = randomatic('A0', 5); // this code will %99.999999 never run, but for the off case it's needed
        this.roomIds.add(id)
        this.rooms.push(new Room(id, name, playerCount))
        return id;
    }
    
}