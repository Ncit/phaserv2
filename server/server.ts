
import { WebSocketServer } from 'ws';
import { userStorage } from './userStorage';
import { ClientError } from '@/common/Common';
import gameLogic from './gameLogic';
import { UserNotificator } from './gameState';
import { ClientGame, ClientGameCommandKind } from '@/common/Game';
import { starWars, uniqueNamesGenerator } from 'unique-names-generator';

const wss = new WebSocketServer({ port: 8080 });

function catchAndCreateError<T>(handle: () => T): T | ClientGame.ErrorResponse {
    try {
        return handle();
    } catch (error) {
        console.error(error);
        return {
            kind: ClientGameCommandKind.Error,
            data: new ClientError((error as any).toString())
        };
    }
}

wss.on('connection', function connection(ws) {
    // Generate a random connectionId (e.g., 16 hex characters)
    let connectionId = Math.random().toString(16).slice(2, 18);
    console.log('Client connected', connectionId);

    userStorage.createUser(connectionId);


    const userNotificator: UserNotificator = {
        needRefreshAllStates: () => {
            console.log("needRefreshAllStates", connectionId);
            const user = userStorage.getUser(connectionId)
            if (user === undefined) {
                throw new Error("User not found");
            }
            ws.send(JSON.stringify({
                kind: ClientGameCommandKind.NeedRefreshAllStates,
                userUniqueId: user.uniqueId
            }));
        }
    }

    ws.on('message', function onMessage(data) {
        try {
            const user = userStorage.getUser(connectionId)
            if (user === undefined) {
                throw new Error("User not found");
            }

            let parsed = JSON.parse(data.toString())
            const response2 = gameLogic.processMessage(parsed, connectionId, user, userNotificator);
            console.log(`processMessage ${parsed.kind}`, response2);
            ws.send(JSON.stringify(response2));
        } catch (error) {
            ws.send(JSON.stringify({
                kind: "error",
                data: new ClientError((error as any).toString())
            }));
            console.error(error);
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server started on ws://localhost:8080'); 