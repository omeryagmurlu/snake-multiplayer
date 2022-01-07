import assert from "assert";
import { Channel, Connection } from "../Connection";
import { trace } from "../utils/Logger";
import { Vector, Pixel, getRandomInt, shuffleArray } from "./GameUtils";
import { Collidable, Direction, getCollision, PlayerPhysics, VectorPhysics, WallPhysics } from "./Physics";

export interface Player {
    connection: Connection,
    name: string,
    color: string,
}

export interface IngamePlayer {
    score: number,
    dead: boolean,
    physics: PlayerPhysics,
    dueGrowth: number
}

type PelletType = { color: string, growth: number, score: number }

export interface Pellet {
    type: PelletType,
    physics: VectorPhysics
}

interface GameConfiguration {
    size: Vector,
    players: Omit<Player & IngamePlayer, "connection" | "physics">[]
    ended: boolean,
    startTime: number,
    totalTime: number,
    solid: Vector[]
}

interface BoardConfiguration {
    pellets: {
        type: PelletType,
        vector: Vector
    }[],
    players: {
        name: string,
        vectors: Pixel[]
    }[]
}

interface Send {
    "configure-game": [GameConfiguration]
    "tick": [BoardConfiguration]
}
interface Receive {
    input: (direction: Direction) => void
}

const SIZE: Vector = new Vector(40, 40);
const PAD: Vector = new Vector(10, 10);
const INITIAL_SIZE = 2;
const TIME = 240 * 1000;
const TICKTIME = 750;
const PELLET_COUNT = 3;

export class Game {
    private channels: Channel<Send, Receive>[];

    private ingame!: Record<string, IngamePlayer>;
    private pellets!: Pellet[];
    private wallPhysics!: WallPhysics;

    private ended!: boolean;
    private startTime!: number;
    private interval: any;
    
    constructor(
        private players: Player[]
    ) {
        this.init();

        this.channels = []
        for (const pl of this.players) {
            const channel = pl.connection.createChannel<Send, Receive>("game")
            this.channels.push(channel)
            
            channel.on("input", this.handleInput(pl))
        }
    }

    init() {
        this.ingame = {};

        const initialPhysics = PlayerPhysics.getNRandomInitial(this.players.length, SIZE, PAD, INITIAL_SIZE)
        this.players.forEach((pl, i) => {
            this.ingame[pl.name] = {
                score: 0,
                dead: false,
                physics: initialPhysics[i],
                dueGrowth: 0
            }
        })

        this.wallPhysics = new WallPhysics(SIZE.x, SIZE.y);
        this.pellets = []
        this.createPellets();
    }

    handleInput = (player: Player) => (dir: Direction) => {
        // trace(`player ${player.name} input: ` + dir)
        this.ingame[player.name].physics.setDirection(dir)
    }

    randomPelletType(): PelletType {
        const r = Math.random()
        if (r > 0.9) return { color: 'yellow', growth: 10, score: 25 }
        if (r > 0.6) return { color: 'red', growth: 5, score: 10 }
        return { color: 'none', growth: 1, score: 1 }
    }

    createPellets() {
        this.pellets = this.pellets ?? []
        if (this.pellets.length !== PELLET_COUNT) {
            trace(`pellets: ${this.pellets.length}/${PELLET_COUNT}`)
        }
        
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
                matrix[v.x] = matrix[v.x] ?? []
                matrix[v.x][v.y] = true;
            }
        }

        const result: Vector[] = [];
        for (let i = 0; i < SIZE.x; i++) {
            for (let j = 0; j < SIZE.y; j++) {
                if (!matrix[i][j]) result.push(new Vector(i, j))
            }
        }

        return result;
    }
    
    broadcast<K extends keyof Send>(name: K, ...data: Send[K]) {
        for (const c of this.channels) {
            c.send(name, ...data);
        }
    }
    
    start() {
        this.ended = false;
        this.startTime = Date.now();
        this.interval = setInterval(this.loop, TICKTIME);
        this.sendGameConfiguration()
        this.sendBoardConfiguration();
    }

    sendGameConfiguration() {
        this.broadcast('configure-game', {
            size: SIZE,
            ended: this.ended,
            startTime: this.startTime,
            totalTime: TIME,
            players: this.players.map(({ name, color }) => ({
                name, color,
                score: this.ingame[name].score,
                dueGrowth: this.ingame[name].dueGrowth,
                dead: this.ingame[name].dead,
            })),
            solid: this.wallPhysics.getCollidableVectors()
        })
    }

    sendBoardConfiguration() {
        this.broadcast('tick', {
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