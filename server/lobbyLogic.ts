import { ClientLobby, ClientLobbyCommandKind } from "@/common/Lobby";
import { starWars, uniqueNamesGenerator } from "unique-names-generator";
import { userStorage } from "./userStorage";
import { CommandResponse, NeedRefreshAllStatesResponse, UserState } from "@/common/Common";
import gameLogic from "./gameLogic";
import { ClientGame } from "@/common/Game";
import { UserNotificator } from "./gameState";

function logMethod(method: string, params: Record<string, any>) {
    console.log(`[lobbyLogic] ${method}`, params);
}

export function getLobbyState(connectionId: string): ClientLobby.GetLobbyStateResponse {
    logMethod('getLobbyState', { connectionId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    return {
        kind: ClientLobbyCommandKind.GetLobbyState,
        data: {
            currentUser: {
                uniqueId: user.uniqueId,
                name: user.name
            }
        },
        userState: user.state
    };
}

export function setOldUniqueId(connectionId: string, oldUserUniqueId: string, newUserUniqueId: string): ClientLobby.GetLobbyStateResponse {
    logMethod('setOldUniqueId', { connectionId, oldUserUniqueId, newUserUniqueId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    if (user.uniqueId !== oldUserUniqueId) {
        throw new Error("User unique ID mismatch");
    }
    userStorage.updateUniqueId(connectionId, newUserUniqueId);
    const user2 = userStorage.getUser(connectionId)
    if (user2 === undefined) {
        throw new Error("User not found");
    }

    return {
        kind: ClientLobbyCommandKind.GetLobbyState,
        data: {
            currentUser: {
                uniqueId: user2.uniqueId,
                name: user2.name
            }
        },
        userState: user2.state
    };
}

export function onConnection(connectionId: string): ClientLobby.OnConnectionResponse {
    logMethod('onConnection', { connectionId });
    const user = userStorage.createUser(connectionId, uniqueNamesGenerator({
        dictionaries: [starWars]
    }), UserState.InLobby);
    return {
        kind: ClientLobbyCommandKind.OnConnection,
        data: {
            uniqueId: user.uniqueId,
            name: user.name
        },
        userState: user.state
    };
}

export function setUserName(connectionId: string, userUniqueId: string, name: string): ClientLobby.SetUserNameResponse {
    logMethod('setUserName', { connectionId, userUniqueId, name });
    const user = userStorage.getUser(connectionId);
    if (user === undefined) {
        throw new Error("User not found");
    }
    if (user.uniqueId !== userUniqueId) {
        throw new Error("User unique ID mismatch");
    }
    user.name = name;
    return {
        kind: ClientLobbyCommandKind.SetUserName,
        data: {
            uniqueId: user.uniqueId,
            name: user.name
        },
        userState: user.state
    };
}

export function processMessage(message: any, connectionId: string, userNotificator: UserNotificator): ClientLobby.ErrorResponse | CommandResponse<ClientLobbyCommandKind, any> | NeedRefreshAllStatesResponse {
    logMethod('processMessage', { message, connectionId });

    const kind = message.kind as ClientLobbyCommandKind

    switch (kind) {
        case ClientLobbyCommandKind.SetUserName:
            const request1 = message as ClientLobby.RequestMap[typeof kind]
            return setUserName(connectionId, request1.userUniqueId, request1.data);
        case ClientLobbyCommandKind.GetLobbyState:
            return getLobbyState(connectionId);
        case ClientLobbyCommandKind.SetOldUniqueId:
            const request2 = message as ClientLobby.RequestMap[typeof kind]
            return setOldUniqueId(connectionId, request2.userUniqueId,request2.data);
        case ClientLobbyCommandKind.EnterGame:
            return enterGame(connectionId, userNotificator);
        default:
            throw new Error(`Unknown message kind: ${kind} for message: ${JSON.stringify(message.toString())}`);
    }
}

function enterGame(connectionId: string, userNotificator: UserNotificator):NeedRefreshAllStatesResponse  {
    logMethod('enterGame', { connectionId });
    const user = userStorage.getUser(connectionId)
    if (user === undefined) {
        throw new Error("User not found");
    }
    user.state = UserState.InGame;
    return gameLogic.addUserToGame(connectionId, userNotificator);
}

export default {
    onConnection,
    processMessage
}