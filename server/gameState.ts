import { Card, GameAction } from "@/common/Game";
import { CardDeck } from "./cardDeck";
import { userStorage } from "./userStorage";

export interface UserNotificator {
    needRefreshAllStates(): void;
}



export interface UserState {
    uniqueId: string;
    name: string;
    hand: Card[];
    currentBet: number;
    userNotificator: UserNotificator;
    allowedActions: GameAction[];
}

export enum GameStateKind {
    WaitingForStart = "WaitingForStart",
    Deal = "Deal",
    PreFlop = "PreFlop",
    Flop = "Flop",
    Turn = "Turn",
    River = "River",
    Showdown = "Showdown"
}

export class BettingRound {
    startUserIdx: number = -1;
    currentUserIdx: number = -1;
    isCreatedBet: boolean = false;
}

export class GameState {
    private state: GameStateKind = GameStateKind.WaitingForStart;
    private users: UserState[] = [];
    private deck: CardDeck = new CardDeck();
    private cardsOnTable: Card[] = [];
    private currentUserButtonIdx: number = -1;
    private currentBet: number = 0;
    private bettingRound: BettingRound = new BettingRound();

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

    getCurrentBank(): number {
        return this.users.reduce((sum, user) => sum + user.currentBet, 0);
    }

    addUser(user: UserState) {
        if (this.users.find(userOnTable => userOnTable.uniqueId === user.uniqueId)) {
            throw new Error("User already in game");
        }
        this.users.push(user);
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }

    removeUser(uniqueId: string) {
        this.users = this.users.filter(user => user.uniqueId !== uniqueId);
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }

    makeBet(uniqueId: string, amount: number) {
        const user = this.users.find(u => u.uniqueId === uniqueId);
        if (user === undefined) {
            throw new Error("User not found");
        }
        if (amount < this.currentBet) {
            throw new Error("Bet is less than current bet");
        }
        user.currentBet += amount;
        userStorage.balanceSubForUniqueId(uniqueId, amount);
        this.currentBet = amount;
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }

    callNextStage() {
        if(this.state === GameStateKind.WaitingForStart) {
            this.state = GameStateKind.Deal;
        }

        if (this.state === GameStateKind.Deal) {
            this.users.forEach(user => {
                user.hand = this.deck.drawCards(2);
            });
            this.startBettingRound(GameStateKind.PreFlop)
        }else if (this.state === GameStateKind.PreFlop) {
            this.cardsOnTable.push(...this.deck.drawCards(3));
            this.startBettingRound(GameStateKind.Flop)
        }else if (this.state === GameStateKind.Flop) {
            this.cardsOnTable.push(...this.deck.drawCards(1));
            this.startBettingRound(GameStateKind.Turn)
        }else if (this.state === GameStateKind.Turn) {
            this.cardsOnTable.push(...this.deck.drawCards(1));
            this.startBettingRound(GameStateKind.River)
        }else if (this.state === GameStateKind.River) {
            
        }
    }


    updateAllowedActions() {
        this.users.forEach(user => user.allowedActions = []);
        const currentUserIdx = (this.bettingRound.startUserIdx + this.bettingRound.currentUserIdx) % this.users.length;
        this.users[currentUserIdx].allowedActions = [GameAction.Bet, GameAction.Check];
    }
    
    startBettingRound(state: GameStateKind) {
        this.state = state;
        this.bettingRound.startUserIdx = (this.currentUserButtonIdx + 1) % this.users.length;
        this.bettingRound.currentUserIdx = 0
        this.bettingRound.isCreatedBet = false;
        this.updateAllowedActions();
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }

    onGameAction(uniqueId: string, action: GameAction, amount: number) {
        const user = this.users.find(u => u.uniqueId === uniqueId);
        if (user === undefined) {
            throw new Error("User not found");
        }
        if (!user.allowedActions.includes(action)) {
            throw new Error("User is not allowed to perform this action");
        }

        if (action === GameAction.Call) {
            this.makeBet(uniqueId, this.currentBet - user.currentBet);
            this.bettingRound.isCreatedBet = true;
        }

        if (action === GameAction.Bet) {
            this.makeBet(uniqueId, amount);
            this.bettingRound.isCreatedBet = true;
        }

        if (action === GameAction.Raise) {
            this.makeBet(uniqueId, amount);
            this.bettingRound.isCreatedBet = true;
        }

        if (action === GameAction.Fold) {
            throw new Error("Fold is not allowed - not implementd");
        }

        if (action === GameAction.Check) {
            if(this.bettingRound.isCreatedBet) {
                throw new Error("Check is not allowed - bet is already created");
            } else {
            }
        }

        this.bettingRound.currentUserIdx++;
        if (this.bettingRound.currentUserIdx >= this.users.length) {
            this.callNextStage();
        }
        this.updateAllowedActions();
        this.users.forEach(user => user.userNotificator.needRefreshAllStates());
    }
}

// Example of initializing a game state
export const createInitialGameState = (): GameState => {
    return new GameState();
};
