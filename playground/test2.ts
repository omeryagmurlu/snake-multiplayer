import { Vector } from "protocol/dist/classes/Game";
import type { GameConfiguration } from "protocol/dist/interfaces/Game";
import { Camera } from "./Camera";

export const BLOCK_SIZE_IN_PIXEL = 20;
let j = 0

export const createTick = (
    canvas: HTMLCanvasElement, gameConfig: GameConfiguration, innerWidth: number, innerHeight: number
): () => void => {
    // if game fits within bounds, don't move camera at all, otherwise move camera.
    // camera position is set to players current location when the difference between active cam loc and player gets big
    // don't forget, you are moving the world, not the player, so the vector is inverted

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('couldnt get canvas context')

    const curW = Math.min(innerWidth, BLOCK_SIZE_IN_PIXEL * gameConfig.size.x)
    const curH = Math.min(innerHeight, BLOCK_SIZE_IN_PIXEL * gameConfig.size.y)

    const cam = new Camera(new Vector(curW, curH), ctx);

    return () => {
        j++
        const i = j % 600

        cam.init()
        cam.keepPointWithinAreaOfCameraWhileRespectingContextBoundaries(
            new Vector(i, i*2), new Vector(400, 400), new Vector(0, 0), new Vector(1200, 1200)
        )
        // cam.keepPointWithinAreaOfCamera(new Vector(i, i*2), new Vector(400, 400))

        ctx.fillStyle = 'purple';
        ctx.fillRect(0, 0, 1200, 1200);
        ctx.fillStyle = 'black';
        ctx.fillRect(1, 1, 1198, 1198);

        const v = cam.cameraToContext(new Vector(-200, -200))
        ctx.fillStyle = 'green';
        ctx.fillRect(v.x, v.y, 400, 400);
        ctx.fillStyle = 'black';
        ctx.fillRect(v.x + 1, v.y + 1, 398, 398);

        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(600, 1200);
        ctx.stroke();

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(i, i*2, 5, 5);

        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(10, 10, 50, 50);
        ctx.fillRect(600, 600, 50, 50);

        ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(30, 30, 50, 50);
        ctx.fillRect(300, 300, 50, 50);
        ctx.fillRect(1000, 1000, 50, 50);

        ctx.fillStyle = 'yellow';
        ctx.fillRect(775, 775, 50, 50);

        // console.log('paint')
    }
}