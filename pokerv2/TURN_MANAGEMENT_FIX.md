# Turn Management Fix

## Problem Description

Players were experiencing a "Not your turn" error even when the client correctly showed it was their turn. This happened because:

1. **Index Mismatch**: The server used `this.currentPlayer` as an index into the `getActivePlayerOrder()` array
2. **Array Changes**: When players joined or left during a game, the `activePlayerOrder` array would change
3. **Stale Index**: The `currentPlayer` index would then point to the wrong player or be out of bounds

## Root Cause

```javascript
// Server was doing this:
const activePlayerOrder = this.getActivePlayerOrder();
const currentPlayerId = activePlayerOrder[this.currentPlayer]; // Index could be wrong!

// Client was doing this:
isCurrentPlayer: playerId === this.getActivePlayerOrder()[this.currentPlayer] // Same issue!
```

When players joined/left, the `activePlayerOrder` array would change, but `this.currentPlayer` index remained the same, causing it to point to the wrong player.

## Solution Implemented

### 1. Added `getCurrentPlayerId()` Method

```javascript
getCurrentPlayerId() {
    const activePlayerOrder = this.getActivePlayerOrder();
    if (activePlayerOrder.length === 0) {
        return null;
    }
    
    // Validate current player index
    if (this.currentPlayer >= activePlayerOrder.length) {
        console.log(`⚠️ Current player index (${this.currentPlayer}) out of bounds, resetting to 0`);
        this.currentPlayer = 0;
    }
    
    return activePlayerOrder[this.currentPlayer];
}
```

### 2. Added `validateCurrentPlayerIndex()` Method

```javascript
validateCurrentPlayerIndex() {
    const activePlayerOrder = this.getActivePlayerOrder();
    if (activePlayerOrder.length === 0) {
        this.currentPlayer = 0;
        return;
    }
    
    // If current player index is out of bounds, reset to 0
    if (this.currentPlayer >= activePlayerOrder.length) {
        console.log(`🔄 Current player index (${this.currentPlayer}) out of bounds, resetting to 0`);
        this.currentPlayer = 0;
    }
    
    // If current player is folded or all-in, move to next player
    const currentPlayerId = activePlayerOrder[this.currentPlayer];
    const currentPlayer = this.players.get(currentPlayerId);
    if (currentPlayer && (currentPlayer.folded || currentPlayer.allIn)) {
        console.log(`🔄 Current player ${currentPlayer.name} is folded/all-in, moving to next player`);
        this.nextPlayer();
    }
}
```

### 3. Updated Turn Validation

```javascript
handlePlayerAction(socketId, actionData) {
    // ... existing code ...
    
    // Check if it's the player's turn
    const activePlayerOrder = this.getActivePlayerOrder();
    
    // Debug logging
    console.log(`🎯 Turn check - Player ${player.name} (${playerId}) attempting action: ${actionData.action}`);
    console.log(`🎯 Active player order: [${activePlayerOrder.join(', ')}]`);
    console.log(`🎯 Current player index: ${this.currentPlayer}`);
    console.log(`🎯 Expected current player: ${activePlayerOrder[this.currentPlayer] || 'undefined'}`);
    
    // Validate current player index
    if (this.currentPlayer >= activePlayerOrder.length) {
        console.log(`⚠️ Current player index (${this.currentPlayer}) out of bounds for active players (${activePlayerOrder.length})`);
        this.currentPlayer = 0; // Reset to first player
    }
    
    const currentPlayerId = activePlayerOrder[this.currentPlayer];
    
    if (playerId !== currentPlayerId) {
        console.log(`❌ Turn mismatch - Expected: ${currentPlayerId}, Got: ${playerId}`);
        throw new Error('Not your turn');
    }
    
    console.log(`✅ Turn validated - ${player.name} can make action`);
    
    // ... rest of method ...
}
```

### 4. Updated Client-Side Turn Detection

```javascript
// In getPlayersList() and getPlayerInfo()
isCurrentPlayer: playerId === this.getCurrentPlayerId()
```

### 5. Automatic Validation on Player Changes

```javascript
// In handlePlayerJoin()
if (this.status === 'playing') {
    this.validateCurrentPlayerIndex();
}

// In handlePlayerDisconnect()
if (this.status === 'playing') {
    this.validateCurrentPlayerIndex();
}
```

## Benefits

1. **Consistent Turn Management**: Server and client now use the same logic to determine whose turn it is
2. **Automatic Recovery**: Index out-of-bounds issues are automatically detected and fixed
3. **Better Debugging**: Detailed logging helps identify turn management issues
4. **Robust Handling**: Players joining/leaving during games no longer break turn order

## Testing

Use the `test-turn-management-fix.html` file to test:

1. Start a game with 2 players
2. Have a 3rd player join during the game
3. Disconnect a player during the game
4. Verify turn management continues to work correctly

## Debug Logs

The fix includes comprehensive logging to help diagnose turn issues:

- `🎯 Turn check` - Shows who is attempting an action
- `🎯 Active player order` - Shows the current player order
- `🎯 Current player index` - Shows the current index
- `⚠️ Current player index out of bounds` - When index needs resetting
- `❌ Turn mismatch` - When turn validation fails
- `✅ Turn validated` - When turn validation succeeds

## Files Modified

- `pokerv2/server/game/SingleRoomGame.js` - Main fix implementation
- `pokerv2/test-turn-management-fix.html` - Test file for verification
- `pokerv2/TURN_MANAGEMENT_FIX.md` - This documentation 