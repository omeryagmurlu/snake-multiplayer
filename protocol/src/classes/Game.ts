import { Vector as IVector, Pixel as IPixel } from '../interfaces/Game'

export class Vector implements IVector {
    constructor(
        public x: number,
        public y: number
    ) {}

    equals(l2: Vector): boolean {
        return this.x === l2.x && this.y === l2.y;
    }
}

export class Pixel extends Vector implements IPixel {
    constructor(x: number, y: number,
        public wasPellet?: boolean
    ) {
        super(x, y);
    }
}