# Raise Fix Documentation

## Problem Description

When players attempted to use the raise button in the multiplayer poker game, they received the error:
```
"Raise must be greater than current bet"
```

This error was occurring because there was a mismatch between how the client and server were handling raise amounts.

## Root Cause Analysis

The issue was caused by inconsistent handling of raise amounts between client and server:

### Client-Side Issue (FastGameScene.js)
The `handleRaise` method was calculating raise amounts incorrectly:
```javascript
// Before (Problematic)
if (this.gameState.currentBet === 0) {
    raiseAmount = this.gameState.bigBlind;
} else {
    raiseAmount = this.gameState.currentBet * 2; // ❌ Wrong calculation
}
```

### Server-Side Issue (PokerGame.js)
The `raisePlayer` method was expecting the amount parameter to be the **additional amount** to add to the current bet, but the client was sending the **total bet amount**.

## The Fix

### 1. Fixed Client-Side Raise Logic

**Before (Problematic Code):**
```javascript
handleRaise() {
    const myPlayer = this.networkManager.getMyPlayer();
    let raiseAmount;
    
    if (this.gameState.currentBet === 0) {
        raiseAmount = this.gameState.bigBlind;
    } else {
        raiseAmount = this.gameState.currentBet * 2; // ❌ Wrong
    }
    
    raiseAmount = Math.min(raiseAmount, myPlayer.bank);
    this.networkManager.sendPokerAction('raise', raiseAmount);
}
```

**After (Fixed Code):**
```javascript
handleRaise() {
    const myPlayer = this.networkManager.getMyPlayer();
    let totalBetAmount;
    
    if (this.gameState.currentBet === 0) {
        // No current bet, so minimum raise is big blind
        totalBetAmount = this.gameState.bigBlind;
    } else {
        // Current bet exists, so raise must be at least current bet + 10
        totalBetAmount = this.gameState.currentBet + 10;
    }
    
    // Ensure we don't exceed player's bank
    totalBetAmount = Math.min(totalBetAmount, myPlayer.bank);
    
    // Calculate the additional amount needed
    const additionalAmount = totalBetAmount - myPlayer.currentBet;
    
    console.log('FastGameScene: Raise calculation:', {
        currentBet: this.gameState.currentBet,
        myCurrentBet: myPlayer.currentBet,
        totalBetAmount,
        additionalAmount,
        myBank: myPlayer.bank
    });
    
    this.networkManager.sendPokerAction('raise', totalBetAmount);
}
```

### 2. Fixed Server-Side Raise Logic

**Before (Problematic Code):**
```javascript
raisePlayer(playerId, amount) {
    const player = this.players.get(playerId);
    const raiseAmount = Math.min(amount, player.bank);
    
    if (raiseAmount <= this.currentBet) {
        throw new Error('Raise must be greater than current bet');
    }
    
    player.currentBet += raiseAmount; // ❌ Treating amount as additional
    player.bank -= raiseAmount;
    this.pot += raiseAmount;
    this.currentBet = player.currentBet;
}
```

**After (Fixed Code):**
```javascript
raisePlayer(playerId, amount) {
    const player = this.players.get(playerId);
    
    // The amount parameter is the total bet amount the player wants to bet
    const totalBetAmount = Math.min(amount, player.bank);
    
    // Calculate the additional amount needed
    const additionalAmount = totalBetAmount - player.currentBet;
    
    // Validate that this is a valid raise
    if (totalBetAmount <= this.currentBet) {
        throw new Error('Raise must be greater than current bet');
    }
    
    // Update player's bet and bank
    player.currentBet = totalBetAmount;
    player.bank -= additionalAmount;
    this.pot += additionalAmount;
    this.currentBet = totalBetAmount;
}
```

## Key Improvements

1. **Consistent Amount Handling**: Client and server now both use total bet amounts
2. **Proper Raise Calculation**: 
   - If no current bet: raise by big blind amount
   - If current bet exists: raise by current bet + 10 (minimum raise)
3. **Better Validation**: Server validates against total bet amount, not additional amount
4. **Clear Logging**: Added detailed logging to help debug raise calculations

## Benefits of the Fix

1. **Eliminates Raise Error**: Players can now raise without getting validation errors
2. **Proper Poker Rules**: Follows standard poker raise rules (minimum raise = current bet + minimum increment)
3. **Consistent Logic**: Client and server now handle raise amounts consistently
4. **Better User Experience**: No more confusing error messages when trying to raise

## Testing

A test page `test-raise-fix.html` was created to verify the fix:

- Tests all poker actions (fold, call/check, raise, all-in)
- Shows real-time game state information
- Displays detailed calculation logs
- Tests raise functionality without errors
- Shows proper button states based on game conditions

## Files Modified

1. **`src/scenes/FastGameScene.js`**
   - Fixed `handleRaise` method with proper raise calculation
   - Added detailed logging for debugging
   - Changed to send total bet amount instead of additional amount

2. **`server/game/PokerGame.js`**
   - Fixed `raisePlayer` method to handle total bet amounts
   - Updated validation logic
   - Fixed bank and pot calculations

3. **`test-raise-fix.html`** (new)
   - Comprehensive test page for all poker actions

## Verification

To verify the fix is working:

1. Start the server: `cd pokerv2/server && npm run dev`
2. Open `test-raise-fix.html` in a browser
3. Connect to server and join a game
4. Wait for your turn and test the raise button
5. Verify that no "Raise must be greater than current bet" errors occur
6. Check the logs for proper raise calculations

## Poker Rules Compliance

The fix ensures that raise actions follow proper poker rules:

- **Minimum Raise**: When there's a current bet, the minimum raise is current bet + minimum increment (10)
- **Big Blind Raise**: When there's no current bet, the minimum raise is the big blind amount
- **Bank Validation**: Raises cannot exceed the player's bank
- **Proper Betting**: Total bet amounts are calculated and validated correctly

The game should now handle raise actions correctly without any validation errors! 🎰 