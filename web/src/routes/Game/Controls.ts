import { Direction } from "protocol/dist/interfaces/Game"
import TinyGesture from 'tinygesture';

export enum ControlTypes {
    Keyboard = "KEYBOARD",
    Swipe = "SWIPE",
    Sensor = "SENSOR"
}

export abstract class GameControls {
    protected dirCb: (dir: Direction) => void = () => {}

    onDirection(cb: (dir: Direction) => void) {
        this.dirCb = cb;
    }

    abstract init(canvas: HTMLCanvasElement): void
    abstract destroy(): void

    static get(c: ControlTypes): GameControls {
        switch (c) {
            case ControlTypes.Keyboard: return new Keyboard()
            case ControlTypes.Swipe: return new Swipe()
            case ControlTypes.Sensor: return new Sensor()
        }
    }
}

class Keyboard extends GameControls {
    destroy(): void {
        document.removeEventListener('keydown', this.handler);
    }
    init(): void {
        document.addEventListener('keydown', this.handler);
    }
    handler = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp': return this.dirCb(Direction.Up);

            case 'KeyS':
            case 'ArrowDown': return this.dirCb(Direction.Down);

            case 'KeyA':
            case 'ArrowLeft': return this.dirCb(Direction.Left);

            case 'KeyD':
            case 'ArrowRight': return this.dirCb(Direction.Right);
        }
    }
}

class Swipe extends GameControls {
    gesture: any;

    destroy(): void {
        this.gesture?.destroy()
    }
    init(c: HTMLCanvasElement): void {
        this.gesture = new TinyGesture(c, {

        })
        this.gesture.on('swipeup', () => this.dirCb(Direction.Up));
        this.gesture.on('swipedown', () => this.dirCb(Direction.Down));
        this.gesture.on('swipeleft', () => this.dirCb(Direction.Left));
        this.gesture.on('swiperight', () => this.dirCb(Direction.Right));
    }
}

class Sensor extends GameControls {
    private inBeta: number | undefined = undefined
    private inGamma: number | undefined = undefined
    destroy(): void {
        window.removeEventListener('deviceorientation', this.handler);
    }
    init(): void {
        window.addEventListener('deviceorientation', this.handler);
    }
     
    handler = ({ alpha, gamma, beta }: DeviceOrientationEvent) => {
        if (beta === null || gamma === null) throw new Error('sensor bad')
        if (typeof this.inBeta === 'undefined' || typeof this.inGamma === 'undefined') {
            this.inBeta = beta;
            this.inGamma = gamma;
            return
        }

        const norBeta = beta - this.inBeta;
        const norGamma = gamma - this.inGamma;

        if (Math.abs(norBeta) > 30) {
            switch(Math.sign(norBeta)) {
                case 1: return this.dirCb(Direction.Down)
                case -1: return this.dirCb(Direction.Up)
            }
        } else if (Math.abs(norGamma) > 30) {
            switch(Math.sign(norGamma)) {
                case 1: return this.dirCb(Direction.Right)
                case -1: return this.dirCb(Direction.Left)
            }
        }
    }
}