import { Vector } from "protocol/dist/classes/Game";
import type { BoardConfiguration, GameConfiguration, PelletType, Pixel, Player, PlayerPositioning, Vector as IVector } from "protocol/dist/interfaces/Game";
import { Camera } from "./Camera";
import { ColorSquare, Texture } from "./Texture";

export interface GameTextureSet {
    solid: Texture,
    pellet: (pType: PelletType) => Texture,
    player: (player: Player, positioning: Pixel[], positionIndex: number) => Texture
}

const mul = (v: IVector, n: number) => new Vector(v.x * n, v.y * n);

class ColorSquareTextures implements GameTextureSet {
    public solid: ColorSquare;
    constructor(private size: number) {
        this.solid = ColorSquare.colorSquare('gray', size)
    }
    public pellet({ color }: PelletType) { return ColorSquare.colorSquare(color, this.size) }
    public player({ color }: Player) { return ColorSquare.colorSquare(color, this.size) }
}

export class GameRenderer {
    private cam: Camera;
    private ctx: CanvasRenderingContext2D;
    private textures: GameTextureSet;
    private boardConfig!: BoardConfiguration; // 'not undefined' assertion here because: https://github.com/microsoft/TypeScript/issues/36931

    public static readonly DEFAULT_BLOCK_SIZE_IN_PIXEL = 20;
    public static readonly DEFAULT_FOCUS_RATIO = 1/3;

    constructor(
        private canvas: HTMLCanvasElement,
        private canvasSize: Vector,
        private gameConfig: GameConfiguration,
        private myPlayerId: string,
        private blockSizeInPixel: number = GameRenderer.DEFAULT_BLOCK_SIZE_IN_PIXEL,
        private focusRatio: number = GameRenderer.DEFAULT_FOCUS_RATIO,
    ) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('couldn\'t get canvas context')
        this.ctx = ctx;
            
        this.textures = new ColorSquareTextures(this.blockSizeInPixel),
        this.cam = new Camera(new Vector(canvasSize.x, canvasSize.y), ctx);
    }

    updateGameConfiguration(g: GameConfiguration) {
        this.gameConfig = g;
    }

    updateBoardConfiguration(b: BoardConfiguration) {
        this.boardConfig = b;
    }

    updateCanvas(canvasSize: Vector, canvas?: HTMLCanvasElement) {
        this.canvas = canvas ?? this.canvas;
        this.canvasSize = canvasSize;

        this.cam = new Camera(new Vector(this.canvasSize.x, this.canvasSize.y), this.ctx);
    }

    canRender() {
        return this.boardConfig && this.gameConfig && this.canvas && this.canvasSize;
    }

    render = () => {
        if (!this.canRender()) throw new Error('can\'t render, you are doing something wrong')

        const myPlayer = this.getPlayerByID(this.myPlayerId);
        const focus = this.isActivePlayer(myPlayer.name)
            ? this.boardConfig.players.find(({ name }) => name === myPlayer.name)!.vectors[0]
            : new Vector(0, 0)
        console.log(focus, myPlayer)
        this.setupCamera(mul(focus, this.blockSizeInPixel))

        for (const pellet of this.boardConfig.pellets) {
            this.textures.pellet(pellet.type).draw(mul(pellet.vector, this.blockSizeInPixel), this.ctx)
        }

        for (const player of this.boardConfig.players) {
            this.drawPlayer(player);
        }

        console.log(this.gameConfig.solid)

        for (const v of this.gameConfig.solid) {
            this.textures.solid.draw(mul(v, this.blockSizeInPixel), this.ctx);
        }
    }

    private drawPlayer(playerPos: PlayerPositioning) {
        const pl = this.getPlayer(playerPos.name);
        if (!pl) throw new Error('can\'t draw non-existent player')
        for (let i = 0; i < playerPos.vectors.length; i++) {
            this.textures.player(pl, playerPos.vectors, i).draw(mul(playerPos.vectors[i], this.blockSizeInPixel), this.ctx);
        }
    }

    private isActivePlayer(oName: string): boolean {
        return !!this.boardConfig.players.find(({ name }) => oName === name);
    }

    private getPlayer(oName: string): Player {
        const player = this.gameConfig.players.find(({ name }) => oName === name)
        if (!player) throw new Error('no player with name found')
        return player;
    }

    private getPlayerByID(oId: string): Player {
        const player = this.gameConfig.players.find(({ id }) => oId === id)
        if (!player) throw new Error('no player with id found')
        return player;
    }

    private setupCamera(focus: IVector) {
        // if game fits within bounds, don't move camera at all, otherwise move camera.
        // camera position is set to players current location when the difference between active cam loc and player gets big
        // don't forget, you are moving the world, not the player, so the vector is inverted
        this.cam.init()
        this.cam.keepPointWithinAreaOfCameraWhileRespectingContextBoundaries(
            new Vector(focus.x, focus.y), new Vector(this.canvasSize.x * this.focusRatio, this.canvasSize.y * this.focusRatio), new Vector(0, 0), this.gameSize()
        )
    }

    private gameSize() {
        if (!this.gameConfig) throw new Error('no game config')
        return new Vector(this.blockSizeInPixel * this.gameConfig.size.x, this.blockSizeInPixel * this.gameConfig.size.y)
    }
}