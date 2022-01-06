import assert from "assert";
import { trace } from "./utils/Logger";
import { Channel, Connection } from "./Connection";

export interface RoomPlayer {
    connection: Connection,
    channel: Channel<Send, Receive>,
    name: string,
    color: string,
    ready: boolean
}

interface RoomState {
    id: string,
    current: number,
    name: string,
    max: number,
    players: Omit<RoomPlayer, "connection" | "channel">[],
    ingame: boolean
}

interface Send {
    startingIn: [number]
    starting: []
    state: [RoomState]
}
interface Receive {
    register: (pName: string, color: string, callback: (success: boolean) => void) => void
    ready: (ready: boolean) => void
}

export class Room {
    private inGame = false;
    private players: RoomPlayer[] = []
    private connections = new WeakSet<Connection>()
    private startTimeout: any; // I can't waste time on this shit

    constructor(
        private id: string,
        private name: string,
        private playerCount: number
    ) {}

    join(connection: Connection): boolean {
        if (this.cantRegister(connection) || this.connections.has(connection)) {
            trace('connection cant join')
            return false;
        }
        this.connections.add(connection)

        const channel = connection.createChannel<Send, Receive>('room-joined')
        trace(`created channel 'room-joined', ${this.id}`);

        channel.on('register', (pName, color, callback) => {
            trace(`'room-joined': register(${pName}, ${color})`);
            if (
                this.cantRegister(connection)
                || !!this.players.find(x => x.name === pName)
                || !!this.players.find(x => x.color === color)

            ) {
                trace('cant register')
                callback(false);
                channel.destroy();
                return
            }

            this.addPlayer(pName, color, connection, channel)
            this.updatePlayers()
            callback(true)
        })

        channel.on('ready', (ready) => {
            trace(`'room-joined': ready(${ready})`);
            const pl = this.getRegistered(connection)
            assert(typeof pl !== 'undefined');

            clearTimeout(this.startTimeout)
            pl.ready = ready
            this.updatePlayers()


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
    
    cantRegister(connection: Connection) {
        return this.players.length >= this.playerCount || this.inGame || !!this.players.find(x => x.connection.getId() === connection.getId());
    }

    getRegistered(connection: Connection) {
        return this.players.find(x => x.connection.getId() === connection.getId());
    }

    addPlayer(pName: string, color: string, connection: Connection, channel: Channel<Send, Receive>) {
        trace(`adding player ${pName}`);
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

    getProperties(): RoomState {
        return {
            id: this.id,
            current: this.players.length,
            name: this.name,
            max: this.playerCount,
            players: this.players.map(({ name, color, ready }) => ({ name, color, ready })),
            ingame: this.inGame
        }
    }

    broadcast<K extends keyof Send>(name: K, ...data: Send[K]) {
        for (const pl of this.players) {
            pl.channel.send(name, ...data);
        }
    }

    updatePlayers() {
        this.broadcast('state', this.getProperties())
    }
}