export interface ServerSend {
    state: (state: RoomState[]) => void
}

export interface ClientSend {
    newRoom: (name: string, playersCount: number) => string | undefined,
    joinRoom: (id: string) => boolean,
    getRoomStates: () => RoomState[],
}

export interface RoomState {
    current: number,
    max: number,
    name: string,
    id: string
}