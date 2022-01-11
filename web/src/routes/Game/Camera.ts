import { Vector } from "protocol/dist/classes/Game";
import type { Vector as IVector } from "protocol/dist/interfaces/Game";

export class Camera {
    private cam: IVector // origin of camera view, with a centered outlook
    constructor(
        private size: IVector,
        private context: CanvasRenderingContext2D,
    ) {
        this.cam = new Vector(this.size.x / 2, this.size.y / 2)
    }

    absolute(to: IVector) {
        this.cam = to;
    }

    relative(to: IVector) {
        this.cam = new Vector(this.cam.x + to.x, this.cam.y + to.y);
    }

    init() {
        this.context.setTransform(1, 0, 0, 1, 0, 0)
        this.context.clearRect(0, 0, this.size.x, this.size.y)
        this.context.translate(-this.cam.x + this.size.x / 2, -this.cam.y + this.size.y / 2)
    }

    cameraToContext(v: IVector) {
        return new Vector(v.x + this.cam.x, v.y + this.cam.y)
    }

    contextToCamera(v: IVector) {
        return new Vector(v.x - this.cam.x, v.y - this.cam.y)
    }

    keepPointWithinAreaOfCamera(point: IVector, area: IVector) {
        // if (this.size.x > ctxArea.x && this.size.y > ctxArea.y) {
        //     return this.centerCanvas()
        // }
        const camLoc = this.contextToCamera(point)
        if (Math.abs(camLoc.x) > area.x/2 || Math.abs(camLoc.y) > area.y/2) {
            this.relative(camLoc)
        }
    }

    // keepPointWithinAreaOfCameraWhileRespectingContextBoundariesAndExtendToEdges( // this is cool, really cool but buggy
    //     point: IVector, area: IVector, ctxOrigin: IVector, ctxArea: IVector
    // ) {
    //     const camLoc = this.contextToCamera(point)
    //     if (Math.abs(camLoc.x) > this.size.x/2 || Math.abs(camLoc.y) > this.size.y/2) { // out of camera
    //         const topLeft = new Vector(
    //             -Math.min(0, point.x - area.x - ctxOrigin.x),
    //             -Math.min(0, point.y - area.y - ctxOrigin.y )
    //         );
    //         const botRight = new Vector(
    //             -Math.max(0, (point.x + area.x) - (ctxOrigin.x + ctxArea.x)),
    //             -Math.max(0, (point.y + area.y) - (ctxOrigin.y + ctxArea.y))
    //         );
    //         this.absolute(new Vector(point.x + topLeft.x + botRight.x, point.y + topLeft.y + botRight.y))
    //     }
    // }

    keepPointWithinAreaOfCameraWhileRespectingContextBoundaries(
        point: IVector, area: IVector, ctxOrigin: IVector, ctxArea: IVector
    ) {
        if (this.size.x > ctxArea.x && this.size.y > ctxArea.y) {
            this.centerCanvas(ctxArea)
            return
        }

        const camLoc = this.contextToCamera(point)
        if (Math.abs(camLoc.x) > area.x/2 || Math.abs(camLoc.y) > area.y/2) { // enough distance away from camera origin
            const topLeft = new Vector(
                -Math.min(0, (point.x - area.x/2) - (ctxOrigin.x)),
                -Math.min(0, (point.y - area.y/2) - (ctxOrigin.y))
            );
            const botRight = new Vector(
                -Math.max(0, (point.x + area.x/2) - (ctxOrigin.x + ctxArea.x)),
                -Math.max(0, (point.y + area.y/2) - (ctxOrigin.y + ctxArea.y))
            );
            this.absolute(new Vector(point.x + topLeft.x + botRight.x, point.y + topLeft.y + botRight.y))
        }
    }

    centerCanvas(ctxArea: IVector) {
        this.absolute(new Vector(ctxArea.x / 2, ctxArea.y / 2))
    }
}