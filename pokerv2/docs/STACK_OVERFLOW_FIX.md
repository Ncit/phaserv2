# Stack Overflow Fix Documentation

## Problem Description

The multiplayer poker game was experiencing a "Maximum call stack size exceeded" error in the NetworkManager. This error was occurring due to a circular reference in the event handling system.

## Root Cause Analysis

The issue was in the `NetworkManager.js` file where there was a circular reference pattern:

1. **setupEventListeners()** method set up listeners for internal EventManager events
2. **setupSocketListeners()** method received socket events and emitted them to the EventManager
3. **handleGameStateUpdate()** method received EventManager events and emitted more events back to the EventManager

This created an infinite loop:
```
Socket Event → EventManager → handleGameStateUpdate → EventManager → handleGameStateUpdate → ...
```

## The Fix

### 1. Removed Circular Event Handling

**Before (Problematic Code):**
```javascript
setupEventListeners() {
    // Listen for custom events
    this.eventManager.on('gameStateUpdate', (data) => {
        this.handleGameStateUpdate(data);
    });
    
    this.eventManager.on('playerJoined', (data) => {
        this.handlePlayerJoined(data);
    });
    
    // ... more event listeners
}

setupSocketListeners() {
    this.socket.on('gameStateUpdate', (data) => {
        this.gameState = data.gameState;
        this.players = data.gameState.players;
        this.eventManager.emit('gameStateUpdate', data); // ❌ Circular reference
    });
}

handleGameStateUpdate(data) {
    // Update local state
    this.gameState = data.gameState;
    this.players = data.gameState.players;
    
    // Emit to scene
    this.eventManager.emit('gameStateChanged', { // ❌ Another emission
        gameState: this.gameState,
        lastAction: data.lastAction,
        newHand: data.newHand
    });
}
```

**After (Fixed Code):**
```javascript
setupEventListeners() {
    // Remove the circular reference - these listeners are not needed
    // as the socket events are handled directly in setupSocketListeners
}

setupSocketListeners() {
    this.socket.on('gameStateUpdate', (data) => {
        console.log('NetworkManager: Game state update:', data);
        this.gameState = data.gameState;
        this.players = data.gameState.players;
        
        // Emit directly to scene without going through handleGameStateUpdate
        this.eventManager.emit('gameStateChanged', {
            gameState: this.gameState,
            lastAction: data.lastAction,
            newHand: data.newHand,
            gameStarted: data.gameStarted
        });
    });
    
    // Handle player events directly in socket listeners
    this.socket.on('playerJoined', (data) => {
        // Update players list
        const newPlayer = data.player;
        const existingPlayerIndex = this.players.findIndex(p => p.id === newPlayer.id);
        
        if (existingPlayerIndex >= 0) {
            this.players[existingPlayerIndex] = newPlayer;
        } else {
            this.players.push(newPlayer);
        }
        
        this.eventManager.emit('playerJoined', data);
    });
}

// Removed handleGameStateUpdate, handlePlayerJoined, handlePlayerLeft, handleError methods
```

### 2. Added EventManager Cleanup Method

Added a `cleanup()` method to the EventManager for proper resource management:

```javascript
// Cleanup method for NetworkManager compatibility
cleanup() {
    this.clear();
}
```

## Benefits of the Fix

1. **Eliminates Stack Overflow**: No more circular references causing infinite recursion
2. **Simplified Event Flow**: Direct socket event → scene event flow
3. **Better Performance**: Reduced event processing overhead
4. **Cleaner Code**: Removed redundant event handling methods
5. **Proper Resource Management**: Added cleanup methods

## Testing

A test page `test-stack-overflow-fix.html` was created to verify the fix:

- Tests NetworkManager loading
- Tests server connection
- Tests game joining
- Tests event handling without stack overflow
- Tests proper cleanup

## Files Modified

1. **`src/managers/NetworkManager.js`**
   - Removed circular event handling
   - Simplified socket event processing
   - Removed redundant handler methods

2. **`src/utils/EventManager.js`**
   - Added cleanup method for compatibility

3. **`test-stack-overflow-fix.html`** (new)
   - Test page to verify the fix

## Verification

To verify the fix is working:

1. Start the server: `cd pokerv2/server && npm run dev`
2. Open `test-stack-overflow-fix.html` in a browser
3. Click "Connect to Server" and "Join Game"
4. Click "Test Event Handling" to verify no stack overflow occurs
5. Check the browser console for any error messages

The game should now run without the "Maximum call stack size exceeded" error. 