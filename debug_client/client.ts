import WebSocket from 'ws';
import * as readline from 'readline';
import { ClientGameCommandKind, ClientGame, ClientGameState, ClientOtherUser, Card } from '../common/Game';
import { CommandRequest, ClientUser, ClientError } from '../common/Common';

const ws = new WebSocket('ws://localhost:8080');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let userUniqueId: string | null = null;
let savedGameState: ClientGameState | null = null; // Store the latest game state

function handleLeaveGame() {
  if (!userUniqueId) {
    console.log('User unique ID not set.');
    rl.prompt();
    return;
  }
  const message = {
    kind: ClientGameCommandKind.LeaveGame,
    data: undefined
  } as ClientGame.LeaveGameRequest;
  ws.send(JSON.stringify(message));
  rl.prompt();
}

function handleGameState() {
  if (!userUniqueId) {
    console.log('User unique ID not set.');
    rl.prompt();
    return;
  }
  const message = {
    kind: ClientGameCommandKind.GameStateUpdate,
    data: undefined
  } as ClientGame.GameStateUpdateRequest;
  ws.send(JSON.stringify(message));
  rl.prompt();
}

function handleConnectToGame() {
  if (!userUniqueId) {
    console.log('User unique ID not set.');
    rl.prompt();
    return;
  }
  // The ConnectToGameRequest expects a ClientGameState as data, but the client does not have this data to send.
  // We pass null to satisfy the type, but the server should ignore it.
  const message = {
    kind: ClientGameCommandKind.ConnectToGame,
    data: null
  } as unknown as ClientGame.ConnectToGameRequest;
  ws.send(JSON.stringify(message));
  console.log('ConnectToGame command sent.');
  rl.prompt();
}

function handleStartGame() {
  if (!userUniqueId) {
    console.log('User unique ID not set.');
    rl.prompt();
    return;
  }
  const message = {
    kind: ClientGameCommandKind.StartGame,
    data: undefined
  } as ClientGame.StartGameRequest;
  ws.send(JSON.stringify(message));
  rl.prompt();
}

function handleGameAction(action: string, amount?: number) {
  if (!userUniqueId) {
    console.log('User unique ID not set.');
    rl.prompt();
    return;
  }
  let gameAction;
  switch (action) {
    case 'bet':
      gameAction = 'Bet';
      break;
    case 'raise':
      gameAction = 'Raise';
      break;
    case 'check':
      gameAction = 'Check';
      break;
    case 'call':
      gameAction = 'Call';
      break;
    case 'fold':
      gameAction = 'Fold';
      break;
    default:
      console.log('Unknown game action:', action);
      rl.prompt();
      return;
  }
  const message = {
    kind: ClientGameCommandKind.GameAction,
    data: { action: gameAction, amount: amount ?? 0 }
  } as ClientGame.GameActionRequest;
  ws.send(JSON.stringify(message));
  rl.prompt();
}

function handleHelp() {
  console.log('Available commands:');
  console.log('/leavegame                  - Leave the game');
  console.log('/gamestate                  - Request the current game state');
  console.log('/connecttogame              - Connect to the game');
  console.log('/startgame                  - Start the game');
  console.log('/bet <amount>               - Place a bet');
  console.log('/raise <amount>             - Raise the bet');
  console.log('/check                      - Check');
  console.log('/call                       - Call');
  console.log('/fold                       - Fold');
  console.log('/help                       - Show this help message');
  rl.prompt();
}

function processCommand(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith('/')) {
    const [cmd, ...args] = trimmed.slice(1).split(' ');
    switch (cmd) {
      case 'leavegame':
        handleLeaveGame();
        break;
      case 'gamestate':
        handleGameState();
        break;
      case 'connecttogame':
        handleConnectToGame();
        break;
      case 'startgame':
        handleStartGame();
        break;
      case 'bet':
        if (args.length < 1 || isNaN(Number(args[0]))) {
          console.log('Usage: /bet <amount>');
          rl.prompt();
        } else {
          handleGameAction('bet', Number(args[0]));
        }
        break;
      case 'raise':
        if (args.length < 1 || isNaN(Number(args[0]))) {
          console.log('Usage: /raise <amount>');
          rl.prompt();
        } else {
          handleGameAction('raise', Number(args[0]));
        }
        break;
      case 'check':
        handleGameAction('check');
        break;
      case 'call':
        handleGameAction('call');
        break;
      case 'fold':
        handleGameAction('fold');
        break;
      case 'help':
        handleHelp();
        break;
      default:
        console.log('Unknown command:', cmd);
        handleHelp();
        return;
    }
    return;
  }
  ws.send(line);
  rl.prompt();
}

ws.on('open', () => {
  console.log('Connected to server');
  rl.question('Enter your user unique ID: ', (uid) => {
    let inputUserUniqueId = uid.trim();
    if (inputUserUniqueId === '') {
      console.log('User unique ID is empty, using random id');
      inputUserUniqueId = Math.random().toString(36).substring(2, 10);
    }
    rl.question('Enter your name: ', (name) => {
      const inputUserName = name.trim() || 'Anonymous';
      rl.question('Enter your avatar URL: ', (avatarUrl) => {
        const inputAvatarUrl = avatarUrl.trim() || '';
        userUniqueId = inputUserUniqueId;
        // Register user
        const registerMessage = {
          kind: ClientGameCommandKind.RegisterUser,
          data: { uniqueId: userUniqueId, name: inputUserName, avatarUrl: inputAvatarUrl }
        } as ClientGame.RegisterUserRequest;
        ws.send(JSON.stringify(registerMessage));
        rl.setPrompt('> ');
        rl.prompt();
        rl.on('line', (line) => {
          processCommand(line);
        });
      });
    });
  });
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data.toString());
    if (msg && msg.kind) {
      console.log(`\n[Server Command Response] ${msg.kind}`,JSON.stringify(msg.data, null, 2));
      if (msg.kind === ClientGameCommandKind.GameStateUpdate && msg.data) {
        // Use ClientGameState class for type safety
        const state = Object.setPrototypeOf(msg.data, ClientGameState.prototype) as ClientGameState;
        savedGameState = state; // Save the latest game state
        console.log('Game State:');
        // Print current user
        const currentUser = Object.setPrototypeOf(state.currentUser, ClientUser.prototype) as ClientUser;
        console.log(`Current User: ${currentUser.name} (${currentUser.uniqueId})`);
        // Print users
        console.log('Other Users:');
        state.users.forEach((user: ClientOtherUser) => {
          console.log(`- ${user.name}: Cards in hand: ${user.cardsInHandNum}, Bet: ${user.currentBet}`);
        });
        // Print cards in hand
        console.log('Cards in Hand:');
        state.cardsInHand.forEach((c: any) => {
          const card = Object.setPrototypeOf(c, Card.prototype) as Card;
          const suitEmoji = getSuitEmoji(card.suit);
          console.log(`- ${card.rank}${suitEmoji}`);
        });
        // Print cards on table
        console.log('Cards on Table:');
        state.cardsOnTable.forEach((c: any) => {
          const card = Object.setPrototypeOf(c, Card.prototype) as Card;
          const suitEmoji = getSuitEmoji(card.suit);
          console.log(`- ${card.rank}${suitEmoji}`);
        });
        // Print current bid
        console.log(`Current Bet: ${state.currentBet}`);
        // Print allowed actions
        if (state.allowedActions && state.allowedActions.length > 0) {
          console.log('Allowed Actions for your move:');
          state.allowedActions.forEach((action: any) => {
            console.log(`- ${action}`);
          });
        } else {
          console.log('No allowed actions at this time.');
        }
      } else if (msg.kind === ClientGameCommandKind.NeedRefreshAllStates) {
        // When server requests refresh, ask for the latest game state
        userUniqueId = msg.userUniqueId;
        if (userUniqueId) {
          const message = {
            kind: ClientGameCommandKind.GameStateUpdate,
            data: undefined
          } as ClientGame.GameStateUpdateRequest;
          ws.send(JSON.stringify(message));
        } else {
          console.log('User unique ID not set. Cannot refresh game state.');
        }
      } else if (msg.kind === ClientGameCommandKind.Error && msg.data) {
        // Use ClientError class for error
        const error = Object.setPrototypeOf(msg.data, ClientError.prototype) as ClientError;
        console.log(`Error: ${error.message}`);
      } else {
        // Pretty print other data
        console.log(JSON.stringify(msg.data, null, 2));
      }
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

function getSuitEmoji(suit: string): string {
  switch (suit.toLowerCase()) {
    case 'hearts':
      return '♥️';
    case 'diamonds':
      return '♦️';
    case 'clubs':
      return '♣️';
    case 'spades':
      return '♠️';
    default:
      return suit;
  }
} 