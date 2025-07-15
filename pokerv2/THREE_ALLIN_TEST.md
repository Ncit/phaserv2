# Three Players All-In Test Documentation

## Overview

This test verifies that the auto all-in feature works correctly when multiple players have insufficient funds for minimum raises, and that the all-in functionality handles multiple all-in players properly.

## Test Objective

The primary goal is to ensure that:
1. **Auto All-In Conversion**: When players can't afford minimum raises, the system automatically converts their action to all-in
2. **Multiple All-In Players**: Three players can go all-in in sequence without errors
3. **Pot Calculation**: Correct pot distribution with multiple all-in amounts
4. **Game Flow**: Proper betting round completion with all-in players
5. **Showdown Logic**: Hand evaluation works with multiple all-in players

## Test Scenario

### Initial Setup
- **Player 1 (Никита)**: $100 bank
- **Player 2 (Анна)**: $50 bank  
- **Player 3 (Михаил)**: $25 bank

### Expected Sequence
1. Player 1 clicks "Raise" → Auto converts to all-in ($100)
2. Player 2 clicks "Raise" → Auto converts to all-in ($50)
3. Player 3 clicks "Raise" → Auto converts to all-in ($25)
4. Game proceeds to showdown with all three players all-in

## Technical Implementation

### Auto All-In Logic (FastGameScene.js)

```javascript
handleRaise() {
    // Calculate minimum raise amount
    let totalBetAmount;
    if (this.gameState.currentBet === 0) {
        totalBetAmount = this.gameState.bigBlind; // $20
    } else {
        totalBetAmount = this.gameState.currentBet + 10;
    }
    
    // Check if player has enough money for minimum raise
    if (myPlayer.bank < totalBetAmount - myPlayer.currentBet) {
        // Auto convert to all-in
        console.log('FastGameScene: Insufficient funds, making all-in');
        this.networkManager.sendPokerAction('allIn', myPlayer.bank);
    } else {
        // Normal raise
        this.networkManager.sendPokerAction('raise', totalBetAmount);
    }
}
```

### Server All-In Handling (PokerGame.js)

```javascript
allInPlayer(playerId) {
    const player = this.players.get(playerId);
    const allInAmount = player.bank;
    
    // Update player's bet and bank
    player.currentBet += allInAmount;
    player.bank -= allInAmount;
    this.pot += allInAmount;
    
    // If all-in amount is greater than current bet, update current bet
    if (player.currentBet > this.currentBet) {
        this.currentBet = player.currentBet;
        // Reset action tracking for other players
        for (const p of this.players.values()) {
            if (p.id !== playerId) {
                p.hasActed = false;
            }
        }
    }
    
    player.hasActed = true;
    player.allIn = true;
    
    return {
        action: 'allIn',
        playerId,
        playerName: player.name,
        amount: allInAmount
    };
}
```

## Test Instructions

### Phase 1: Setup
1. Start the poker server: `cd pokerv2/server && npm run dev`
2. Open the game in three different browser tabs
3. Join the game with three different players (Никита, Анна, Михаил)
4. Set all players to ready and start the game
5. Verify all players have their starting bank amounts

### Phase 2: Create All-In Scenario
1. Wait for the first betting round (preflop)
2. Have Player 1 (Никита) click "Raise" button
3. Verify in console: "FastGameScene: Insufficient funds for minimum raise, making all-in"
4. Verify Player 1 goes all-in with $100
5. Have Player 2 (Анна) click "Raise" button
6. Verify Player 2 goes all-in with $50
7. Have Player 3 (Михаил) click "Raise" button
8. Verify Player 3 goes all-in with $25

### Phase 3: Verify Game Flow
1. Check that the betting round completes properly
2. Verify community cards are dealt (flop, turn, river)
3. Check that all players show as [ALL IN] in their display
4. Verify the pot shows the correct total ($175)
5. Wait for showdown to complete
6. Verify hand evaluation works with all three players
7. Check that the winner receives the pot

### Phase 4: Edge Case Testing
1. Start a new hand
2. Test with different player order (different player goes first)
3. Test with one player having exactly enough for minimum raise
4. Test with players having very small amounts ($5, $10)
5. Verify auto all-in still works correctly

## Expected Results

### Console Logs
- `FastGameScene: Insufficient funds for minimum raise, making all-in` (3 times)
- `Player [ID] performed action: allIn` (3 times)
- `🎮 Game started in main room`
- `🎰 Single Room Poker Server running on port 3000`

### UI Updates
- All three players show [ALL IN] status
- Pot displays correct total ($175)
- Player bank amounts show $0 after all-in
- Action buttons are disabled for all-in players
- Game proceeds to showdown automatically

### Game Flow
- Betting round completes after all players go all-in
- Community cards are dealt (flop, turn, river)
- Showdown evaluates all three hands
- Winner receives the entire pot
- Next round button appears for new hand

## Alternative Test Scenarios

### Scenario A: Mixed Actions
One player calls, two players go all-in
- Player 1: Call (has enough money)
- Player 2: Raise → Auto all-in ($50)
- Player 3: Raise → Auto all-in ($25)

### Scenario B: Sequential All-In
Players go all-in one by one in different betting rounds
- Preflop: Player 1 all-in
- Flop: Player 2 all-in
- Turn: Player 3 all-in

### Scenario C: Edge Cases
Test with very small amounts and exact amounts
- Player 1: $5 bank
- Player 2: $10 bank (exactly minimum raise)
- Player 3: $15 bank

## Success Criteria

- **Auto Conversion**: All three raise attempts convert to all-in automatically
- **Correct Amounts**: Players go all-in with their exact bank amounts
- **Pot Calculation**: Total pot equals sum of all all-in amounts
- **Game Flow**: Betting round completes and proceeds to showdown
- **UI Updates**: All players show [ALL IN] status correctly
- **No Errors**: No console errors during the process
- **Showdown**: Hand evaluation works with multiple all-in players

## Debugging Information

### Key Debug Points
```javascript
// Check browser console for these messages:
"FastGameScene: Insufficient funds for minimum raise, making all-in"
"Player [ID] performed action: allIn"

// Check server console for:
"Player [ID] performed action: allIn"
"🎮 Game started in main room"

// Verify player states:
- All players show [ALL IN] status
- Bank amounts are $0
- Pot shows correct total
- Action buttons are disabled
```

### Important Notes
- This test requires exactly 3 players to work properly
- All players must have insufficient funds for minimum raises
- The auto all-in feature should trigger automatically
- Server should handle multiple all-in players correctly
- Pot calculation should be accurate with different all-in amounts

## Files Created

1. **test-three-allin.html** - Main test page with comprehensive documentation
2. **test-allin-setup.js** - Utility script for test setup and validation
3. **THREE_ALLIN_TEST.md** - This documentation file

## Related Tests

- **test-auto-allin.html** - General auto all-in feature test
- **test-allin-fix.html** - All-in functionality test
- **test-raise-fix.html** - Raise functionality test
- **test-lobby-system.html** - Lobby system test

## Quick Links

- [🎮 Play Multiplayer Game](index.html)
- [🤖 Test AI Bot Game](test-ai-bot.html)
- [🏠 Test Lobby System](test-lobby-system.html)
- [💰 Test Raise Fix](test-raise-fix.html)
- [🎯 Test All-In Fix](test-allin-fix.html)
- [🔄 Test Auto All-In](test-auto-allin.html)
- [🃏 Test Card Container Fix](test-card-container-fix.html) 