import { Connection } from "./Connection";
import { Room } from "./Room";
import randomatic from 'randomatic';
import assert from "assert";
import { trace } from "./utils/Logger";

interface Send {
}
interface Receive {
    newRoom: (roomName: string, playerCount: number, callback: (id: string) => void) => void,
    joinRoom: (id: string, callback: (success: boolean) => void) => void,
    getRoomStates: (callback: (response: RoomState[]) => void) => void,
    // isNameAvailable: (name: string, callback: (state: boolean) => void)
}

interface RoomState {
    current: number,
    max: number,
    name: string,
    id: string
}

export class RoomManager {
    private rooms: Room[] = []
    private roomIds: Set<string> = new Set();

    handleConnection(connection: Connection) {
        const channel = connection.createChannel<Send, Receive>('room-management');
        trace(`created channel 'room-management'`);
        
        channel.on('newRoom', (name, playerCount, callback) => {
            trace(`'room-management': newRoom(${name}, ${playerCount})`);
            const id = this.createRoom(name, playerCount)
            callback(id);
        })

        channel.on('joinRoom', (id, callback) => {
            trace(`'room-management': joinRoom(${id})`);
            callback(this.joinRoom(id, connection))
        })

        channel.on('getRoomStates', (callback) => {
            trace(`'room-management': getRoomStates()`);

            callback(this.rooms.map(x => {
                const { id, current, max, name, ingame } = x.getProperties()
                return { id, current, max, name, ingame };
            }).filter(x => {
                if (x.current >= x.max) return 0;
                if (x.ingame) return 0;
                return 1;
            }))
        })
    }

    joinRoom(id: string, connection: Connection): boolean {
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