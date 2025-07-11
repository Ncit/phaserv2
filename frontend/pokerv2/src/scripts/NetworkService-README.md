# NetworkService Documentation

The NetworkService provides a WebSocket connection to `ws://i.mawazo.xyz:50202` and can be accessed from any JavaScript file in the project.

## Access Methods

The NetworkService is available in two ways:

### 1. As ES6 Module Import
```javascript
import NetworkService from './scripts/NetworkService.js';
```

### 2. As Global Window Object
```javascript
// Available globally after NetworkService.js is loaded
window.NetworkService
```

## Basic Usage

### Connection Status
```javascript
// Check if connected
if (window.NetworkService.isConnected()) {
    console.log('Connected to server!');
}

// Get WebSocket ready state
const state = window.NetworkService.getReadyState();
// Returns: WebSocket.CONNECTING (0), WebSocket.OPEN (1), WebSocket.CLOSING (2), or WebSocket.CLOSED (3)
```

### Sending Messages
```javascript
// Send JSON object
window.NetworkService.send({
    type: 'game_action',
    data: 'Hello Server!'
});

// Send string
window.NetworkService.send('Hello Server!');

// Returns true if sent successfully, false if not connected
const success = window.NetworkService.send({ type: 'ping' });
```

### Event Handlers

#### Connection Events
```javascript
// When connection is established
window.NetworkService.onConnect(() => {
    console.log('Connected!');
    // Send initial data, join game room, etc.
});

// When connection is lost
window.NetworkService.onDisconnect((event) => {
    console.log('Disconnected:', event.code, event.reason);
    // Handle disconnection, show reconnecting message, etc.
});

// When network error occurs
window.NetworkService.onError((error) => {
    console.error('Network error:', error);
    // Handle errors, show error message, etc.
});
```

#### Message Handlers
```javascript
// Register handler for specific message types
window.NetworkService.onMessage('game_state', (data) => {
    console.log('Game state received:', data);
    // Update game UI based on server data
});

window.NetworkService.onMessage('player_joined', (data) => {
    console.log('Player joined:', data.playerName);
    // Add player to game interface
});

window.NetworkService.onMessage('chat_message', (data) => {
    console.log('Chat:', data.message);
    // Display chat message in UI
});

// Handle raw/unformatted messages
window.NetworkService.onMessage('raw', (data) => {
    console.log('Raw message:', data.data);
});
```

#### Remove Message Handlers
```javascript
function myHandler(data) {
    console.log('Received:', data);
}

// Add handler
window.NetworkService.onMessage('my_event', myHandler);

// Remove specific handler
window.NetworkService.offMessage('my_event', myHandler);
```

### Manual Connection Control
```javascript
// Manually disconnect (stops auto-reconnection)
window.NetworkService.disconnect();

// Reconnection is automatic when connection is lost
// Max 5 attempts with exponential backoff (1s, 2s, 4s, 8s, 16s)
```

## Usage Examples

### In Phaser Scenes
```javascript
export class GameScene extends Phaser.Scene {
    create() {
        // Setup network handlers
        window.NetworkService.onConnect(() => {
            this.handleConnected();
        });

        window.NetworkService.onMessage('game_update', (data) => {
            this.updateGameState(data);
        });
    }

    handlePlayerAction(action) {
        // Send player action to server
        window.NetworkService.send({
            type: 'player_action',
            action: action,
            playerId: this.playerId,
            timestamp: Date.now()
        });
    }
}
```

### In Utility Scripts
```javascript
// utils/GameManager.js
class GameManager {
    constructor() {
        this.setupNetworking();
    }

    setupNetworking() {
        window.NetworkService.onMessage('lobby_update', (data) => {
            this.updateLobby(data.players);
        });
    }

    joinLobby(playerName) {
        window.NetworkService.send({
            type: 'join_lobby',
            playerName: playerName
        });
    }
}
```

### In Event Handlers
```javascript
// Button click handlers
document.getElementById('sendChatBtn').addEventListener('click', () => {
    const message = document.getElementById('chatInput').value;
    
    window.NetworkService.send({
        type: 'chat_message',
        message: message,
        playerId: currentPlayer.id
    });
});
```

## Message Format

The NetworkService expects messages in this format:

```javascript
{
    type: 'message_type',    // Required: string identifying message type
    // ... additional data fields
}
```

### Hole Cards Message Format:
```javascript
// Server sends hole cards to player
{
    type: 'hole_cards',
    cards: [
        { value: 'ace', suit: 'spades' },
        { value: 'king', suit: 'hearts' }
    ]
}

// Or with specific player ID
{
    type: 'player_cards', 
    playerId: 'player123',
    cards: [
        { value: 'queen', suit: 'diamonds' },
        { value: 'jack', suit: 'clubs' }
    ]
}
```

### Common Message Types Used in Poker Game:
- `join_game` - Join a poker table
- `player_action` - Fold, call, raise actions
- `game_state` - Current game state update
- `card_dealt` - Community cards dealt (flop, turn, river)
- `hole_cards` - Player's private hole cards
- `player_cards` - Specific player's cards with player ID
- `get_hole_cards` - Request current hole cards from server
- `chat_message` - Chat messages
- `ping` - Keep connection alive

## Debug Mode

When `window.isDebug = true`, the NetworkService will log detailed information:
- Connection attempts and status
- All sent and received messages
- Reconnection attempts
- Message handler registrations

```javascript
// Enable debug logging
window.isDebug = true;
```

## Auto-Features

1. **Auto-Connection**: Connects immediately when loaded
2. **Auto-Reconnection**: Reconnects automatically on connection loss (max 5 attempts)
3. **Keep-Alive**: Automatic ping every 30 seconds (in GameScene example)
4. **Error Handling**: Graceful error handling with callbacks

## Integration Notes

- NetworkService is loaded early in the HTML file before other scripts
- Available globally via `window.NetworkService`
- Can be imported as ES6 module if needed
- Singleton pattern - one instance per application
- Thread-safe message handling with error isolation 