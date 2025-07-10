export enum UserState {
    InLobby = "in_lobby",
    InGame = "in_game",
}

export class ClientUser {
    uniqueId: string;
    name: string;
    constructor(uniqueId: string, name: string) {
        this.uniqueId = uniqueId;
        this.name = name;
    }
}

export class ClientError {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

export interface CommandRequest<K, T = void> {
    userUniqueId: string;
    kind: K;
    data: T;
}

export interface CommandResponse<K, T> {
    kind: K;
    data: T;
    userState: UserState;
}

export const NeedRefreshAllStatesKindConst = "need_refresh_all_states";

export class NeedRefreshAllStatesResponse {
    kind: typeof NeedRefreshAllStatesKindConst; 
    userState: UserState;
    constructor(userState: UserState) {
        this.kind = NeedRefreshAllStatesKindConst;
        this.userState = userState;
    }
}
