import assert from "assert";
import { Connection, ChannelArray } from "protocol";
import { Vector as IVector, PelletType, Direction } from "protocol/dist/interfaces/Game";
import { Vector } from "protocol/dist/classes/Game";
import { Channels } from "protocol/dist/interfaces/Channels";

import { trace } from "../utils/Logger";
import { shuffleArray } from "./GameUtils";
import { Collidable, getCollision, PlayerPhysics, VectorPhysics, WallPhysics } from "./Physics";
import { ChannelManager } from "../utils/ChannelManager";

type Ch = Channels['game']

export interface Player {
    connection: Connection<Channels>,
    name: string,
    color: string,
}

export interface IngamePlayer {
    score: number,
    dead: boolean,
    physics: PlayerPhysics,
    dueGrowth: number
}

export interface Pellet {
    type: PelletType,
    physics: VectorPhysics
}

const DEFAULT_SIZE = new Vector(40, 40);
const PAD = new Vector(10, 10);
const INITIAL_SIZE = 2;
const TIME = 240 * 1000;
const TICKTIME = 400;
const PELLET_COUNT = 3;

export class Game {
    private chanman = new ChannelManager<Ch[0], Ch[1], string>()

    private ingame!: Record<string, IngamePlayer>;
    private pellets!: Pellet[];
    private wallPhysics!: WallPhysics;

    private ended!: boolean;
    private startTime!: number;
    private interval: any;
    
    constructor(
        private players: Player[],
        private size: IVector = DEFAULT_SIZE
    ) {
        this.init();

        this.chanman.on('left', (_, name) => {
            trace(`game: left ${name}`)
            if (this.ingame[name]) {
                trace(`game: killed left ${name}`);
                this.ingame[name].dead = true;
            }
        })

        for (const pl of this.players) {
            trace('game: creating channel')
            const channel = this.chanman.manage(pl.connection.createChannel<Ch[0], Ch[1]>("game"), pl.name);
            
            channel.on("input", this.handleInput(pl))
            channel.on('getGameConfiguration', cb => {
                this.sendGameConfiguration();
                cb(this.getGameConfiguration());
            });
            channel.on('leave', () => {
                trace(`'game': leave()`);
                this.chanman.remove(channel);
            })
        }
    }

    init() {
        this.ingame = {};

        const initialPhysics = PlayerPhysics.getNRandomInitial(this.players.length, this.size, PAD, INITIAL_SIZE)
        this.players.forEach((pl, i) => {
            this.ingame[pl.name] = {
                score: 0,
                dead: false,
                physics: initialPhysics[i],
                dueGrowth: 0
            }
        })

        this.wallPhysics = new WallPhysics(this.size.x, this.size.y);
        this.pellets = []
        this.createPellets();
    }

    handleInput = (player: Player) => (dir: Direction) => {
        // trace(`player ${player.name} input: ` + dir)
        this.ingame[player.name].physics.setDirection(dir)
    }

    randomPelletType(): PelletType {
        const r = Math.random()
        if (r > 0.9) return { color: '#00ffff', growth: 10, score: 25 }
        if (r > 0.6) return { color: '#ff0000', growth: 5, score: 10 }
        return { color: '#888888', growth: 1, score: 1 }
    }

    createPellets() {
        this.pellets = this.pellets ?? []
        
        if (this.pellets.length === PELLET_COUNT) {
            return;
        }
        
        trace(`pellets: ${this.pellets.length}/${PELLET_COUNT}`)
        const freeLocs = this.getFreePelletLocations()
        shuffleArray(freeLocs)

        while (this.pellets.length < PELLET_COUNT) {
            const vector = freeLocs.shift();
            if (!vector) {
                break;
            }

            const type = this.randomPelletType();
            this.pellets.push({
                type,
                physics: new VectorPhysics(vector)
            })
        }
    }

    getFreePelletLocations(): Vector[] { // this is sooo slow fuck I did shit design whatevs
        const matrix: boolean[][] = [];

        const cts = [...this.getCollisionTargets(), ...this.pellets.map(x => x.physics)]
        for (const c of cts) {
            const vs = c.getCollidableVectors();
            for (const v of vs) {
                matrix[v.y] = matrix[v.y] ?? []
                matrix[v.y][v.x] = true;
            }
        }

        const result: Vector[] = [];
        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.y; j++) {
                if (!matrix[j][i]) result.push(new Vector(i, j))
            }
        }

        return result;
    }
    
    start() {
        this.ended = false;
        this.startTime = Date.now();
        this.interval = setInterval(this.loop, TICKTIME);
        this.sendGameConfiguration()
        this.sendBoardConfiguration();
    }

    sendGameConfiguration() {
        this.chanman.broadcast('configure-game', this.getGameConfiguration())
    }

    getGameConfiguration() {
        return {
            size: this.size,
            ended: this.ended,
            startTime: this.startTime,
            totalTime: TIME,
            players: this.players.map(({ name, color, connection }) => ({
                name, color,
                score: this.ingame[name].score,
                dueGrowth: this.ingame[name].dueGrowth,
                dead: this.ingame[name].dead,
                id: connection.getId()
            })),
            solid: this.wallPhysics.getCollidableVectors()
        };
    }

    sendBoardConfiguration() {
        this.chanman.broadcast('tick', {
            pellets: this.pellets.map(({ type, physics }) => ({
                type,
                vector: physics.getCollidableVectors()[0]
            })),
            players: this.getActivePlayers().map(({ name }) => ({
                name,
                vectors: this.ingame[name].physics.getCollidableVectors()
            }))
        })
    }
    
    end() {
        this.ended = true;
        clearInterval(this.interval)
        // this.sendBoardConfiguration();
        this.sendGameConfiguration()
    }

    loop = () => {
        let shouldSendGameConfig = false;
        if (this.ended) {
            trace('wtf alread ended')
            return;
        }

        if (Date.now() - TIME >= this.startTime) {
            trace('timer ended, end')
            return this.end();
        }

        // Accounting

        const deadThisTurn: Player[] = []
        const eatenPellets: [Pellet, Player][] = []
        for (const player of this.getActivePlayers()) {
            const collision = getCollision(this.ingame[player.name].physics, this.getCollisionTargets());
            if (collision !== null) {
                trace(`player ${player.name} collided`, collision.getCollidableVectors())
                deadThisTurn.push(player)
            }

            const pelletCollision = getCollision(this.ingame[player.name].physics, this.pellets.map(x => x.physics));
            if (pelletCollision !== null) eatenPellets.push([this.pellets.find(x => x.physics === pelletCollision)!, player]) // collision returns the collision target, so pellet exists
        }

        // Logic
        
        for (const [pellet, player] of eatenPellets) {
            shouldSendGameConfig = true;
            this.ingame[player.name].score += pellet.type.score
            this.ingame[player.name].dueGrowth += pellet.type.growth
        }
        const toRemove = eatenPellets.map(x => x[0])
        this.pellets = this.pellets.filter(x => !toRemove.includes(x))

        for (const dead of deadThisTurn) {
            shouldSendGameConfig = true;
            this.ingame[dead.name].dead = true
        }

        if (this.getActivePlayers().length === 1) {
            trace('one player left, end', this.getActivePlayers())
            return this.end();
        }

        // Update

        this.createPellets()

        if (this.pellets.length === 0) {
            trace('no pellets, end')
            this.end();
        }

        for (const player of this.getActivePlayers()) {
            const ig = this.ingame[player.name]
            let shouldGrow = false;
            if (ig.dueGrowth > 0) {
                ig.dueGrowth--;
                shouldGrow = true;
            }

            ig.physics.move(shouldGrow);
        }

        this.sendBoardConfiguration();
        if (shouldSendGameConfig) {
            this.sendGameConfiguration();
        }
    }

    getActivePlayers(): Player[] {
        return this.players.filter(x => !this.ingame[x.name].dead)
    }

    getCollisionTargets(): Collidable[] {
        return [ this.wallPhysics, ...this.getActivePlayers().map(({ name }) => this.ingame[name].physics) ]
    }

    isEnded(): boolean {
        let count = 0;
        for (const { dead } of Object.values(this.ingame)) {
            if (!dead) count++
        }
        return !(count > 1);
    }
}