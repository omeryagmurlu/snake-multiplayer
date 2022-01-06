import { Connection } from "./Connection";
import { ConnectionManager } from "./ConnectionManager";
import { RoomManager } from "./RoomManager";

type Send = {};
type Receive = {};

export class App {
    private rooms = new RoomManager()

    constructor(
        private connections: ConnectionManager,
    ) {
        this.connections.on('connect', this.handleNewConnections)
    }

    handleNewConnections = (connection: Connection) => {
        this.rooms.handleConnection(connection);
    }
}