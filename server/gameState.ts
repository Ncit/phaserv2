import { Card } from "@/common/Game";
import { CardDeck } from "./cardDeck";

export interface UserNotificator {
    needRefreshAllStates(): void;
}

export interface UserState {
    isReady: boolean;
    uniqueId: string;
    hand: Card[];
    currentBid: number;
    userNotificator: UserNotificator;
}

export enum GameStateKind {
    WaitingForPlayers = "WaitingForPlayers",
    Playing = "Playing"
}

export class GameState {

    private state: GameStateKind = GameStateKind.WaitingForPlayers;
    private users: UserState[] = [];
    private deck: CardDeck = new CardDeck();
    private cardsOnTable: Card[] = [];

    updateUserReady(uniqueId: string, isReady: boolean): void {
        const user = this.users.find(user => user.uniqueId === uniqueId);
        if (user) {
            user.isReady = isReady;
            this.users.forEach(user => user.userNotificator.needRefreshAllStates());
        }else {
            throw new Error("User invalid");
        }
    }

    getState(): GameStateKind {
        return this.state;
    }

    getUsers(): UserState[] {
        return this.users;
    }

    getDeck(): CardDeck {
        return this.deck;
    }

    getCardsOnTable(): Card[] {
        return this.cardsOnTable;
    }

    getCurrentBid(): number {
        return this.users.reduce((maxBid, user) => Math.max(maxBid, user.currentBid), 0);
    }

    addUser(user: UserState) {
        this.users.push(user);
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }

    removeUser(uniqueId: string) {
        this.users = this.users.filter(user => user.uniqueId !== uniqueId);
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }
}

// Example of initializing a game state
export const createInitialGameState = (): GameState => {
    return new GameState();
};
