import assert from "assert";
import { Channel, ChannelArray, Connection } from "protocol";
import { DetailedRoomState } from "protocol/dist/interfaces/Room";
import { Channels } from "protocol/dist/interfaces/Channels";
import { trace } from "./utils/Logger";
import { Game } from "./Game";

type Ch = Channels['room-joined']

export interface RoomPlayer {
    connection: Connection<Channels>,
    channel: Channel<Ch[0], Ch[1]>,
    name: string,
    color: string,
    ready: boolean
}

export class Room {
    private inGame = false;
    private players: RoomPlayer[] = []
    private channels: ChannelArray<Ch[0], Ch[1]> = new ChannelArray()
    private connections = new WeakSet<Connection<Channels>>()
    private startTimeout: any; // I can't waste time on this shit

    constructor(
        private id: string,
        private name: string,
        private playerCount: number
    ) {}

    join(connection: Connection<Channels>): boolean {
        if (this.cantRegister(connection) || this.connections.has(connection)) {
            trace('connection cant join')
            return false;
        }
        this.connections.add(connection)

        const channel = connection.createChannel<Ch[0], Ch[1]>('room-joined')
        this.channels.push(channel);
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
                return
            }

            this.addPlayer(pName, color, connection, channel)
            this.updateAll()
            callback(true)
        })

        channel.on('ready', (ready) => {
            trace(`'room-joined': ready(${ready})`);
            const pl = this.getRegistered(connection)
            assert(typeof pl !== 'undefined');

            clearTimeout(this.startTimeout)
            pl.ready = ready
            this.updateAll()

            if (this.readyToStart()) {
                this.playerChannels().broadcast('startingIn', 3000)
                this.startTimeout = setTimeout(() => {
                    if (this.readyToStart()) {
                        this.playerChannels().broadcast('starting')
                        this.createGame()
                    }
                }, 3000)
            }
        })
        
        channel.on('leave', () => {
            trace(`'room-joined': leave()`);
            this.leave(connection, channel);
        })

        channel.onDisconnect(() => {
            trace(`'room-joined': disconnecting`);
            this.leave(connection, channel);
        })

        channel.on('getState', (cb) => {
            cb(this.getProperties())
        })

        return true;
    }

    leave(connection: Connection<Channels>, channel: Channel<Ch[0], Ch[1]>) {
            const player = this.players.find(x => x.connection.getId() === connection.getId())
            this.players = this.players.filter(p => p !== player);

            this.channels.remove(channel)
            channel.destroy()
            this.connections.delete(connection)
            this.updateAll()
    }
    
    cantRegister(connection: Connection<Channels>) {
        return this.players.length >= this.playerCount || this.inGame || !!this.players.find(x => x.connection.getId() === connection.getId());
    }

    getRegistered(connection: Connection<Channels>) {
        return this.players.find(x => x.connection.getId() === connection.getId());
    }

    addPlayer(pName: string, color: string, connection: Connection<Channels>, channel: Channel<Ch[0], Ch[1]>) {
        trace(`adding player ${pName}`);
        this.players.push({
            connection,
            channel,
            name: pName,
            color,
            ready: false
        })
    }

    readyToStart() {
        return this.playerCount === this.players.length && this.players.reduce((acc, curr) => {
            return acc && curr.ready;
        }, true)
    }

    getProperties(): DetailedRoomState {
        return {
            id: this.id,
            current: this.players.length,
            name: this.name,
            max: this.playerCount,
            players: this.players.map(({ name, color, ready }) => ({ name, color, ready })),
            ingame: this.inGame
        }
    }

    updateAll() {
        this.allChannels().broadcast('state', this.getProperties())
    }

    playerChannels() {
        return new ChannelArray<Ch[0], Ch[1]>(...this.players.map(x => x.channel))
    }

    allChannels() {
        return this.channels
    }

    createGame() {
        this.inGame = true;
        this.updateAll();

        const game = new Game(this.players.map(({ name, color, connection }) => ({ name, color, connection })));
        game.start() // with game.onEnd etc setup the room again after a play TODO maybe? 
    }
}