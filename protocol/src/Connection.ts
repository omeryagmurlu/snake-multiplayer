import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { TypedEmitter } from "tiny-typed-emitter";

type Socket = ServerSocket | ClientSocket

interface ConnectionEvents {
    disconnect: () => void
}

type ChannelListSignature<L extends Record<string, [any, any]>> = {
    [E in keyof L]: [SenderSignature<L[E][0]>, ReceiverSignature<L[E][1]>]
}

export class Connection<Channels extends ChannelListSignature<Channels>> extends TypedEmitter<ConnectionEvents> {
    constructor(
        private socket: Socket
    ) {
        super()

        this.socket.on('disconnect', () => {
            this.emit('disconnect')
        })
    }

    getId() {
        return this.socket.id
    }
    
    async verify() {
        // TODO: verify protocol
        return true;
    }

    // this is not ideal (keyof Channels not checking whether send and receive belong to them) but this is the cost isomorphic TS
    // this is correct but too verbose: (see: https://github.com/microsoft/TypeScript/issues/10571)
    // createChannel<Send extends Channels[K][0] | Channels[K][1], Receive extends Channels[K][0] | Channels[K][1], K extends keyof Channels>(name: K): Channel<Send, Receive> {
    createChannel<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>>(name: keyof Channels): Channel<Send, Receive> {
        return new Channel<Send, Receive>(name as string, this.socket);
    }
}
// params are what we receive, return is what we send back (ack) (only via callback),
// eg. .on(KEY, (...PARAMS<Receive[KEY]>, cb: (response: RETURN<Receive[KEY]>) => void) => void), see the type in TypedEmitter<.....> for what type is 'on'
export type ReceiverSignature<L> = {
    [E in keyof L]: (...args: any[]) => any
}
// params are what we send, return is what receive back (ack) (only via promise)
export type SenderSignature<L> = {
    [E in keyof L]: (...args: any[]) => any
}

type Helper<L extends ReceiverSignature<L>> = {
    [E in keyof L]: (...args: [...Parameters<L[E]>, (response: ReturnType<L[E]>) => void]) => void
}

export class Channel<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends TypedEmitter<Helper<Receive>> {
    private globalAck: number
    private disFn: () => void = () => {}

    constructor(
        private name: string,
        private socket: Socket,
    ) {
        super();

        this.globalAck = Math.floor(Math.random() * 1000000) + 1 // don't start acks from the beginning; don't use 0 as ack since it has special meaning

        // K is message name (key), Receive[K] params are what we receive, Receive[K] return is what we send back (only via callback)
        this.socket.on(this.name, this.onSocket)
        this.socket.on('disconnect', this.onSocketDisconnect)
    }

    private onSocket = <K extends keyof Receive>(json: string, callback: (response: string) => void) => {
        // currently not using ack numbers, but they are still in the makeshift protocol (may swap socket.io with something else later)
        const {
            name, data, ack = 0
        } = JSON.parse(json) as {
            name: K, data: Parameters<Receive[K]>, ack?: number
        };

        let tmp = [...data, (response: ReturnType<Receive[K]>) => {
            if (ack !== 0) {
                callback(JSON.stringify(response))
            }
            // else, nop
        }] as Parameters<Helper<Receive>[K]>

        const retData = tmp;
        this.emit(name, ...retData);
    }

    private onSocketDisconnect = () => {
        this.disFn()
        this.destroy()
    }

    async send<K extends keyof Send>(name: K, ...data: Parameters<Send[K]>): Promise<ReturnType<Send[K]>> {
        return new Promise((res, rej) => {
            const ack = this.globalAck++;
            
            this.socket.emit(this.name, JSON.stringify({
                name,
                data,
                ack
            }), (response: string) => {
                res(JSON.parse(response))
            })
        })
    }

    destroy() {
        if (!this.socket) return;
        console.log(`destroy ${this.name}`);
        this.socket.removeListener(this.name, this.onSocket)
        this.socket.removeListener('disconnect', this.onSocketDisconnect)
        this.socket = undefined as unknown as Socket; // wtf? why
        this.send = (): Promise<any> => { throw new Error("this shouldn't have come here, channel is already closed") }
    }

    onDisconnect(fn = () => {}) {
        this.disFn = fn
    }
}

export class ChannelArray<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends Array<Channel<Send, Receive>> {
    broadcast<K extends keyof Send>(name: K, ...data: Parameters<Send[K]>) {
        for (const ch of this) {
            ch.send(name, ...data);
        }
    }

    remove(channel: Channel<Send, Receive>) {
        const index = this.indexOf(channel);
        if (index !== -1) {
            this.splice(index, 1);
        }
    }
}