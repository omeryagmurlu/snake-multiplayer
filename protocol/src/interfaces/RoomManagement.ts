import { Vector } from "./Game";

export interface ServerSend {
    state: (state: RoomState[]) => void
}

export interface ClientSend {
    newRoom: (registration: RoomRegistration) => string | undefined,
    joinRoom: (id: string) => boolean,
    getRoomStates: () => RoomState[],
}

export interface RoomRegistration {
    name: string,
    count: number,
    size: Vector
}

export interface RoomState {
    current: number,
    max: number,
    name: string,
    id: string
}