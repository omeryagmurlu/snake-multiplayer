import { createServer, Server as HTTPServer } from 'http';
import { Server as IO } from 'socket.io';
import { TypedEmitter } from 'tiny-typed-emitter';

import { Connection } from './Connection';

interface ConnectionManagerEvents {
    connect: (connection: Connection) => void
}

const PORT = 3000

export class ConnectionManager extends TypedEmitter<ConnectionManagerEvents> {
    private connectedList: Connection[] = []
    private server: HTTPServer
    private io: IO;

    constructor() {
        super()
        
        this.server = createServer();
        const io = this.io = new IO(this.server)

        io.on('connection', async socket => {
            const connection = new Connection(socket)
            if (await connection.verify()) {
                this.connectedList.push(connection)
                connection.on('disconnect', () => this.connectedList = this.connectedList.filter(x => x !== connection))
                this.emit('connect', connection)
            }
        })
    }

    listen() {
        this.server.listen(PORT)
    }
}