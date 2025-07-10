import { ClientGame, ClientGameCommandKind } from "@/common/Game";
import { userStorage } from "./userStorage";
import { NeedRefreshAllStatesKindConst, NeedRefreshAllStatesResponse, UserState } from "@/common/Common";
import { createInitialGameState, UserNotificator } from "./gameState";

const gameState = createInitialGameState();

export default {
    processMessage: (message: any, connectionId: string) => {
        console.log("processMessage called", { message, connectionId });
        const kind = message.kind as ClientGameCommandKind
        switch (kind) {
            case ClientGameCommandKind.UpdateReady:
                return updateReady(connectionId, message.data);
            case ClientGameCommandKind.LeaveGame:
                return leaveGame(connectionId);
            case ClientGameCommandKind.GameStateUpdate:
                return gameStateUpdate(connectionId);
        }
    },
    gameStateUpdate,
    addUserToGame
}

function updateReady(connectionId: string, data: boolean) {
    console.log("updateReady called", { connectionId, data });
    const uniqueId = userStorage.getUniqueId(connectionId)
    gameState.updateUserReady(uniqueId, data);
    return gameStateUpdate(connectionId);
}

function leaveGame(connectionId: string) {
    console.log("leaveGame called", { connectionId });
    throw new Error("Function not implemented.");
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
        hand: [],
        currentBid: 0,
        isReady: false,
        userNotificator: userNotificator
    });
    return new NeedRefreshAllStatesResponse(UserState.InGame);
}

function gameStateUpdate(connectionId: string): ClientGame.GameStateUpdateResponse {
    console.log("gameStateUpdate called", { connectionId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    return {
        kind: ClientGameCommandKind.GameStateUpdate,
        data: {
            currentUser: user,
            users: gameState.getUsers().filter(userInGame => userInGame.uniqueId !== user.uniqueId).map(userInGame => ({
                name: userStorage.getUser(userInGame.uniqueId)?.name ?? "Unknown",
                cardsInHandNum: userInGame.hand.length,
                currentBid: userInGame.currentBid,
                isReady: userInGame.isReady
            })),
            cardsInHand: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.hand ?? [],
            cardsOnTable: gameState.getCardsOnTable(),
            currentBid: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.currentBid ?? 0,
            isReady: gameState.getUsers().find(userInGame => userInGame.uniqueId === user.uniqueId)?.isReady ?? false
        },
        userState: UserState.InGame
    }
}
