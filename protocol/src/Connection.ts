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

type ReceiverSignature<L> = {
    [E in keyof L]: (...args: any[]) => any
}
type SenderSignature<L> = {
    [E in keyof L]: any[];
}

export class Channel<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends TypedEmitter<Receive> {
    private globalAck: number

    constructor(
        private name: string,
        private socket: Socket,
    ) {
        super();

        this.globalAck = Math.floor(Math.random() * 1000000) + 1 // don't start acks from the beginning; don't use 0 as ack since it has special meaning

        this.socket.on(this.name, <K extends keyof Receive>(json: string, callback: (response: any) => void) => {
            const { name, data, ack = 0 }: { name: K, data: any[], ack?: number } = JSON.parse(json) as { name: K, data: any[], ack: number };
            // currently not using ack numbers, but they are still in the makeshift protocol (may swap socket.io with something else later)

            let tmp = [...data, (response: any[]) => {
                if (ack !== 0) {
                    callback(response)
                }
                // else, nop
            }]

            const retData = tmp as Parameters<Receive[K]>
            this.emit(name, ...retData);
        })
    }

    send<K extends keyof Send>(name: K, ...data: Send[K]): void {
        if (typeof data[data.length - 1] === 'function') { // we wait for ack
            const ack = this.globalAck++;
            
            this.socket.emit(this.name, JSON.stringify({
                name,
                data: data.slice(0, -1),
                ack
            }), (response: any) => {
                data[data.length - 1](response)
            })
            return
        }
        
        this.socket.emit(this.name, JSON.stringify({
            name,
            data,
            ack: 0
        }))
    }

    async sendAndWait<K extends keyof Send>(name: K, ...data: Send[K]): Promise<any> {
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
        this.send = async () => {}
    }
}