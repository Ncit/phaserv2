# Auto All-In Feature Documentation

## Overview

The Auto All-In feature automatically converts insufficient raise attempts into all-in actions, providing a better user experience and preventing confusing error messages.

## Problem Solved

Previously, when a player tried to raise but didn't have enough money for the minimum raise amount, the system would show an error like "Raise must be greater than current bet". This was confusing because:

1. Players expected to be able to go all-in when they couldn't afford minimum raises
2. The error message didn't clearly explain what was happening
3. It interrupted the flow of the game

## Solution

The system now automatically detects when a player doesn't have sufficient funds for a minimum raise and converts the action to an all-in instead of showing an error.

## Implementation

### FastGameScene.js (Multiplayer Mode)

```javascript
handleRaise() {
    if (!this.networkManager.isMyTurn()) return;
    
    try {
        const myPlayer = this.networkManager.getMyPlayer();
        let totalBetAmount;
        
        if (this.gameState.currentBet === 0) {
            // No current bet, so minimum raise is big blind
            totalBetAmount = this.gameState.bigBlind;
        } else {
            // Current bet exists, so raise must be at least current bet + 10
            totalBetAmount = this.gameState.currentBet + 10;
        }
        
        // Check if player has enough money for the minimum raise
        if (myPlayer.bank < totalBetAmount - myPlayer.currentBet) {
            // Player doesn't have enough for minimum raise, make it all-in
            console.log('FastGameScene: Insufficient funds for minimum raise, making all-in');
            this.networkManager.sendPokerAction('allIn', myPlayer.bank);
        } else {
            // Player has enough money, proceed with normal raise
            this.networkManager.sendPokerAction('raise', totalBetAmount);
        }
        
        this.disablePlayerActions();
    } catch (error) {
        console.error('FastGameScene: Error sending raise action:', error);
    }
}
```

### AIBotScene.js (AI Mode)

```javascript
handleRaise() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (!currentPlayer.isAI) {
        // Calculate proper raise amount
        let raiseAmount;
        if (this.gameState.currentBet === 0) {
            // No current bet, so minimum raise is big blind
            raiseAmount = this.gameState.bigBlind;
        } else {
            // Current bet exists, so raise must be at least double the current bet
            raiseAmount = this.gameState.currentBet * 2;
        }
        
        // Check if player has enough money for the minimum raise
        const additionalAmountNeeded = raiseAmount - currentPlayer.currentBet;
        if (currentPlayer.bank < additionalAmountNeeded) {
            // Player doesn't have enough for minimum raise, make it all-in
            console.log('AIBotScene: Insufficient funds for minimum raise, making all-in');
            this.raisePlayer(currentPlayer.id, currentPlayer.bank);
        } else {
            // Player has enough money, proceed with normal raise
            this.raisePlayer(currentPlayer.id, raiseAmount);
        }
        
        this.disablePlayerActions();
    }
}
```

## Logic Flow

1. **Calculate Minimum Raise**: Determine the minimum amount required for a valid raise
   - Preflop: Big blind amount
   - Postflop: Current bet + minimum increment (10 for multiplayer, double for AI)

2. **Check Player Funds**: Compare player's bank with the additional amount needed
   - Additional amount = Minimum raise - Player's current bet

3. **Auto-Convert Decision**:
   - If player bank < additional amount needed → Send all-in action
   - If player bank >= additional amount needed → Send normal raise action

4. **Server Processing**: Server handles both actions normally
   - All-in actions are always valid regardless of current bet
   - Raise actions are validated against minimum requirements

## Test Scenarios

### Scenario 1: Preflop with Low Bank
- **Setup**: Current bet: $0, Big blind: $20, Player bank: $15
- **Action**: Player clicks "Raise" button
- **Result**: System automatically sends all-in action with $15
- **Reason**: Minimum raise ($20) > Player bank ($15)

### Scenario 2: Postflop with Insufficient Raise
- **Setup**: Current bet: $100, Player current bet: $50, Player bank: $30
- **Action**: Player clicks "Raise" button
- **Result**: System automatically sends all-in action with $30
- **Reason**: Minimum raise ($110) requires $60 additional, but player only has $30

### Scenario 3: Sufficient Funds
- **Setup**: Current bet: $50, Player current bet: $50, Player bank: $200
- **Action**: Player clicks "Raise" button
- **Result**: System sends normal raise action with $60
- **Reason**: Player has sufficient funds for minimum raise

## Benefits

1. **Better User Experience**: No confusing error messages
2. **Intuitive Behavior**: Matches player expectations
3. **Consistent Logic**: Works the same in both multiplayer and AI modes
4. **Error Prevention**: Eliminates validation errors
5. **Poker Rules Compliance**: All-in is always a valid action

## Technical Notes

- **Client-Side Only**: This feature only affects client-side raise button logic
- **Server Security**: Server-side validation remains unchanged for security
- **All-In Validity**: All-in actions are always valid regardless of current bet
- **Logging**: Console logs confirm when auto-conversion occurs
- **Backward Compatibility**: Existing raise and all-in functionality unchanged

## Files Modified

- `src/scenes/FastGameScene.js` - Updated `handleRaise()` method
- `src/scenes/AIBotScene.js` - Updated `handleRaise()` method

## Testing

1. Start the poker server: `cd pokerv2/server && npm run dev`
2. Open the game in multiple browser tabs
3. Join the game with different players
4. Set all players to ready and start the game
5. Create scenarios with insufficient funds for minimum raises
6. Click the "Raise" button and observe automatic all-in actions
7. Check browser console for confirmation logs

## Related Features

- [All-In Fix](./ALLIN_FIX.md) - Fixed all-in action handling
- [Raise Fix](./RAISE_FIX.md) - Fixed raise amount calculations
- [Lobby System](./LOBBY_SYSTEM.md) - Multiplayer lobby functionality
- [Network Manager](./NETWORK_MANAGER.md) - WebSocket communication 