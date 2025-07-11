import { ClientError, ClientUser, CommandRequest, CommandResponse, NeedRefreshAllStatesResponse } from "./Common";

export enum GameAction {
    Bet = "Bet",
    Raise = "Raise",
    Check = "Check",
    Call = "Call",
    Fold = "Fold"
}

export interface GameActionAmount {
    action: GameAction;
    amount: number;
}

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
        public readonly currentBet: number,
    ) {}
}

export class ClientGameState {
    constructor(
        public readonly currentUser: ClientUser,
        public readonly users: ClientOtherUser[],
        public readonly cardsInHand: Card[],
        public readonly cardsOnTable: Card[],
        public readonly currentBet: number,
        public readonly allowedActions: GameAction[]
    ) {}
}

export class ClientUserRegister {
    constructor(
        public readonly uniqueId: string,
        public readonly name: string,
        public readonly avatarUrl: string,
    ) {}
}

export enum ClientGameCommandKind {
    RegisterUser = "register_user",
    GameStateUpdate = "game_state_update",
    ConnectToGame = "connect_to_game",
    Error = "error",
    LeaveGame = "leave_game",
    NeedRefreshAllStates = "need_refresh_all_states",
    GameAction = "game_action",
    StartGame = "start_game",
}

export namespace ClientGame {


    export interface StartGameRequest extends CommandRequest<ClientGameCommandKind,void> {
        kind: ClientGameCommandKind.StartGame;
    }

    export interface GameActionRequest extends CommandRequest<ClientGameCommandKind,GameActionAmount> {
        kind: ClientGameCommandKind.GameAction;
    }

    export interface ConnectToGameRequest extends CommandRequest<ClientGameCommandKind,ClientGameState> {
        kind: ClientGameCommandKind.ConnectToGame;
    }

    export interface RegisterUserRequest extends CommandRequest<ClientGameCommandKind,ClientUserRegister> {
        kind: ClientGameCommandKind.RegisterUser;
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
        [ClientGameCommandKind.NeedRefreshAllStates]: void;
        [ClientGameCommandKind.RegisterUser]: RegisterUserRequest;
        [ClientGameCommandKind.ConnectToGame]: ConnectToGameRequest;
        [ClientGameCommandKind.GameAction]: GameActionRequest;
        [ClientGameCommandKind.StartGame]: StartGameRequest;
      };

      export type ResponseMap = {
        [ClientGameCommandKind.Error]: ErrorResponse;
        [ClientGameCommandKind.GameStateUpdate]: GameStateUpdateResponse;
        [ClientGameCommandKind.LeaveGame]: LeaveGameResponse;
        [ClientGameCommandKind.NeedRefreshAllStates]: NeedRefreshAllStatesResponse;
        [ClientGameCommandKind.RegisterUser]: GameStateUpdateResponse;
        [ClientGameCommandKind.ConnectToGame]: GameStateUpdateResponse;
        [ClientGameCommandKind.GameAction]: GameStateUpdateResponse;
        [ClientGameCommandKind.StartGame]: GameStateUpdateResponse;
      };
}
