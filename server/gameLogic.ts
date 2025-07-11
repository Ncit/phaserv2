import { ClientGame, ClientGameCommandKind, ClientUserRegister, GameActionAmount } from "@/common/Game";
import { User, userStorage } from "./userStorage";
import { NeedRefreshAllStatesResponse } from "@/common/Common";
import { createInitialGameState, GameStateKind, UserNotificator } from "./gameState";
import _ from "lodash";

const gameState = createInitialGameState();

export default {
    processMessage: (message: any, connectionId: string, user: User, userNotificator: UserNotificator) => {
        console.log("processMessage called", { message, connectionId });

        if (user.isAnonymous) {
            if (message.kind === ClientGameCommandKind.RegisterUser) {
                return registerUser(connectionId, message.data);
            } else {
                throw new Error("User is anonymous");
            }
        } else {
            const kind = message.kind as ClientGameCommandKind
            switch (kind) {
                case ClientGameCommandKind.LeaveGame:
                    return leaveGame(connectionId);
                case ClientGameCommandKind.GameStateUpdate:
                    return gameStateUpdate(connectionId);
                case ClientGameCommandKind.ConnectToGame:
                    return connectToGame(connectionId, userNotificator);
                case ClientGameCommandKind.GameAction:
                    return gameAction(connectionId, message.data);
                case ClientGameCommandKind.StartGame:
                    return startGame(connectionId);
            }
        }
    },
    gameStateUpdate,
    addUserToGame
}

function leaveGame(connectionId: string) {
    console.log("leaveGame called", { connectionId });
    gameState.removeUser(userStorage.getUniqueId(connectionId));
    return gameStateUpdate(connectionId);
}

function addUserToGame(connectionId: string, userNotificator: UserNotificator): NeedRefreshAllStatesResponse {
    console.log("addUserToGame called", { connectionId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }

    if (gameState.getUsers().find(inGameUser => inGameUser.uniqueId === user.uniqueId)) {
        throw new Error("User already in game");
    }

    gameState.addUser({
        uniqueId: user.uniqueId,
        name: user.name,
        hand: [],
        currentBet: 0,
        userNotificator: userNotificator,
        allowedActions: []
    });
    return new NeedRefreshAllStatesResponse();
}

function gameStateUpdate(connectionId: string): ClientGame.GameStateUpdateResponse {
    console.log("gameStateUpdate called", { connectionId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }

    const users = gameState.getUsers()

    // сортируем пользователей что бы они были в порядке их хода
    const userIndex = _.findIndex(users, u => u.uniqueId === user.uniqueId);
    let before: typeof users = [];
    let after: typeof users = [];

    if (userIndex === -1) {
        return {
            kind: ClientGameCommandKind.GameStateUpdate,
            data: {
                currentUser: user,
                users: [],
                cardsInHand: [],
                cardsOnTable: [],
                currentBet: 0,
                allowedActions: []
            }
        };
    } else {
        before = users.slice(0, userIndex);
        after = users.slice(userIndex+1);
    }

    const rotatedUsers = after.concat(before);

    return {
        kind: ClientGameCommandKind.GameStateUpdate,
        data: {
            currentUser: user,
            users: rotatedUsers.map(userInGame => ({
                name: userInGame.name,
                cardsInHandNum: userInGame.hand.length,
                currentBet: userInGame.currentBet,
            })),
            cardsInHand: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.hand ?? [],
            cardsOnTable: gameState.getCardsOnTable(),
            currentBet: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.currentBet ?? 0,
            allowedActions: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.allowedActions ?? []
        }
    }
}
function registerUser(connectionId: string, data: ClientUserRegister) {
    console.log("registerUser called", { connectionId, data });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    userStorage.registerUser(connectionId, data);
    return gameStateUpdate(connectionId);
}

function connectToGame(connectionId: string, userNotificator: UserNotificator) {
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    gameState.addUser({
        uniqueId: user.uniqueId,
        name: user.name,
        hand: [],
        currentBet: 0,
        userNotificator: userNotificator,
        allowedActions: []
    });
    return gameStateUpdate(connectionId);
}

function gameAction(connectionId: string, data: GameActionAmount) {
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    gameState.onGameAction(user.uniqueId, data.action, data.amount);
    return gameStateUpdate(connectionId);
}

function startGame(connectionId: string) {
    const user = userStorage.getUser(connectionId)  
    if (user === undefined) {
        throw new Error("User not found");
    }
    if(gameState.getState() !== GameStateKind.WaitingForStart) {
        throw new Error("Game is not in waiting for start state");
    }
    gameState.callNextStage();
    return gameStateUpdate(connectionId);
}

