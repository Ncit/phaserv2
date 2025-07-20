// Simple test script to verify the poker server is working
const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

async function testServer() {
    console.log('🧪 Testing Poker Server...');
    console.log('========================');
    
    try {
        // Test 1: Check if server is running
        console.log('1. Checking server availability...');
        const response = await fetch(`${SERVER_URL}/api/games`);
        if (response.ok) {
            console.log('✅ Server is running and responding');
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Test 2: Connect via WebSocket
        console.log('2. Testing WebSocket connection...');
        const socket = io(SERVER_URL);
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('WebSocket connection timeout'));
            }, 5000);
            
            socket.on('connect', () => {
                clearTimeout(timeout);
                console.log('✅ WebSocket connection successful');
                resolve();
            });
            
            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`WebSocket connection failed: ${error.message}`));
            });
        });
        
        // Test 3: Join a game
        console.log('3. Testing game join...');
        const playerData = {
            name: 'TestPlayer',
            avatarUrl: 'https://gravatar.com/avatar/test?s=400&d=robohash&r=x',
            bank: 1000
        };
        
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Game join timeout'));
            }, 5000);
            
            socket.on('gameJoined', (data) => {
                clearTimeout(timeout);
                console.log('✅ Successfully joined game:', data.gameId);
                console.log(`   Player ID: ${data.playerId}`);
                console.log(`   Players in game: ${data.players.length}`);
                resolve();
            });
            
            socket.on('error', (data) => {
                clearTimeout(timeout);
                reject(new Error(`Game join error: ${data.message}`));
            });
            
            socket.emit('joinGame', playerData);
        });
        
        // Test 4: Send a poker action
        console.log('4. Testing poker action...');
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Poker action timeout'));
            }, 5000);
            
            socket.on('gameStateUpdate', (data) => {
                clearTimeout(timeout);
                console.log('✅ Game state update received');
                console.log(`   Phase: ${data.gameState.phase}`);
                console.log(`   Pot: $${data.gameState.pot}`);
                resolve();
            });
            
            socket.emit('pokerAction', { action: 'fold' });
        });
        
        // Cleanup
        socket.disconnect();
        console.log('5. Testing complete - all tests passed! 🎉');
        console.log('');
        console.log('The server is working correctly and ready for multiplayer games.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('1. Make sure the server is running: npm run dev');
        console.log('2. Check if port 3000 is available');
        console.log('3. Verify all dependencies are installed: npm install');
        process.exit(1);
    }
}

// Run the test
testServer(); 