import { ClientError, ClientUser, CommandRequest, CommandResponse, NeedRefreshAllStatesResponse } from "./Common";

export enum CardSuit {
    Hearts = 'Hearts',
    Diamonds = 'Diamonds',
    Clubs = 'Clubs',
    Spades = 'Spades',
}

export enum CardRank {
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
    Six = '6',
    Seven = '7',
    Eight = '8',
    Nine = '9',
    Ten = '10',
    Jack = 'J',
    Queen = 'Q',
    King = 'K',
    Ace = 'A',
}

export class Card {
    constructor(
        public suit: CardSuit,
        public rank: CardRank
    ) {}
}


export class ClientOtherUser {
    constructor(
        public readonly name: string,
        public readonly cardsInHandNum: number,
        public readonly currentBid: number,
        public readonly isReady: boolean,
    ) {}
}

export class ClientGameState {
    constructor(
        public readonly currentUser: ClientUser,
        public readonly users: ClientOtherUser[],
        public readonly cardsInHand: Card[],
        public readonly cardsOnTable: Card[],
        public readonly currentBid: number,
        public readonly isReady: boolean,
    ) {}
}

export enum ClientGameCommandKind {
    GameStateUpdate = "game_state_update",
    UpdateReady = "update_ready",
    StartGame = "start_game",
    Error = "error",
    LeaveGame = "leave_game",
    NeedRefreshAllStates = "need_refresh_all_states",
}

export namespace ClientGame {

    export interface UpdateReadyRequest extends CommandRequest<ClientGameCommandKind,boolean> {
        kind: ClientGameCommandKind.UpdateReady;
    }

    export interface LeaveGameRequest extends CommandRequest<ClientGameCommandKind,void> {
        kind: ClientGameCommandKind.LeaveGame;
    }

    export interface GameStateUpdateRequest extends CommandRequest<ClientGameCommandKind,void> {
        kind: ClientGameCommandKind.GameStateUpdate;
    }

    export interface GameStateUpdateResponse extends CommandResponse<ClientGameCommandKind,ClientGameState> {
        kind: ClientGameCommandKind.GameStateUpdate;
    }

    export interface LeaveGameResponse extends CommandResponse<ClientGameCommandKind,void> {
        kind: ClientGameCommandKind.LeaveGame;
    }

    export interface ErrorResponse extends CommandResponse<ClientGameCommandKind,ClientError> {
        kind: ClientGameCommandKind.Error;
    }

    export type RequestMap = {
        [ClientGameCommandKind.Error]: void;
        [ClientGameCommandKind.GameStateUpdate]: GameStateUpdateRequest;
        [ClientGameCommandKind.LeaveGame]: LeaveGameRequest;
        [ClientGameCommandKind.UpdateReady]: UpdateReadyRequest;
        [ClientGameCommandKind.NeedRefreshAllStates]: void;
      };

      export type ResponseMap = {
        [ClientGameCommandKind.Error]: ErrorResponse;
        [ClientGameCommandKind.GameStateUpdate]: GameStateUpdateResponse;
        [ClientGameCommandKind.LeaveGame]: LeaveGameResponse;
        [ClientGameCommandKind.UpdateReady]: GameStateUpdateResponse;
        [ClientGameCommandKind.NeedRefreshAllStates]: NeedRefreshAllStatesResponse;
      };
}
