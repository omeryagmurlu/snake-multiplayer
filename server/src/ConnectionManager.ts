import { createServer, Server as HTTPServer } from 'http';
import { Server as IO } from 'socket.io';
import { TypedEmitter } from 'tiny-typed-emitter';

import { Connection } from 'protocol';
import { trace } from './utils/Logger';

interface ConnectionManagerEvents<T extends Record<string, [any, any]>> {
    connect: (connection: Connection<T>) => void
}

const PORT = 3000

export class ConnectionManager<T extends Record<string, [any, any]>> extends TypedEmitter<ConnectionManagerEvents<T>> {
    private server: HTTPServer

    constructor() {
        super()
        
        this.server = createServer();
        const io = new IO(this.server, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"]
            }
          })

        io.on('connection', async socket => {
            const connection = new Connection(socket)
            if (await connection.verify()) {
                this.emit('connect', connection)
            }
        })
    }

    listen() {
        trace('LISTENING: ' + PORT)
        this.server.listen(PORT)
        // this.server.listen(PORT, '::')
    }
}
