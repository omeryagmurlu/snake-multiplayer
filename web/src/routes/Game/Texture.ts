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
        protected color: string,
        protected size: number
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

export class BeveledColorSquare extends ColorSquare {
    private static bcolorSquareCache: Map<string, BeveledColorSquare>[] = []
    draw(location: Vector, ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(location.x + 1, location.y + 1, this.size - 2, this.size - 2);
    }

    static colorSquare(color: string, size: number): BeveledColorSquare {
        const map = BeveledColorSquare.bcolorSquareCache[size] ?? (BeveledColorSquare.bcolorSquareCache[size] = new Map())
        
        const mapped = map.get(color);
        if (mapped) return mapped;
        const nw = new BeveledColorSquare(color, size);
        map.set(color, nw)
        return nw;
    }
}