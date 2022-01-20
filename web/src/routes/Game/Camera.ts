import { Vector } from "protocol/dist/classes/Game";
import type { Vector as IVector } from "protocol/dist/interfaces/Game";

export class Camera {
    private cam: IVector // origin of camera view, with a centered outlook
    constructor(
        private canvasSize: IVector,
        private gameSize: IVector,
        private gameOrigin = new Vector(0, 0),
        private context: CanvasRenderingContext2D,
    ) {
        this.cam = new Vector(this.canvasSize.x / 2, this.canvasSize.y / 2)
    }

    absolute(to: IVector) {
        this.cam = to;
    }

    apply() {
        this.context.setTransform(1, 0, 0, 1, 0, 0)
        this.context.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y)
        this.context.translate(Math.round(-this.cam.x + this.canvasSize.x / 2), Math.round(-this.cam.y + this.canvasSize.y / 2))
    }

    centered(point: IVector) {
        this.absolute(new Vector(
            Camera.clamp(point.x, this.gameOrigin.x, this.gameSize.x, this.canvasSize.x),
            Camera.clamp(point.y, this.gameOrigin.y, this.gameSize.y, this.canvasSize.y),
        ));
    }

    private static clamp(worldPosition: number, worldOrigin: number, worldLength: number, camLength: number): number {
        const min = worldOrigin + camLength / 2;
        const max = (worldOrigin + worldLength) - camLength / 2;

        if (camLength > worldLength) return (worldOrigin + worldLength) / 2
        if (worldPosition < min) return min;
        if (worldPosition > max) return max;
        return worldPosition;
    }
}