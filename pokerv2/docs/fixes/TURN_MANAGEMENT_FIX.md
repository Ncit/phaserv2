# Turn Management Fix

## Issue Description

Players were receiving "Player cannot act" errors despite it being their turn. The client-side logic was working correctly (buttons were enabled when `isMyTurn: true`), but the server-side turn management had several issues causing turn advancement problems.

## Root Causes Identified

1. **getCurrentPlayerId() Method Issue**: The method was using a temporary variable `tempCurrentPlayer` to skip folded/all-in players but wasn't updating the actual `this.currentPlayer` index, causing the turn to get stuck.

2. **nextPlayer() Method Problems**: 
   - No validation for out-of-bounds current player index
   - Inconsistent handling of folded/all-in players
   - Missing debug logging for turn advancement

3. **startBettingRound() Recursive Calls**: The method was calling `this.nextPlayer()` in a loop when the current player was folded/all-in, which could cause infinite recursion or unexpected behavior.

4. **isBettingRoundComplete() Logic**: Insufficient logging made it difficult to debug betting round completion decisions.

## Fixes Applied

### 1. Fixed getCurrentPlayerId() Method

**File**: `pokerv2/server/game/SingleRoomGame.js`

**Problem**: Method used temporary variable without updating actual index
```javascript
// OLD CODE (problematic)
let tempCurrentPlayer = this.currentPlayer;
while (this.players.get(currentPlayerId).folded || this.players.get(currentPlayerId).allIn) {
    tempCurrentPlayer = (tempCurrentPlayer + 1) % activePlayerOrder.length;
    currentPlayerId = activePlayerOrder[tempCurrentPlayer];
    // tempCurrentPlayer was never assigned back to this.currentPlayer
}
```

**Solution**: Directly update `this.currentPlayer` index
```javascript
// NEW CODE (fixed)
while (this.players.get(currentPlayerId).folded || this.players.get(currentPlayerId).allIn) {
    this.currentPlayer = (this.currentPlayer + 1) % activePlayerOrder.length;
    currentPlayerId = activePlayerOrder[this.currentPlayer];
    // this.currentPlayer is now properly updated
}
```

### 2. Enhanced nextPlayer() Method

**File**: `pokerv2/server/game/SingleRoomGame.js`

**Improvements**:
- Added validation for out-of-bounds current player index
- Enhanced folded/all-in player skipping logic
- Added comprehensive debug logging
- Better error handling for edge cases

```javascript
nextPlayer() {
    const activePlayerOrder = this.getActivePlayerOrder();
    
    if (activePlayerOrder.length === 0) {
        console.log('⚠️ No active players for next player');
        return;
    }
    
    // Validate current player index
    if (this.currentPlayer >= activePlayerOrder.length) {
        console.log(`⚠️ Current player index (${this.currentPlayer}) out of bounds, resetting to 0`);
        this.currentPlayer = 0;
    }
    
    let nextPlayer = (this.currentPlayer + 1) % activePlayerOrder.length;
    let iterations = 0;
    
    // Skip folded/all-in players
    while ((this.players.get(activePlayerOrder[nextPlayer]).folded || 
            this.players.get(activePlayerOrder[nextPlayer]).allIn) && 
           nextPlayer !== this.currentPlayer && 
           iterations < activePlayerOrder.length) {
        nextPlayer = (nextPlayer + 1) % activePlayerOrder.length;
        iterations++;
    }
    
    console.log(`🔄 nextPlayer: current=${this.currentPlayer}, next=${nextPlayer}, activePlayers=${activePlayerOrder.length}`);
    
    if (this.isBettingRoundComplete()) {
        console.log('🔄 Betting round complete, moving to next phase');
        this.nextPhase();
    } else {
        this.currentPlayer = nextPlayer;
        if (this.phase !== 'showdown') {
            console.log(`🔄 Continuing betting round, next player: ${nextPlayer}`);
            this.startBettingRound();
        }
    }
}
```

### 3. Fixed startBettingRound() Method

**File**: `pokerv2/server/game/SingleRoomGame.js`

**Problem**: Recursive calls to `nextPlayer()` could cause infinite loops
```javascript
// OLD CODE (problematic)
while (this.isCurrentPlayerFoldedOrAllIn()) {
    this.nextPlayer(); // This could cause infinite recursion
    if (this.isBettingRoundComplete()) {
        this.nextPhase();
        return;
    }
}
```

**Solution**: Direct index advancement instead of recursive calls
```javascript
// NEW CODE (fixed)
const activePlayerOrder = this.getActivePlayerOrder();
let iterations = 0;

while (this.isCurrentPlayerFoldedOrAllIn() && iterations < activePlayerOrder.length) {
    this.currentPlayer = (this.currentPlayer + 1) % activePlayerOrder.length;
    iterations++;
    
    if (this.isBettingRoundComplete()) {
        this.nextPhase();
        return;
    }
}

console.log(`🎯 startBettingRound: currentPlayer=${this.currentPlayer}, currentPlayerId=${this.getCurrentPlayerId()}`);
```

### 4. Enhanced isBettingRoundComplete() Method

**File**: `pokerv2/server/game/SingleRoomGame.js`

**Improvements**:
- Added detailed logging for betting round completion decisions
- Separate logic for preflop vs post-flop phases
- Better debugging information for player bets and actions

```javascript
isBettingRoundComplete() {
    const activePlayers = this.getActivePlayers();
    
    if (activePlayers.length <= 1) {
        console.log('🎯 Betting complete - only one active player');
        return true;
    }
    
    const allBetsEqual = activePlayers.every(p => 
        p.currentBet === this.currentBet || p.allIn
    );
    
    const allHaveActed = activePlayers.every(p => 
        p.hasActed || p.allIn
    );
    
    const allAllIn = activePlayers.every(p => p.allIn);
    
    // For preflop, we need all bets equal (blinds are already posted)
    if (this.phase === 'preflop') {
        const shouldComplete = allBetsEqual;
        console.log('🎯 Preflop betting complete:', shouldComplete, {
            phase: this.phase,
            currentBet: this.currentBet,
            activePlayers: activePlayers.length,
            allBetsEqual,
            playerBets: activePlayers.map(p => ({ 
                id: p.id, 
                name: p.name,
                bet: p.currentBet, 
                allIn: p.allIn 
            }))
        });
        return shouldComplete;
    }
    
    // For post-flop phases, we need all bets equal AND everyone has acted
    const shouldComplete = (allBetsEqual && allHaveActed) || allAllIn || (this.phase === 'river' && allBetsEqual);
    
    console.log('🎯 Post-flop betting complete:', shouldComplete, {
        phase: this.phase,
        currentBet: this.currentBet,
        activePlayers: activePlayers.length,
        allBetsEqual,
        allHaveActed,
        allAllIn,
        playerBets: activePlayers.map(p => ({ 
            id: p.id, 
            name: p.name,
            bet: p.currentBet, 
            allIn: p.allIn,
            hasActed: p.hasActed 
        }))
    });
    
    return shouldComplete;
}
```

### 5. Added Comprehensive Debug Logging

**Files**: `pokerv2/server/game/SingleRoomGame.js`

**Added logging for**:
- Turn validation in `handlePlayerAction()`
- Action completion and turn advancement
- Betting round completion decisions
- Player state changes
- Index validation and corrections

## Testing

Created `test-turn-management-fix.html` with enhanced logging to monitor:
- Turn validation and button enablement
- Action processing and turn advancement
- Betting round completion logic
- Phase transitions

## Expected Results

After these fixes:
1. ✅ Players should be able to act when it's their turn
2. ✅ Turn should advance correctly after actions
3. ✅ Folded/all-in players should be properly skipped
4. ✅ Betting rounds should complete correctly
5. ✅ Phase transitions should work smoothly
6. ✅ Detailed logs should help identify any remaining issues

## Monitoring

Use the debug logs to monitor:
- `🎯 Server getCurrentPlayerId:` - Shows current player validation
- `🔄 nextPlayer:` - Shows turn advancement
- `🎯 Action completed:` - Shows action processing
- `🎯 Betting round complete:` - Shows betting round decisions
- `🎯 startBettingRound:` - Shows betting round initialization

## Files Modified

1. `pokerv2/server/game/SingleRoomGame.js` - Main turn management fixes
2. `pokerv2/test-turn-management-fix.html` - Enhanced test file
3. `pokerv2/TURN_MANAGEMENT_FIX.md` - This documentation

## Related Issues

This fix addresses the core turn management issues that were causing:
- "Player cannot act" errors
- Inactive buttons despite correct turn
- Turn advancement problems
- Betting round completion issues 