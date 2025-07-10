
import { WebSocketServer } from 'ws';
import { userStorage } from './userStorage';
import { ClientLobbyCommandKind, ClientLobby } from '@/common/Lobby';
import lobbyLogic from './lobbyLogic';
import { ClientError, UserState } from '@/common/Common';
import gameLogic from './gameLogic';
import { UserNotificator } from './gameState';

const wss = new WebSocketServer({ port: 8080 });

function catchAndCreateError<T>(handle: () => T): T | ClientLobby.ErrorResponse {
  try {
    return handle();
  } catch (error) {
    console.error(error);
    return {
      kind: ClientLobbyCommandKind.Error,
      data: new ClientError((error as any).toString()),
      userState: UserState.InLobby
    };
  }
}

wss.on('connection', function connection(ws) {
  // Generate a random connectionId (e.g., 16 hex characters)
  let connectionId = Math.random().toString(16).slice(2, 18);
  console.log('Client connected', connectionId);
  const response = lobbyLogic.onConnection(connectionId);
  ws.send(JSON.stringify(response));

  ws.on('message', function onMessage(data) {
    try {
      const user = userStorage.getUser(connectionId)
      if (user === undefined) {
        throw new Error("User not found");
      }

      const userNotificator : UserNotificator = {
        needRefreshAllStates: () => {
          console.log("needRefreshAllStates", connectionId);
          const user = userStorage.getUser(connectionId)
          if (user === undefined) {
            throw new Error("User not found");
          }
          ws.send(JSON.stringify({
            kind: "need_refresh_all_states",
            userState: user.state
          }));
        }
      }

      let parsed = JSON.parse(data.toString())
      switch (user.state) {
        case UserState.InLobby:
          const response1 = lobbyLogic.processMessage(parsed, connectionId, userNotificator);
          ws.send(JSON.stringify(response1));
          break;
        case UserState.InGame:
          const response2 = gameLogic.processMessage(parsed, connectionId);
          console.log(`processMessage ${parsed.kind}`, response2);
          ws.send(JSON.stringify(response2));
          break;
      }
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