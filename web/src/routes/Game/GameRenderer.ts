import { Vector } from "protocol/dist/classes/Game";
import type { BoardConfiguration, GameConfiguration, PelletType, Pixel, Player, PlayerPositioning, Vector as IVector } from "protocol/dist/interfaces/Game";
import { Camera } from "./Camera";
import { BeveledColorSquare, ColorSquare, Texture } from "./Texture";

export interface GameTextureSet {
    solid: Texture,
    pellet: (pType: PelletType) => Texture,
    player: (player: Player, positioning: Pixel[], positionIndex: number) => Texture
}

const mul = (v: IVector, n: number) => new Vector(v.x * n, v.y * n);

class ColorSquareTextures implements GameTextureSet {
    public solid: ColorSquare;
    constructor(private size: number) {
        this.solid = ColorSquare.colorSquare('rgba(0, 0, 0, 0.5)', size)
    }
    public pellet({ color }: PelletType) { return ColorSquare.colorSquare(color, this.size) }
    public player({ color }: Player) { return BeveledColorSquare.colorSquare(color, this.size) }
}

const ACCENT = '#9bbc0f';

export class GameRenderer {
    private ctx: CanvasRenderingContext2D;
    private textures: GameTextureSet;
    public static readonly DEFAULT_BLOCK_SIZE_IN_PIXEL = 18;
    public static readonly DEFAULT_FOCUS_RATIO = 1/3;
    
    constructor(
        private canvas: HTMLCanvasElement,
        private canvasSize: Vector,
        private gameConfig: GameConfiguration,
        private boardConfig: BoardConfiguration,
        private myPlayerId: string,
        private blockSizeInPixel: number = GameRenderer.DEFAULT_BLOCK_SIZE_IN_PIXEL,
        private focusRatio: number = GameRenderer.DEFAULT_FOCUS_RATIO,
    ) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('couldn\'t get canvas context')
        this.ctx = ctx;
            
        this.textures = new ColorSquareTextures(this.blockSizeInPixel);
    }

    canRender() {
        return this.boardConfig && this.gameConfig && this.canvas && this.canvasSize;
    }

    render = () => {
        if (!this.canRender()) {
            console.log(this.boardConfig, this.gameConfig, this.canvas, this.canvasSize)
            throw new Error('can\'t render, you are doing something wrong')
        }

        const myPlayer = this.getPlayerByID(this.myPlayerId);
        const focus = this.isActivePlayer(myPlayer.name)
            ? this.boardConfig.players.find(({ name }) => name === myPlayer.name)!.vectors[0]
            : new Vector(0, 0)
        this.setupCamera(mul(focus, this.blockSizeInPixel))

        this.ctx.fillStyle = ACCENT;
        this.ctx.fillRect(0, 0, this.gameSize().x, this.gameSize().y)

        for (const pellet of this.boardConfig.pellets) {
            this.textures.pellet(pellet.type).draw(mul(pellet.vector, this.blockSizeInPixel), this.ctx)
        }

        for (const player of this.boardConfig.players) {
            this.drawPlayer(player);
        }

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
        const cam = new Camera(this.canvasSize, this.gameSize(), new Vector(0, 0), this.ctx);
        cam.centered(focus);
        cam.apply()
    }

    private gameSize() {
        if (!this.gameConfig) throw new Error('no game config')
        return new Vector(this.blockSizeInPixel * this.gameConfig.size.x, this.blockSizeInPixel * this.gameConfig.size.y)
    }
}