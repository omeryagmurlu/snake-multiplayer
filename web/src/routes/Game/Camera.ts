import { Vector } from "protocol/dist/classes/Game";

export class Camera {
    private cam: Vector // origin of camera view, with a centered outlook
    constructor(
        private size: Vector,
        private context: CanvasRenderingContext2D,
    ) {
        this.cam = new Vector(this.size.x / 2, this.size.y / 2)
    }

    absolute(to: Vector) {
        this.cam = to;
    }

    relative(to: Vector) {
        this.cam = new Vector(this.cam.x + to.x, this.cam.y + to.y);
    }

    init() {
        this.context.setTransform(1, 0, 0, 1, 0, 0)
        this.context.clearRect(0, 0, this.size.x, this.size.y)
        this.context.translate(-this.cam.x + this.size.x / 2, -this.cam.y + this.size.y / 2)
    }

    cameraToContext(v: Vector) {
        return new Vector(v.x + this.cam.x, v.y + this.cam.y)
    }

    contextToCamera(v: Vector) {
        return new Vector(v.x - this.cam.x, v.y - this.cam.y)
    }

    keepPointWithinAreaOfCamera(point: Vector, area: Vector) {
        const camLoc = this.contextToCamera(point)
        if (Math.abs(camLoc.x) > area.x/2 || Math.abs(camLoc.y) > area.y/2) {
            this.relative(camLoc)
        }
    }

    keepPointWithinAreaOfCameraWhileRespectingContextBoundariesAndExtendToEdges(
        point: Vector, area: Vector, ctxOrigin: Vector, ctxArea: Vector
    ) {
        const camLoc = this.contextToCamera(point)
        if (Math.abs(camLoc.x) > this.size.x/2 || Math.abs(camLoc.y) > this.size.y/2) { // out of camera
            const topLeft = new Vector(
                -Math.min(0, point.x - area.x - ctxOrigin.x),
                -Math.min(0, point.y - area.y - ctxOrigin.y )
            );
            const botRight = new Vector(
                -Math.max(0, (point.x + area.x) - (ctxOrigin.x + ctxArea.x)),
                -Math.max(0, (point.y + area.y) - (ctxOrigin.y + ctxArea.y))
            );
            this.absolute(new Vector(point.x + topLeft.x + botRight.x, point.y + topLeft.y + botRight.y))
        }
    }

    keepPointWithinAreaOfCameraWhileRespectingContextBoundaries(
        point: Vector, area: Vector, ctxOrigin: Vector, ctxArea: Vector
    ) {
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
}