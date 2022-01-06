import assert from "assert";
import { Channel, Connection } from "./Connection";

export interface RoomPlayer {
    connection: Connection,
    channel: Channel<Send, Receive>,
    name: string,
    color: string,
    ready: boolean
}

interface Send {
    startingIn: [number]
    starting: []
}
interface Receive {
    register: (pName: string, color: string, callback: (success: boolean) => void) => void
    ready: (ready: boolean) => void
}

export class Room {
    private inGame = false;
    private players: RoomPlayer[] = []
    private startTimeout: any; // I can't waste time on this shit

    constructor(
        private id: string,
        private name: string,
        private playerCount: number
    ) {}

    join(connection: Connection): boolean {
        if (this.cantRegister()) return false;

        const channel = connection.createChannel<Send, Receive>('room-joined')

        channel.on('register', (pName, color, callback) => {
            if (this.cantRegister()) {
                callback(false);
                channel.destroy();
            }
    
            this.addPlayer(pName, color, connection, channel)
        })

        channel.on('ready', (ready) => {
            const pl = this.getRegistered(connection)
            assert(typeof pl !== 'undefined');

            clearTimeout(this.startTimeout)
            pl.ready = ready


            if (this.isAllReady()) {
                this.broadcast('startingIn', 3000)
                this.startTimeout = setTimeout(() => {
                    if (this.isAllReady()) {
                        // TODO create game here
                        this.broadcast('starting')
                    }
                }, 3000)
            }
        })

        return true;
    }
    
    cantRegister() {
        return this.players.length >= this.playerCount || this.inGame;
    }

    getRegistered(connection: Connection) {
        return this.players.find(x => x.connection.getId() === connection.getId());
    }

    addPlayer(pName: string, color: string, connection: Connection, channel: Channel<Send, Receive>) {
        this.players.push({
            connection,
            channel,
            name: pName,
            color,
            ready: false
        })
    }

    isAllReady() {
        return this.players.reduce((acc, curr) => {
            return acc && curr.ready;
        }, true)
    }

    getProperties() {
        return {
            id: this.id,
            current: this.players.length,
            name: this.name,
            max: this.playerCount,
            players: this.players,
            ingame: this.inGame
        }
    }

    broadcast<K extends keyof Send>(name: K, ...data: Send[K]) {
        for (const pl of this.players) {
            pl.channel.send(name, ...data);
        }
    }
}