import type { GameConfiguration } from "protocol/dist/interfaces/Game";

export const BLOCK_SIZE_IN_PIXEL = 20;
let i = 0

export const createTick = (
    canvas: HTMLCanvasElement, gameConfig: GameConfiguration, innerWidth: number, innerHeight: number
): () => void => {
    // if game fits within bounds, don't use camera at all, otherwise use camera.
    // camera position is set to players current location when the difference between active cam loc and player gets big
    // don't forget, you are moving the world, not the player, so the vector is inverted

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('couldnt get canvas context')

    const curW = Math.min(innerWidth, BLOCK_SIZE_IN_PIXEL * gameConfig.size.x)
    const curH = Math.min(innerHeight, BLOCK_SIZE_IN_PIXEL * gameConfig.size.y)

    return () => {
        i = i + 1// % BLOCK_SIZE_IN_PIXEL * gameConfig.size.x // both same rn

        ctx.restore()
        ctx.clearRect(0, 0, 2000, 2000); //
        ctx.save()
        // ctx.translate(-300, -300)
        ctx.translate(-i, -i)

        ctx.fillStyle = 'rgb(200, 0, 0)';
        ctx.fillRect(10, 10, 50, 50);
        ctx.fillRect(600, 600, 50, 50);

        ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
        ctx.fillRect(30, 30, 50, 50);
        ctx.fillRect(300, 300, 50, 50);
        ctx.fillRect(1000, 1000, 50, 50);

        ctx.fillStyle = 'yellow';
        ctx.fillRect(775, 775, 50, 50);

        console.log('paint')
    }
}