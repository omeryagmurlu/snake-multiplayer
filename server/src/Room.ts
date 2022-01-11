import assert from "assert";
import { Channel, ChannelArray, Connection } from "protocol";
import { DetailedRoomState, PlayerRegistration } from "protocol/dist/interfaces/Room";
import { Vector } from "protocol/dist/interfaces/Game";
import { Channels } from "protocol/dist/interfaces/Channels";
import { trace } from "./utils/Logger";
import { Game } from "./Game";
import { ChannelManager } from "./utils/ChannelManager";
import { RoomRegistration } from "protocol/dist/interfaces/RoomManagement";

type Ch = Channels['room-joined']

export interface RoomPlayer {
    connection: Connection<Channels>,
    channel: Channel<Ch[0], Ch[1]>,
    name: string,
    color: string,
    ready: boolean
}

export class Room {
    private chanman = new ChannelManager<Ch[0], Ch[1]>()

    private inGame = false;
    private players: RoomPlayer[] = []
    private startTimeout: any; // I can't waste time on this shit
    private name: string;
    private playerCount: number;
    private size: Vector;

    constructor(
        private id: string,
        registration: RoomRegistration
    ) {
        this.name = registration.name;
        this.playerCount = registration.count;
        this.size = registration.size;
        this.chanman.on('left', channel => {
            const player = this.players.find(x => x.channel === channel)
            this.players = this.players.filter(p => p !== player);

            this.updateAll()
        })
    }

    join(connection: Connection<Channels>): boolean {
        const channel = this.chanman.manage(connection.createChannel<Ch[0], Ch[1]>('room-joined'))
        trace(`created channel 'room-joined', ${this.id}`);

        channel.on('register', (registration, callback) => {
            trace(`'room-joined': register(${registration})`);
            if (!this.canRegister(connection, registration)) {
                trace('cant register')
                return callback(false);
            }

            this.addPlayer(registration, connection, channel)
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

            this.startGameIfPossible()
        })
        
        channel.on('leave', () => {
            trace(`'room-joined': leave()`);
            this.chanman.remove(channel)
        })

        channel.on('getState', (cb) => {
            cb(this.getProperties())
        })

        return true;
    }
    
    canRegister(connection: Connection<Channels>, { name, color }: PlayerRegistration) {
        return (
            // room checks
            this.players.length < this.playerCount
            && !this.inGame
            // same connection can't register more than once
            && !this.players.find(x => x.connection.getId() === connection.getId())
            // player is permissable
            && !this.players.find(x => x.name === name)
            && !this.players.find(x => x.color === color)
        );
    }
    
    getRegistered(connection: Connection<Channels>) {
        return this.players.find(x => x.connection.getId() === connection.getId());
    }
    
    addPlayer({ name, color }: PlayerRegistration, connection: Connection<Channels>, channel: Channel<Ch[0], Ch[1]>) {
        trace(`adding player ${name}`);
        this.players.push({
            connection,
            channel,
            name,
            color,
            ready: false
        })
    }

    startGameIfPossible() {
        if (this.readyToStart()) {
            this.playerChannels().broadcast('startingIn', 3000)
            this.startTimeout = setTimeout(() => {
                if (this.readyToStart()) {
                    this.playerChannels().broadcast('starting')
                    this.createGame()
                }
            }, 3000)
        }
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
        this.chanman.broadcast('state', this.getProperties())
    }

    playerChannels() {
        return new ChannelArray<Ch[0], Ch[1]>(...this.players.map(x => x.channel))
    }

    createGame() {
        this.inGame = true;
        this.updateAll();

        const game = new Game(this.players.map(({ name, color, connection }) => ({ name, color, connection })), this.size);
        game.start() // with game.onEnd etc setup the room again after a play TODO maybe? 
    }
}