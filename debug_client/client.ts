import WebSocket from 'ws';
import * as readline from 'readline';
import { ClientLobbyCommandKind, SetUserNameRequest, GetLobbyStateRequest, CreateRoomRequest, JoinRoomRequest, LeaveRoomRequest, GetRoomsRequest } from '../common/Lobby';

const ws = new WebSocket('ws://localhost:8080');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let userUniqueId: string | null = null;

ws.on('open', () => {
  console.log('Connected to server');
  rl.question('Enter your user unique ID: ', (uid) => {
    userUniqueId = uid.trim();
    rl.setPrompt('> ');
    rl.prompt();
    rl.on('line', (line) => {
      // Parse commands starting with '/'
      const trimmed = line.trim();
      if (trimmed.startsWith('/')) {
        const [cmd, ...args] = trimmed.slice(1).split(' ');
        let message: any = null;
        switch (cmd) {
          case 'setname':
            // Usage: /setname <username>
            if (args.length < 1) {
              console.log('Usage: /setname <username>');
              rl.prompt();
              return;
            }
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.SetUserName,
              data: args.join(' '),
              userUniqueId: userUniqueId
            } as SetUserNameRequest;
            break;
          case 'getlobby':
            // Usage: /getlobby
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.GetLobbyState,
              data: undefined,
              userUniqueId: userUniqueId
            } as GetLobbyStateRequest;
            break;
          case 'createroom':
            // Usage: /createroom <roomid> <roomname>
            if (args.length < 2) {
              console.log('Usage: /createroom <roomid> <roomname>');
              rl.prompt();
              return;
            }
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.CreateRoom,
              data: {
                id: args[0],
                name: args.slice(1).join(' ')
              },
              userUniqueId: userUniqueId
            } as CreateRoomRequest;
            break;
          case 'joinroom':
            // Usage: /joinroom <roomid>
            if (args.length < 1) {
              console.log('Usage: /joinroom <roomid>');
              rl.prompt();
              return;
            }
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.JoinRoom,
              data: {
                id: args[0]
              },
              userUniqueId: userUniqueId
            } as JoinRoomRequest;
            break;
          case 'leaveroom':
            // Usage: /leaveroom <roomid>
            if (args.length < 1) {
              console.log('Usage: /leaveroom <roomid>');
              rl.prompt();
              return;
            }
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.LeaveRoom,
              data: {
                id: args[0]
              },
              userUniqueId: userUniqueId
            } as LeaveRoomRequest;
            break;
          case 'getrooms':
            // Usage: /getrooms
            if (!userUniqueId) {
              console.log('User unique ID not set.');
              rl.prompt();
              return;
            }
            message = {
              kind: ClientLobbyCommandKind.GetRooms,
              data: undefined,
              userUniqueId: userUniqueId
            } as GetRoomsRequest;
            break;
          default:
            console.log('Unknown command:', cmd);
            rl.prompt();
            return;
        }
        ws.send(JSON.stringify(message));
        rl.prompt();
        return;
      }
      ws.send(line);
      rl.prompt();
    });
  });
});

ws.on('message', (data) => {
  console.log(`Received: ${data}`);
  try {
    const msg = JSON.parse(data.toString());
    if (msg && msg.kind) {
      console.log(`\n[Server Command Response] ${msg.kind}`);
      if (msg.data !== undefined) {
        // Pretty print the data
        console.log(JSON.stringify(msg.data, null, 2));
      } else {
        console.log('(No data)');
      }
    } else {
      // Not a command response, just print raw
      console.log(data.toString());
    }
  } catch (e) {
    // Not JSON, just print raw
    console.log(data.toString());
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
  rl.close();
}); 