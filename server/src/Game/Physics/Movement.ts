import { Pixel, Vector } from "protocol/dist/classes/Game"
import { Direction } from "protocol/dist/interfaces/Game"

export interface GrowingMoveable {
    setDirection(dir: Direction): void,
    move(grow: boolean): void
}

export class Movement {
    // return false if snake tries a 180
    static directionPermissable(dir1: Direction, dir2: Direction): boolean {
        const d1V = Movement.nextVectors(dir1)
        const d2V = Movement.nextVectors(dir2)

        return !(d1V.x + d2V.x === 0 && d1V.y + d2V.y === 0)
    }

    static nextVectors = (dir: Direction): Vector => {
        switch(dir) {
            case Direction.Up: return new Vector(0, -1)
            case Direction.Down: return new Vector(0, 1)
            case Direction.Left: return new Vector(-1, 0)
            case Direction.Right: return new Vector(1, 0)
        }
    }

    static previousLoc = (loc: Pixel, dir: Direction): Vector => {
        const vec = Movement.nextVectors(dir)
        return new Vector(loc.x - vec.x, loc.y - vec.y)
    }

    static nextLoc = (loc: Pixel, dir: Direction): Vector => {
        const vec = Movement.nextVectors(dir)
        return new Vector(loc.x + vec.x, loc.y + vec.y)
    }
}