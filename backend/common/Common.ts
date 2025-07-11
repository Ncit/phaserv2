
export class ClientUser {
    uniqueId: string;
    name: string;
    balance: number;
    avatarUrl: string;
    constructor(uniqueId: string, name: string, balance: number, avatarUrl: string) {
        this.uniqueId = uniqueId;
        this.name = name;
        this.balance = balance;
        this.avatarUrl = avatarUrl;
    }
}

export class ClientError {
    message: string;
    constructor(message: string) {
        this.message = message;
    }
}

export interface CommandRequest<K, T = void> {
    kind: K;
    data: T;
}

export interface CommandResponse<K, T> {
    kind: K;
    data: T;
}

export const NeedRefreshAllStatesKindConst = "need_refresh_all_states";

export class NeedRefreshAllStatesResponse {
    kind: typeof NeedRefreshAllStatesKindConst; 
    constructor() {
        this.kind = NeedRefreshAllStatesKindConst;
    }
}
