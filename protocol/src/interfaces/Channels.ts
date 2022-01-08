import { ServerSend as RoomServer, ClientSend as RoomClient } from "./Room";
import { ServerSend as RoomManagementServer, ClientSend as RoomManagementClient } from "./RoomManagement";
import { ServerSend as GameServer, ClientSend as GameClient } from "./Game";

export interface Channels extends Record<string, [any, any]> {
    "room-joined": [RoomServer, RoomClient]
    "room-management": [RoomManagementServer, RoomManagementClient],
    "game": [GameServer, GameClient],
}