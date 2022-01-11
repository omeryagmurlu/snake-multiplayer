import { Channel, ChannelArray, ReceiverSignature, SenderSignature } from "protocol";
import { TypedEmitter } from "tiny-typed-emitter";

interface ChannelManagerEvents<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> {
    left: (channel: Channel<Send, Receive>) => void
}

export class ChannelManager<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>> extends TypedEmitter<ChannelManagerEvents<Send, Receive>> {
    private channels = new ChannelArray<Send, Receive>()

    public manage(channel: Channel<Send, Receive>): Channel<Send, Receive> {
        this.channels.push(channel);

        channel.onDisconnect(() => {
            this.remove(channel)
        })

        // channel.onLeave(() => { // need to implement onLeave first
        //     this.left(channel)
        // })

        return channel;
    }

    public broadcast(name: keyof Send, ...data: Parameters<Send[keyof Send]>) {
        return this.channels.broadcast(name, ...data);
    }

    public remove(channel: Channel<Send, Receive>) {
        this.channels.remove(channel);
        // channel.destroy(); // need to test this first
        this.emit('left', channel)
    }
}