import { trace } from "./utils/Logger";
import { Connection } from "protocol";
import { Channels } from "protocol/dist/interfaces/Channels";
import { ConnectionManager } from "./ConnectionManager";
import { RoomManager } from "./RoomManager";

export class App {
    private rooms = new RoomManager()

    constructor(
        private connections: ConnectionManager<Channels>,
    ) {
        this.connections.on('connect', this.handleNewConnections)
    }

    handleNewConnections = (connection: Connection<Channels>) => {
        trace(`new connection: ${connection.getId()}`)
        this.rooms.handleConnection(connection);
    }
}