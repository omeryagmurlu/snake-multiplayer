export interface ServerSend {
    startingIn: (n: number) => void
    starting: () => void
    state: (state: DetailedRoomState) => void
}

export interface ClientSend {
    register: (pName: string, color: string) => boolean
    leave: () => void
    ready: (ready: boolean) => void,
    getState: () => DetailedRoomState;
}

export interface Player {
    name: string,
    color: string,
    ready: boolean
};

export interface DetailedRoomState {
    id: string,
    current: number,
    name: string,
    max: number,
    players: Player[],
    ingame: boolean
}