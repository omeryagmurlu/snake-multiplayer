import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { TypedEmitter } from "tiny-typed-emitter";

type Socket = ServerSocket | ClientSocket

interface ConnectionEvents {
    disconnect: () => void
}

export class Connection extends TypedEmitter<ConnectionEvents> {
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

    createChannel<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>>(name: string): Channel<Send, Receive> {
        return new Channel<Send, Receive>(name, this.socket);
    }
}
// params are what we receive, return is what we send back (ack) (only via callback),
// eg. .on(KEY, (...PARAMS<Receive[KEY]>, cb: (response: RETURN<Receive[KEY]>) => void) => void), see the type in TypedEmitter<.....> for what type is 'on'
type ReceiverSignature<L> = {
    [E in keyof L]: (...args: any[]) => any
}
// params are what we send, return is what receive back (ack) (only via promise)
type SenderSignature<L> = {
    [E in keyof L]: (...args: any[]) => any
}

type Helper<L extends ReceiverSignature<L>> = {
    [E in keyof L]: (...args: [...Parameters<L[E]>, (response: ReturnType<L[E]>) => void]) => void
}

export class Channel<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends TypedEmitter<Helper<Receive>> {
    private globalAck: number

    constructor(
        private name: string,
        private socket: Socket,
    ) {
        super();

        this.globalAck = Math.floor(Math.random() * 1000000) + 1 // don't start acks from the beginning; don't use 0 as ack since it has special meaning

        // K is message name (key), Receive[K] params are what we receive, Receive[K] return is what we send back (only via callback)
        this.socket.on(this.name, <K extends keyof Receive>(json: string, callback: (response: ReturnType<Receive[K]>) => void) => {
            // currently not using ack numbers, but they are still in the makeshift protocol (may swap socket.io with something else later)
            const {
                name, data, ack = 0
            } = JSON.parse(json) as {
                name: K, data: Parameters<Receive[K]>, ack?: number
            };

            let tmp = [...data, (response: ReturnType<Receive[K]>) => {
                if (ack !== 0) {
                    callback(response)
                }
                // else, nop
            }] as Parameters<Helper<Receive>[K]>

            const retData = tmp;
            this.emit(name, ...retData);
        })
    }

    async send<K extends keyof Send>(name: K, ...data: Parameters<Send[K]>): Promise<ReturnType<Send[K]>> {
        return new Promise((res, rej) => {
            const ack = this.globalAck++;
            
            this.socket.emit(this.name, JSON.stringify({
                name,
                data,
                ack
            }), (response: any) => {
                res(response)
            })
        })
    }

    destroy() {
        this.socket.removeAllListeners(this.name)
        this.socket = undefined as unknown as Socket; // wtf? why
        this.send = (): Promise<any> => { throw new Error("this shouldn't have come here, channel is already closed") }
    }
}

export class ChannelArray<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends Array<Channel<Send, Receive>> {
    broadcast<K extends keyof Send>(name: K, ...data: Parameters<Send[K]>) {
        for (const ch of this) {
            ch.send(name, ...data);
        }
    }
}