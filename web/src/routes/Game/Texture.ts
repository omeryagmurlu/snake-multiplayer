import type { Vector } from "protocol/dist/interfaces/Game";

export interface Texture {
    draw(location: Vector, ctx: CanvasRenderingContext2D): void
}

export class ImageTexture implements Texture {
    draw(location: Vector): void {
        throw new Error("Method not implemented.");
    }
}

export class ColorSquare implements Texture {
    private static colorSquareCache: Map<string, ColorSquare>[] = []

    constructor(
        private color: string,
        private size: number
    ) {}

    draw(location: Vector, ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(location.x, location.y, this.size, this.size);
    }

    static colorSquare(color: string, size: number): ColorSquare {
        const map = ColorSquare.colorSquareCache[size] ?? (ColorSquare.colorSquareCache[size] = new Map())
        
        const mapped = map.get(color);
        if (mapped) return mapped;
        const nw = new ColorSquare(color, size);
        map.set(color, nw)
        return nw;
    }
}