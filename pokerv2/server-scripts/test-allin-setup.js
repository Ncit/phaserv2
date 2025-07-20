// Test Setup Script for Three Players All-In Scenario
// This script helps set up the test by modifying player bank amounts

console.log('🎯 Three Players All-In Test Setup Script');
console.log('📋 This script helps set up the test scenario');

// Test configuration
const TEST_CONFIG = {
    player1: {
        name: 'Никита',
        bank: 100,  // Will auto all-in when trying to raise
        description: 'Has $100, will auto all-in when trying to raise'
    },
    player2: {
        name: 'Анна', 
        bank: 50,   // Will auto all-in when trying to raise
        description: 'Has $50, will auto all-in when trying to raise'
    },
    player3: {
        name: 'Михаил',
        bank: 25,   // Will auto all-in when trying to raise
        description: 'Has $25, will auto all-in when trying to raise'
    }
};

// Game settings
const GAME_SETTINGS = {
    bigBlind: 20,
    smallBlind: 10,
    minimumRaise: 10
};

// Calculate expected results
function calculateExpectedResults() {
    console.log('\n💰 Expected Results:');
    console.log('==================');
    
    const totalPot = TEST_CONFIG.player1.bank + TEST_CONFIG.player2.bank + TEST_CONFIG.player3.bank;
    
    console.log(`Total Pot: $${totalPot}`);
    console.log(`Player 1 (${TEST_CONFIG.player1.name}): $${TEST_CONFIG.player1.bank} → All-in`);
    console.log(`Player 2 (${TEST_CONFIG.player2.name}): $${TEST_CONFIG.player2.bank} → All-in`);
    console.log(`Player 3 (${TEST_CONFIG.player3.name}): $${TEST_CONFIG.player3.bank} → All-in`);
    
    console.log('\n🎯 Auto All-In Triggers:');
    console.log('=======================');
    
    // Check if each player will trigger auto all-in
    Object.entries(TEST_CONFIG).forEach(([key, player]) => {
        const canAffordMinimumRaise = player.bank >= GAME_SETTINGS.bigBlind;
        const willAutoAllIn = !canAffordMinimumRaise;
        
        console.log(`${player.name} ($${player.bank}): ${willAutoAllIn ? '✅ WILL auto all-in' : '❌ WON\'T auto all-in'}`);
        if (willAutoAllIn) {
            console.log(`  → Minimum raise needed: $${GAME_SETTINGS.bigBlind}`);
            console.log(`  → Player bank: $${player.bank}`);
            console.log(`  → Insufficient by: $${GAME_SETTINGS.bigBlind - player.bank}`);
        }
    });
}

// Test scenarios
function generateTestScenarios() {
    console.log('\n🧪 Test Scenarios:');
    console.log('=================');
    
    console.log('\n1. All Three Auto All-In:');
    console.log('   - All players click "Raise"');
    console.log('   - All automatically convert to all-in');
    console.log('   - Expected pot: $175');
    
    console.log('\n2. Mixed Actions:');
    console.log('   - Player 1: Call (if has enough)');
    console.log('   - Player 2: Raise → Auto all-in ($50)');
    console.log('   - Player 3: Raise → Auto all-in ($25)');
    
    console.log('\n3. Sequential All-In:');
    console.log('   - Preflop: Player 1 all-in');
    console.log('   - Flop: Player 2 all-in');
    console.log('   - Turn: Player 3 all-in');
}

// Debug information
function showDebugInfo() {
    console.log('\n🔍 Debug Information:');
    console.log('====================');
    
    console.log('\nExpected Console Logs:');
    console.log('- "FastGameScene: Insufficient funds for minimum raise, making all-in" (3 times)');
    console.log('- "Player [ID] performed action: allIn" (3 times)');
    console.log('- "🎮 Game started in main room"');
    
    console.log('\nExpected UI Updates:');
    console.log('- All players show [ALL IN] status');
    console.log('- Pot displays $175');
    console.log('- Player banks show $0');
    console.log('- Action buttons disabled for all-in players');
}

// Validation functions
function validateTestSetup() {
    console.log('\n✅ Validation:');
    console.log('==============');
    
    let allValid = true;
    
    // Check if all players will trigger auto all-in
    Object.entries(TEST_CONFIG).forEach(([key, player]) => {
        const willAutoAllIn = player.bank < GAME_SETTINGS.bigBlind;
        if (!willAutoAllIn) {
            console.log(`❌ ${player.name} won't trigger auto all-in (bank: $${player.bank}, min raise: $${GAME_SETTINGS.bigBlind})`);
            allValid = false;
        } else {
            console.log(`✅ ${player.name} will trigger auto all-in`);
        }
    });
    
    if (allValid) {
        console.log('\n🎉 Test setup is valid! All players will trigger auto all-in.');
    } else {
        console.log('\n⚠️  Test setup needs adjustment. Some players won\'t trigger auto all-in.');
    }
    
    return allValid;
}

// Instructions
function showInstructions() {
    console.log('\n📋 Test Instructions:');
    console.log('====================');
    
    console.log('\n1. Start the server:');
    console.log('   cd pokerv2/server && npm run dev');
    
    console.log('\n2. Open three browser tabs and join the game');
    
    console.log('\n3. Set all players to ready and start the game');
    
    console.log('\n4. In the first betting round (preflop):');
    console.log('   - Have each player click "Raise" button');
    console.log('   - Verify auto all-in conversion in console');
    console.log('   - Check that all players show [ALL IN] status');
    
    console.log('\n5. Verify game flow:');
    console.log('   - Betting round completes');
    console.log('   - Community cards are dealt');
    console.log('   - Showdown occurs');
    console.log('   - Winner receives pot');
}

// Run the setup
function runSetup() {
    console.log('🎰 Three Players All-In Test Setup');
    console.log('==================================');
    
    calculateExpectedResults();
    generateTestScenarios();
    showDebugInfo();
    validateTestSetup();
    showInstructions();
    
    console.log('\n🚀 Ready to test! Follow the instructions above.');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.TEST_ALLIN_SETUP = {
        runSetup,
        TEST_CONFIG,
        GAME_SETTINGS,
        calculateExpectedResults,
        validateTestSetup
    };
    
    console.log('💡 Run TEST_ALLIN_SETUP.runSetup() to see the test configuration');
}

// Run if this is executed directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runSetup,
        TEST_CONFIG,
        GAME_SETTINGS
    };
} else {
    // Auto-run in browser
    runSetup();
} 