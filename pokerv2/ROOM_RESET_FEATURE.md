# Room Reset Feature - One Player Remaining

## Overview

This feature automatically resets the poker room to lobby state when only one player remains in the game. This prevents the game from getting stuck in an unplayable state and allows the remaining player to wait for new players to join.

## How It Works

### Automatic Reset Triggers

The room automatically resets to lobby state when:

1. **Player Disconnection**: When a player disconnects and only one player remains
2. **During Active Game**: If the game is in progress and players leave until only one remains
3. **Betting Round Completion**: When a betting round completes with only one active player

### Reset Behavior

When the room resets:

- **Game Status**: Changes from `playing` to `lobby`
- **Game Phase**: Changes from current phase to `lobby`
- **Player State**: All remaining players are reset to lobby state
- **Bank Reset**: All players get 1000 chips back
- **Spectator Conversion**: Any spectators become active players
- **Ready State**: All players are automatically marked as ready
- **Game State**: Pot, bets, cards, and timers are cleared

### Server Events

The server emits specific events when the room resets:

```javascript
// When room resets due to only one player remaining
socket.on('roomResetToOnePlayer', (data) => {
    console.log(data.message); // "Only one player remaining. Room has been reset to lobby state."
    console.log(data.remainingPlayer); // Info about the remaining player
});

// Updated game state with reset flag
socket.on('gameStateUpdate', (data) => {
    if (data.roomResetToOnePlayer) {
        // Room was reset due to one player remaining
    }
});
```

## Implementation Details

### Key Methods

1. **`checkAndResetIfOnePlayer()`**: Checks if only one player remains and resets the room
2. **`handlePlayerDisconnect()`**: Enhanced to check for one-player scenario
3. **`nextPhase()`**: Checks for reset before transitioning phases
4. **`startBettingRound()`**: Checks for reset before starting betting

### Code Changes

#### SingleRoomGame.js

```javascript
// New method to check and reset if only one player
checkAndResetIfOnePlayer() {
    const playerCount = this.getPlayerCount();
    if (playerCount === 1 && this.status === 'playing') {
        console.log('👤 Only one player remaining during active game - resetting room to lobby');
        this.resetRoom();
        return true;
    }
    return false;
}

// Enhanced disconnect handler
handlePlayerDisconnect(socketId) {
    // ... existing logic ...
    
    const remainingPlayers = this.getPlayerCount();
    if (remainingPlayers === 0) {
        this.resetWhenEmpty();
    } else if (remainingPlayers === 1) {
        // NEW: Reset room when only one player remains
        console.log('👤 Only one player remaining - resetting room to lobby state');
        this.resetRoom();
    } else {
        // ... existing game logic ...
    }
}
```

#### server.js

```javascript
// Enhanced disconnect handling
socket.on('disconnect', () => {
    const result = game.handlePlayerDisconnect(socket.id);
    
    if (result) {
        const playerCount = game.getPlayerCount();
        
        if (playerCount === 0) {
            // Room empty - complete reset
            io.to('main-room').emit('roomEmpty', { message: 'All players have left. Room has been reset.' });
        } else if (playerCount === 1) {
            // NEW: Only one player - reset to lobby
            io.to('main-room').emit('roomResetToOnePlayer', {
                message: 'Only one player remaining. Room has been reset to lobby state.',
                remainingPlayer: game.getPlayersList()[0]
            });
            
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                roomResetToOnePlayer: true
            });
        } else {
            // ... existing logic for multiple players ...
        }
    }
});
```

## Testing

Use the provided test file `test-room-reset-one-player.html` to verify the feature:

1. Start the server
2. Connect multiple players
3. Start a game
4. Disconnect players until only one remains
5. Verify the room resets to lobby state

### Test Scenarios

1. **Basic Reset**: 3 players → 2 disconnect → room resets
2. **During Game**: Game in progress → players leave → room resets
3. **Reconnection**: Player reconnects after reset → can join normally
4. **Multiple Disconnects**: Multiple players disconnect simultaneously → room resets

## Benefits

1. **Prevents Stuck Games**: No more games stuck with one player
2. **Better UX**: Remaining player can wait for new players
3. **Automatic Recovery**: Room automatically returns to playable state
4. **Consistent State**: All players start fresh with full bank
5. **Clear Feedback**: Server events inform clients about the reset

## Configuration

The feature is enabled by default and requires no configuration. The minimum player count (2) and maximum player count (6) are defined in the `SingleRoomGame` constructor.

## Future Enhancements

Potential improvements:

1. **Configurable Threshold**: Allow setting custom player count for reset
2. **Grace Period**: Add delay before reset to allow reconnections
3. **Reset Notifications**: More detailed notifications about what was reset
4. **Statistics Tracking**: Track how often resets occur
5. **Manual Override**: Allow manual reset even with multiple players 