# Single Room Poker System

A simplified, robust multiplayer poker server that handles disconnections and reconnections seamlessly without turn bugs.

## Key Features

### 🎯 **Seamless Disconnections & Reconnections**
- Players can disconnect and reconnect at any time during the game
- No turn bugs or game state corruption
- Automatic player state restoration on reconnection
- Graceful handling of network interruptions

### 🏠 **Single Room Architecture**
- All players join the same room automatically
- No complex room management or player routing
- Simplified game state management
- Maximum 6 players per room

### 🔄 **Robust Turn Management**
- Turn order is maintained even when players disconnect
- Disconnected players are skipped automatically
- Reconnected players can continue from where they left off
- No duplicate turns or missed actions

### 🎮 **Game Features**
- Texas Hold'em poker rules
- Automatic blinds posting
- Raise limits (3 raises per betting round)
- Action timers (30 seconds per action)
- Auto-fold on timeout
- Hand evaluation and showdown
- Pot splitting for ties

## Architecture

### Server Structure
```
server/
├── server.js              # Main server with Socket.IO
├── game/
│   ├── SingleRoomGame.js  # Complete game logic
│   └── HandEvaluator.js   # Poker hand evaluation
└── package.json
```

### Key Components

#### SingleRoomGame Class
- **Unified Game Management**: All game logic in one class
- **Player Tracking**: Maps socket IDs to player IDs for reconnection
- **State Persistence**: Player state preserved during disconnections
- **Turn Management**: Robust turn order handling

#### Simplified Player Management
- **Socket-to-Player Mapping**: Direct mapping for quick lookups
- **Disconnection Handling**: Players marked as disconnected, not removed
- **Reconnection Logic**: Automatic state restoration
- **Ready System**: Auto-ready players for seamless gameplay

## How It Works

### 1. Player Connection
```javascript
// Player joins with name
socket.emit('joinGame', { name: 'Player1', avatarUrl: '...' });

// Server handles reconnection automatically
if (existingPlayer) {
    // Update socket ID and restore state
    existingPlayer.socketId = socket.id;
    existingPlayer.disconnected = false;
}
```

### 2. Disconnection Handling
```javascript
// Player disconnects
socket.on('disconnect', () => {
    // Mark as disconnected, don't remove
    player.socketId = null;
    player.disconnected = true;
    
    // Continue game without this player
    // They can reconnect later
});
```

### 3. Turn Management
```javascript
// Get only active (connected) players for turn order
getActivePlayerOrder() {
    return this.playerOrder.filter(playerId => {
        const player = this.players.get(playerId);
        return player && !player.disconnected;
    });
}
```

### 4. Reconnection
```javascript
// Player reconnects with same name
if (existingPlayer) {
    // Restore socket connection
    existingPlayer.socketId = socket.id;
    existingPlayer.disconnected = false;
    
    // Send current game state
    socket.emit('gameJoined', {
        gameState: this.getPublicState(),
        isReconnection: true
    });
}
```

## API Endpoints

### WebSocket Events

#### Client to Server
- `joinGame` - Join the game with player data
- `pokerAction` - Make a poker action (fold, call, raise, etc.)
- `startGame` - Start the game (when all players ready)
- `startNewHand` - Start a new hand
- `resetRoom` - Reset room to lobby state

#### Server to Client
- `gameJoined` - Confirmation of joining/reconnecting
- `gameStateUpdate` - Updated game state
- `playerJoined` - New player joined
- `playerReconnected` - Player reconnected
- `playerDisconnected` - Player disconnected
- `error` - Error message

### REST API
- `GET /api/game` - Get current game state
- `GET /api/game/players` - Get list of players

## Testing

### Test File
Use `test-single-room-new.html` to test the system:

1. **Start the server**:
   ```bash
   cd pokerv2/server
   npm start
   ```

2. **Open test file** in browser:
   ```
   pokerv2/test-single-room-new.html
   ```

3. **Test scenarios**:
   - Join two players
   - Start a game
   - Disconnect one player during their turn
   - Reconnect the player
   - Verify turn order is maintained
   - Test multiple disconnections/reconnections

### Test Features
- Real-time game state display
- Player connection status
- Action buttons for poker moves
- Disconnect/reconnect buttons
- Detailed logging for debugging

## Benefits Over Previous System

### ✅ **Eliminated Issues**
- No more turn bugs when players disconnect/reconnect
- No complex room reset logic
- No player state corruption
- No duplicate game managers
- No socket ID confusion

### ✅ **Simplified Architecture**
- Single game class handles everything
- Direct socket-to-player mapping
- Clear separation of concerns
- Easier to debug and maintain

### ✅ **Better User Experience**
- Seamless reconnections
- No game interruptions
- Consistent turn order
- Reliable game state

## Configuration

### Game Settings
```javascript
// In SingleRoomGame constructor
this.maxPlayers = 6;
this.minPlayers = 2;
this.smallBlind = 10;
this.bigBlind = 20;
this.maxRaisesPerRound = 3;
this.actionTimeout = 30000; // 30 seconds
```

### Server Settings
```javascript
// In server.js
const PORT = process.env.PORT || 3000;
```

## Deployment

1. **Install dependencies**:
   ```bash
   cd pokerv2/server
   npm install
   ```

2. **Start server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

3. **Connect clients** to `http://localhost:3000`

## Troubleshooting

### Common Issues

1. **Player can't reconnect**
   - Ensure player uses the same name
   - Check server logs for errors
   - Verify socket connection

2. **Turn order issues**
   - Check `getActivePlayerOrder()` method
   - Verify disconnected players are filtered out
   - Check `currentPlayer` index

3. **Game state not updating**
   - Verify Socket.IO events are being sent
   - Check client event listeners
   - Review server logs

### Debug Logging
The system includes comprehensive logging:
- Player connections/disconnections
- Game state changes
- Turn transitions
- Action processing
- Error conditions

## Future Enhancements

- **Spectator Mode**: Allow non-playing observers
- **Chat System**: In-game messaging
- **Tournament Mode**: Multi-table tournaments
- **Custom Rules**: Configurable poker variants
- **Statistics**: Player stats and game history 