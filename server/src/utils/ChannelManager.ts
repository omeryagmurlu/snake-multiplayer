import { Channel, ChannelArray, ReceiverSignature, SenderSignature } from "protocol";
import { TypedEmitter } from "tiny-typed-emitter";

interface ChannelManagerEvents<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>, Id> {
    left: (channel: Channel<Send, Receive>, identifier: Id) => void
}

export class ChannelManager<Send extends SenderSignature<Send>, Receive extends ReceiverSignature<Receive>, Id = void> extends TypedEmitter<ChannelManagerEvents<Send, Receive, Id>> {
    private channels = new ChannelArray<Send, Receive>()
    private identifiers: WeakMap<Channel<Send, Receive>, Id> = new WeakMap();

    public manage(channel: Channel<Send, Receive>, identifier: Id): Channel<Send, Receive> {
        this.channels.push(channel);
        this.identifiers.set(channel, identifier);

        channel.onDisconnect(() => {
            this.remove(channel)
        })

        return channel;
    }

    public broadcast(name: keyof Send, ...data: Parameters<Send[keyof Send]>) {
        return this.channels.broadcast(name, ...data);
    }

    public remove(channel: Channel<Send, Receive>) {
        this.channels.remove(channel);
        channel.destroy();

        // believe me this is okay (see Id = undefined at top as the generic default/if not default, top already fixes this problem);
        const id = this.identifiers.get(channel) as Id;

        this.emit('left', channel, id);
    }
}