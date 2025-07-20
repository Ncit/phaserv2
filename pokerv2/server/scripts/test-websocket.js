const io = require('socket.io-client');

// Test the new single room system
async function testSingleRoom() {
    console.log('🧪 Testing Single Room Poker System...\n');

    // Create two player connections
    const player1 = io('http://localhost:3000');
    const player2 = io('http://localhost:3000');

    // Player 1 setup
    player1.on('connect', () => {
        console.log('✅ Player 1 connected');
        player1.emit('joinGame', {
            name: 'TestPlayer1',
            avatarUrl: 'https://gravatar.com/avatar/test1?s=400&d=robohash&r=x'
        });
    });

    player1.on('gameJoined', (data) => {
        console.log(`✅ Player 1 joined: ${data.playerId} (${data.isReconnection ? 'reconnection' : 'new player'})`);
        console.log(`   Game status: ${data.gameState.status}, Players: ${data.gameState.totalPlayers}`);
    });

    player1.on('gameStateUpdate', (data) => {
        console.log(`📊 Player 1 - Game state: ${data.gameState.status} - ${data.gameState.phase}`);
        if (data.lastAction) {
            console.log(`   Last action: ${data.lastAction.action} by ${data.lastAction.playerName}`);
        }
    });

    player1.on('playerJoined', (data) => {
        console.log(`👤 Player 1 - New player joined: ${data.player.name}`);
    });

    player1.on('error', (data) => {
        console.log(`❌ Player 1 - Error: ${data.message}`);
    });

    // Player 2 setup
    player2.on('connect', () => {
        console.log('✅ Player 2 connected');
        player2.emit('joinGame', {
            name: 'TestPlayer2',
            avatarUrl: 'https://gravatar.com/avatar/test2?s=400&d=robohash&r=x'
        });
    });

    player2.on('gameJoined', (data) => {
        console.log(`✅ Player 2 joined: ${data.playerId} (${data.isReconnection ? 'reconnection' : 'new player'})`);
        console.log(`   Game status: ${data.gameState.status}, Players: ${data.gameState.totalPlayers}`);
    });

    player2.on('gameStateUpdate', (data) => {
        console.log(`📊 Player 2 - Game state: ${data.gameState.status} - ${data.gameState.phase}`);
        if (data.lastAction) {
            console.log(`   Last action: ${data.lastAction.action} by ${data.lastAction.playerName}`);
        }
    });

    player2.on('playerJoined', (data) => {
        console.log(`👤 Player 2 - New player joined: ${data.player.name}`);
    });

    player2.on('error', (data) => {
        console.log(`❌ Player 2 - Error: ${data.message}`);
    });

    // Test reconnection
    setTimeout(async () => {
        console.log('\n🔄 Testing reconnection...');
        
        // Disconnect player 1
        player1.disconnect();
        console.log('📤 Player 1 disconnected');
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reconnect player 1 with same name
        const player1Reconnect = io('http://localhost:3000');
        
        player1Reconnect.on('connect', () => {
            console.log('✅ Player 1 reconnected');
            player1Reconnect.emit('joinGame', {
                name: 'TestPlayer1',
                avatarUrl: 'https://gravatar.com/avatar/test1?s=400&d=robohash&r=x'
            });
        });

        player1Reconnect.on('gameJoined', (data) => {
            console.log(`✅ Player 1 reconnected successfully: ${data.playerId} (${data.isReconnection ? 'reconnection' : 'new player'})`);
            console.log(`   Game status: ${data.gameState.status}, Players: ${data.gameState.totalPlayers}`);
        });

        player1Reconnect.on('error', (data) => {
            console.log(`❌ Player 1 reconnection error: ${data.message}`);
        });

        // Test game start
        setTimeout(() => {
            console.log('\n🎮 Testing game start...');
            player1Reconnect.emit('startGame');
        }, 1000);

        // Test poker actions
        setTimeout(() => {
            console.log('\n🎯 Testing poker actions...');
            player1Reconnect.emit('pokerAction', { action: 'fold' });
        }, 2000);

        // Cleanup
        setTimeout(() => {
            console.log('\n🧹 Cleaning up...');
            player1Reconnect.disconnect();
            player2.disconnect();
            console.log('✅ Test completed');
            process.exit(0);
        }, 3000);

    }, 2000);
}

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start test
testSingleRoom(); 