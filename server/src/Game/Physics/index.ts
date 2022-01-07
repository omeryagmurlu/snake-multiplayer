import { trace } from "../../utils/Logger";
import { nFarthest, Pixel, shuffleArray, Vector } from "../GameUtils";
import { Collidable, collidableToCollidable, pointToCollidable } from "./Collidable";
import { GrowingMoveable, Movement } from "./Movement";

export * from './Collidable'
export * from './Movement'

export enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

export class PlayerPhysics implements Collidable, GrowingMoveable {
    private previousDirection: Direction;
    constructor(
        private direction: Direction,
        private locations: Pixel[],
    ) {
        this.previousDirection = direction;
    }
    
    getCollidableVectors(): Vector[] {
        return this.locations;
    }

    collidesWith(c: Collidable): boolean {
        if (c === this) {
            // hacking away so that the head doesn't collide with the head
            return pointToCollidable(this.locations[0], {
                getCollidableVectors: () => {
                    return this.locations.slice(1)
                },
                collidesWith() {
                    throw new Error("Method not implemented")
                }
            })
        }

        return pointToCollidable(this.locations[0], c)
    }

    setDirection(dir: Direction) {
        if (Movement.directionPermissable(this.previousDirection, dir)) {
            this.direction = dir;
        }
    }

    move(grow: boolean): void {
        const head = this.locations[0]
        const nexthead = Movement.nextLoc(head, this.direction)
        this.previousDirection = this.direction;
        if (!grow) this.locations.pop();
        this.locations.unshift(nexthead)
    }
        
    static getNRandomInitial(n: number, fieldSize: Vector, fieldPadding: Vector, initialSize: number): PlayerPhysics[] {
        const starting = nFarthest(n, fieldSize, fieldPadding)
        shuffleArray(starting)
        
        return starting.map(firstLocation => {
            // const direction = shuffleArray([Direction.Down, Direction.Left, Direction.Right, Direction.Up])[0];
            const direction = Direction.Up;
            const locations = [firstLocation];

            for (let i = locations.length; i < initialSize; i++) {
                const loc = locations[i - 1];

                locations.push(Movement.previousLoc(loc, direction))
            }

            return new PlayerPhysics(direction, locations);
        })
    }
}

export class WallPhysics implements Collidable {
    private solids: Vector[];
    constructor(
        private w: number,
        private h: number
    ) {
        this.solids = [];
        for (let i = 0; i < this.w; i++) {
            this.solids.push(new Vector(i, 0))
            this.solids.push(new Vector(i, this.h - 1))
        }
    
        for (let i = 1; i < this.h - 1; i++) {
            this.solids.push(new Vector(0, i))
            this.solids.push(new Vector(this.w - 1, i))
        }
    }

    getCollidableVectors(): Vector[] {
        return this.solids;
    }

    collidesWith(c: Collidable): boolean {
        return collidableToCollidable(this, c);
    }
}

export class VectorPhysics implements Collidable {
    constructor(
        private v: Vector,
    ) {}

    getCollidableVectors(): Vector[] {
        return [this.v];
    }

    collidesWith(c: Collidable): boolean {
        return collidableToCollidable(this, c);
    }
}