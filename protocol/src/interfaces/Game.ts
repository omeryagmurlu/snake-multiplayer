export interface ServerSend {
    "configure-game": (conf: GameConfiguration) => void,
    "tick": (conf: BoardConfiguration) => void
}

export interface ClientSend {
    input: (direction: Direction) => void,
    leave: () => void
    getGameConfiguration: () => GameConfiguration
}

export enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

export interface Vector {
    x: number,
    y: number
}

export interface Pixel extends Vector {
    wasPellet?: boolean
}

export interface Player {
    name: string,
    color: string,
    score: number,
    dead: boolean,
    dueGrowth: number,
    id: string
}

export interface GameConfiguration {
    size: Vector,
    players: Player[]
    ended: boolean,
    startTime: number,
    totalTime: number,
    solid: Vector[]
}

export interface Pellet {
    type: PelletType,
    vector: Vector
}
export interface PelletType { color: string, growth: number, score: number }

export interface PlayerPositioning {
    name: string,
    vectors: Pixel[]
}

export interface BoardConfiguration {
    pellets: Pellet[],
    players: PlayerPositioning[]
}