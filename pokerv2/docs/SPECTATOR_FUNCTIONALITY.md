# Spectator Functionality

## Overview

The poker game now includes spectator functionality that prevents players who join during an active game from participating in the game mechanics while still allowing them to watch the game in progress.

## How It Works

### Server-Side Implementation

#### 1. Spectator Marking
When a player joins a room, the server checks if a game is currently in progress:

```javascript
// In handlePlayerJoin()
const isGameInProgress = this.status === 'playing' || this.phase !== 'lobby';
const player = {
    // ... other player properties
    isSpectator: isGameInProgress // Mark as spectator if joining during game
};
```

#### 2. Action Prevention
Spectators are prevented from making any game actions:

```javascript
// In handlePlayerAction()
if (player.isSpectator) {
    throw new Error('Spectators cannot make actions');
}
```

#### 3. Active Player Filtering
Spectators are excluded from active player lists:

```javascript
getActivePlayers() {
    return Array.from(this.players.values()).filter(p => 
        !p.folded && !p.disconnected && !p.isSpectator
    );
}

getActivePlayerOrder() {
    return this.playerOrder.filter(playerId => {
        const player = this.players.get(playerId);
        return player && !player.disconnected && !player.isSpectator;
    });
}
```

#### 4. Card Dealing
Cards are only dealt to active players (non-spectators):

```javascript
dealHoleCards() {
    const activePlayerOrder = this.getActivePlayerOrder();
    // Only deal to active players, not spectators
    for (const playerId of activePlayerOrder) {
        // ... deal cards
    }
}
```

### Client-Side Implementation

#### 1. Action Button Disabling
The client disables action buttons for spectators:

```javascript
updateActionButtons() {
    const myPlayer = this.networkManager.getMyPlayer();
    
    // Disable actions if player is a spectator
    if (myPlayer && myPlayer.isSpectator) {
        console.log('FastGameScene: Player is spectator - disabling actions');
        this.disablePlayerActions();
        return;
    }
    // ... rest of method
}
```

#### 2. Action Handler Protection
Individual action handlers check for spectator status:

```javascript
handleFold() {
    const myPlayer = this.networkManager.getMyPlayer();
    if (myPlayer && myPlayer.isSpectator) {
        console.log('FastGameScene: Spectators cannot make actions');
        return;
    }
    // ... rest of method
}
```

#### 3. Visual Indicators
Spectators see a "[SPECTATOR]" label next to their name:

```javascript
updatePlayerDisplay(playerId) {
    // ... other display logic
    if (player.isSpectator) {
        displayName += ' [SPECTATOR]';
    }
}
```

## Reconnection Handling

### Problem
Previously, when a player reconnected during an active game, they were automatically converted from spectator to active player, which was incorrect.

### Solution
The reconnection logic now preserves spectator status during active games:

```javascript
if (isReconnection && existingPlayer) {
    // Update the existing player's socket ID and mark as reconnected
    existingPlayer.socketId = socketId;
    existingPlayer.disconnected = false;
    
    // Only convert from spectator to active player if game is not in progress
    if (this.status === 'lobby') {
        existingPlayer.isSpectator = false;
        this.readyPlayers.add(existingPlayer.id);
    } else {
        // If game is in progress, keep as spectator
        existingPlayer.isSpectator = true;
        console.log(`👁️ Reconnected player ${playerData.name} remains as spectator during active game`);
    }
}
```

## Spectator Conversion

Spectators are only converted to active players in specific scenarios:

### 1. Game End
When a game ends and returns to lobby state, all spectators become active players:

```javascript
resetRoom() {
    // ... reset logic
    this.players.forEach(player => {
        player.isSpectator = false; // Convert spectators to active players
    });
}
```

### 2. New Game Start
When a new game starts, all spectators become active players:

```javascript
startGame() {
    // ... start game logic
    this.players.forEach(player => {
        player.isSpectator = false; // Convert any spectators to active players
    });
}
```

## Spectator Benefits

While spectators cannot participate in the game, they can:

1. **Watch the game in real-time** - See all player actions, bets, and game progression
2. **Use the chat system** - Communicate with other players
3. **See revealed cards** - View cards when they are shown during showdown
4. **Join the next game** - Automatically become active players when a new game starts

## Testing

Use the `test-spectator-functionality.html` file to verify that:

1. New players joining during active games are marked as spectators
2. Spectators cannot make any game actions
3. Spectators do not receive cards or turns
4. Reconnected players remain as spectators during active games
5. Spectators are properly converted to active players when games end/restart

## Server Logs

The server provides clear logging for spectator-related events:

```
🆕 New player Player3 joining...
👁️ Player Player3 joined as spectator during active game

🔄 Player Player1 reconnecting...
👁️ Reconnected player Player1 remains as spectator during active game
```

## Implementation Files

- **Server**: `pokerv2/server/game/SingleRoomGame.js`
- **Client**: `pokerv2/client/src/scenes/FastGameScene.js`
- **Test**: `pokerv2/test-spectator-functionality.html`

## Key Methods

### Server-Side
- `handlePlayerJoin()` - Marks new players as spectators during active games
- `handlePlayerAction()` - Prevents spectators from making actions
- `getActivePlayers()` - Excludes spectators from active player lists
- `getActivePlayerOrder()` - Excludes spectators from turn order

### Client-Side
- `updateActionButtons()` - Disables action buttons for spectators
- `handleFold()`, `handleCall()`, `handleRaise()`, `handleAllIn()` - Check spectator status
- `updatePlayerDisplay()` - Shows spectator indicator in UI

This implementation ensures that the game remains fair and balanced while allowing late-joining players to observe and potentially join future games. 