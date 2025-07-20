#!/usr/bin/env node

/**
 * Poker Game Server Load Testing Tool
 * Tests WebSocket connections, game creation, player management, and game actions
 */

const WebSocket = require('ws');
const readline = require('readline');

// Configuration
const CONFIG = {
    serverUrl: 'ws://localhost:3000', // Change to your server URL
    testDuration: 60000, // 60 seconds
    connectionInterval: 100, // New connection every 100ms
    maxConnections: 100, // Maximum concurrent connections
    gameActions: {
        joinGame: true,
        ready: true,
        fold: true,
        call: true,
        raise: true,
        chat: true
    },
    actionInterval: {
        min: 1000, // Minimum time between actions (ms)
        max: 5000  // Maximum time between actions (ms)
    }
};

// Test statistics
const stats = {
    connections: {
        total: 0,
        successful: 0,
        failed: 0,
        active: 0
    },
    messages: {
        sent: 0,
        received: 0,
        errors: 0
    },
    games: {
        created: 0,
        joined: 0,
        active: 0
    },
    actions: {
        total: 0,
        successful: 0,
        failed: 0
    },
    performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity
    },
    errors: []
};

// Active connections and games
const connections = new Map();
const games = new Map();
let testStartTime = null;
let testEndTime = null;

// Utility functions
const log = (message, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    const color = {
        'INFO': '\x1b[36m',   // Cyan
        'SUCCESS': '\x1b[32m', // Green
        'WARNING': '\x1b[33m', // Yellow
        'ERROR': '\x1b[31m',   // Red
        'RESET': '\x1b[0m'     // Reset
    };
    console.log(`${color[type]}[${timestamp}] ${message}${color.RESET}`);
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomDelay = () => randomInt(CONFIG.actionInterval.min, CONFIG.actionInterval.max);

// Player data generator
const generatePlayerData = (id) => ({
    name: `TestPlayer${id}`,
    avatarUrl: 'assets/avatar.png',
    bank: randomInt(1000, 10000),
    vk_user_id: id,
    telegram_user_id: id
});

// WebSocket connection wrapper
class TestConnection {
    constructor(id) {
        this.id = id;
        this.ws = null;
        this.connected = false;
        this.playerData = generatePlayerData(id);
        this.gameId = null;
        this.lastActionTime = 0;
        this.responseTimes = [];
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(CONFIG.serverUrl);
                
                this.ws.on('open', () => {
                    this.connected = true;
                    stats.connections.successful++;
                    stats.connections.active++;
                    connections.set(this.id, this);
                    log(`Connection ${this.id} established`, 'SUCCESS');
                    resolve();
                });

                this.ws.on('message', (data) => {
                    this.handleMessage(data);
                });

                this.ws.on('error', (error) => {
                    stats.connections.failed++;
                    stats.errors.push(`Connection ${this.id} error: ${error.message}`);
                    log(`Connection ${this.id} error: ${error.message}`, 'ERROR');
                    reject(error);
                });

                this.ws.on('close', () => {
                    this.connected = false;
                    stats.connections.active--;
                    connections.delete(this.id);
                    log(`Connection ${this.id} closed`, 'WARNING');
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!this.connected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                stats.connections.failed++;
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.ws && this.connected) {
            this.ws.close();
        }
    }

    send(message) {
        if (!this.connected) return false;
        
        try {
            const startTime = Date.now();
            this.ws.send(JSON.stringify(message));
            stats.messages.sent++;
            
            // Track response time
            setTimeout(() => {
                const responseTime = Date.now() - startTime;
                this.responseTimes.push(responseTime);
                stats.performance.avgResponseTime = 
                    this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
                stats.performance.maxResponseTime = Math.max(stats.performance.maxResponseTime, responseTime);
                stats.performance.minResponseTime = Math.min(stats.performance.minResponseTime, responseTime);
            }, 100);
            
            return true;
        } catch (error) {
            stats.messages.errors++;
            stats.errors.push(`Send error for connection ${this.id}: ${error.message}`);
            return false;
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            stats.messages.received++;
            
            // Handle different message types
            switch (message.type) {
                case 'gameJoined':
                    this.gameId = message.gameId;
                    stats.games.joined++;
                    log(`Player ${this.id} joined game ${this.gameId}`, 'SUCCESS');
                    break;
                    
                case 'gameStateChanged':
                    if (message.gameStarted) {
                        log(`Game ${this.gameId} started`, 'SUCCESS');
                    }
                    break;
                    
                case 'error':
                    stats.errors.push(`Server error for connection ${this.id}: ${message.error}`);
                    log(`Server error for connection ${this.id}: ${message.error}`, 'ERROR');
                    break;
            }
        } catch (error) {
            stats.errors.push(`Message parsing error for connection ${this.id}: ${error.message}`);
        }
    }

    // Game actions
    joinGame() {
        if (!this.connected) return false;
        
        const message = {
            type: 'joinGame',
            playerData: this.playerData
        };
        
        return this.send(message);
    }

    setReady() {
        if (!this.connected || !this.gameId) return false;
        
        const message = {
            type: 'setReady',
            gameId: this.gameId
        };
        
        return this.send(message);
    }

    fold() {
        if (!this.connected || !this.gameId) return false;
        
        const message = {
            type: 'fold',
            gameId: this.gameId
        };
        
        return this.send(message);
    }

    call() {
        if (!this.connected || !this.gameId) return false;
        
        const message = {
            type: 'call',
            gameId: this.gameId
        };
        
        return this.send(message);
    }

    raise(amount) {
        if (!this.connected || !this.gameId) return false;
        
        const message = {
            type: 'raise',
            gameId: this.gameId,
            amount: amount || randomInt(20, 100)
        };
        
        return this.send(message);
    }

    sendChat(text) {
        if (!this.connected || !this.gameId) return false;
        
        const message = {
            type: 'chat',
            gameId: this.gameId,
            text: text || `Test message from player ${this.id}`
        };
        
        return this.send(message);
    }
}

// Load test controller
class LoadTest {
    constructor() {
        this.running = false;
        this.connectionTimer = null;
        this.actionTimer = null;
    }

    async start() {
        log('Starting load test...', 'INFO');
        log(`Target: ${CONFIG.maxConnections} connections over ${CONFIG.testDuration}ms`, 'INFO');
        log(`Server: ${CONFIG.serverUrl}`, 'INFO');
        
        testStartTime = Date.now();
        this.running = true;
        
        // Start connection creation
        this.startConnectionCreation();
        
        // Start action simulation
        this.startActionSimulation();
        
        // Set test duration
        setTimeout(() => {
            this.stop();
        }, CONFIG.testDuration);
    }

    startConnectionCreation() {
        let connectionId = 0;
        
        this.connectionTimer = setInterval(() => {
            if (!this.running || stats.connections.total >= CONFIG.maxConnections) {
                clearInterval(this.connectionTimer);
                return;
            }
            
            connectionId++;
            stats.connections.total++;
            
            const connection = new TestConnection(connectionId);
            connection.connect()
                .then(() => {
                    // Join a game after connection
                    setTimeout(() => {
                        connection.joinGame();
                    }, randomDelay());
                })
                .catch((error) => {
                    log(`Failed to create connection ${connectionId}: ${error.message}`, 'ERROR');
                });
                
        }, CONFIG.connectionInterval);
    }

    startActionSimulation() {
        this.actionTimer = setInterval(() => {
            if (!this.running) {
                clearInterval(this.actionTimer);
                return;
            }
            
            // Randomly select a connected player to perform an action
            const activeConnections = Array.from(connections.values());
            if (activeConnections.length === 0) return;
            
            const connection = activeConnections[Math.floor(Math.random() * activeConnections.length)];
            const now = Date.now();
            
            // Ensure minimum time between actions
            if (now - connection.lastActionTime < CONFIG.actionInterval.min) return;
            
            connection.lastActionTime = now;
            stats.actions.total++;
            
            // Randomly select an action
            const actions = [];
            if (CONFIG.gameActions.joinGame) actions.push(() => connection.joinGame());
            if (CONFIG.gameActions.ready) actions.push(() => connection.setReady());
            if (CONFIG.gameActions.fold) actions.push(() => connection.fold());
            if (CONFIG.gameActions.call) actions.push(() => connection.call());
            if (CONFIG.gameActions.raise) actions.push(() => connection.raise());
            if (CONFIG.gameActions.chat) actions.push(() => connection.sendChat());
            
            if (actions.length > 0) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                const success = action();
                
                if (success) {
                    stats.actions.successful++;
                } else {
                    stats.actions.failed++;
                }
            }
            
        }, 1000); // Check for actions every second
    }

    stop() {
        log('Stopping load test...', 'INFO');
        this.running = false;
        
        if (this.connectionTimer) {
            clearInterval(this.connectionTimer);
        }
        
        if (this.actionTimer) {
            clearInterval(this.actionTimer);
        }
        
        // Close all connections
        connections.forEach(connection => {
            connection.disconnect();
        });
        
        testEndTime = Date.now();
        this.printResults();
    }

    printResults() {
        const duration = testEndTime - testStartTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 LOAD TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log(`\n⏱️  Test Duration: ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
        console.log(`🎯 Target Connections: ${CONFIG.maxConnections}`);
        console.log(`🌐 Server URL: ${CONFIG.serverUrl}`);
        
        console.log('\n📈 CONNECTION STATISTICS:');
        console.log(`   Total Attempted: ${stats.connections.total}`);
        console.log(`   Successful: ${stats.connections.successful}`);
        console.log(`   Failed: ${stats.connections.failed}`);
        console.log(`   Success Rate: ${((stats.connections.successful / stats.connections.total) * 100).toFixed(1)}%`);
        console.log(`   Active at End: ${stats.connections.active}`);
        
        console.log('\n💬 MESSAGE STATISTICS:');
        console.log(`   Sent: ${stats.messages.sent}`);
        console.log(`   Received: ${stats.messages.received}`);
        console.log(`   Errors: ${stats.messages.errors}`);
        
        console.log('\n🎮 GAME STATISTICS:');
        console.log(`   Games Joined: ${stats.games.joined}`);
        console.log(`   Active Games: ${stats.games.active}`);
        
        console.log('\n⚡ ACTION STATISTICS:');
        console.log(`   Total Actions: ${stats.actions.total}`);
        console.log(`   Successful: ${stats.actions.successful}`);
        console.log(`   Failed: ${stats.actions.failed}`);
        console.log(`   Success Rate: ${((stats.actions.successful / stats.actions.total) * 100).toFixed(1)}%`);
        
        console.log('\n🚀 PERFORMANCE METRICS:');
        console.log(`   Average Response Time: ${stats.performance.avgResponseTime.toFixed(1)}ms`);
        console.log(`   Minimum Response Time: ${stats.performance.minResponseTime === Infinity ? 'N/A' : stats.performance.minResponseTime}ms`);
        console.log(`   Maximum Response Time: ${stats.performance.maxResponseTime}ms`);
        console.log(`   Connections/Second: ${(stats.connections.successful / (duration / 1000)).toFixed(1)}`);
        console.log(`   Messages/Second: ${(stats.messages.sent / (duration / 1000)).toFixed(1)}`);
        
        if (stats.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            stats.errors.slice(0, 10).forEach(error => {
                console.log(`   - ${error}`);
            });
            if (stats.errors.length > 10) {
                console.log(`   ... and ${stats.errors.length - 10} more errors`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Performance assessment
        this.assessPerformance();
    }

    assessPerformance() {
        console.log('\n📊 PERFORMANCE ASSESSMENT:');
        
        const connectionSuccessRate = (stats.connections.successful / stats.connections.total) * 100;
        const actionSuccessRate = (stats.actions.successful / stats.actions.total) * 100;
        const avgResponseTime = stats.performance.avgResponseTime;
        
        if (connectionSuccessRate >= 95 && actionSuccessRate >= 90 && avgResponseTime < 100) {
            console.log('✅ EXCELLENT: Server handles load very well');
        } else if (connectionSuccessRate >= 90 && actionSuccessRate >= 80 && avgResponseTime < 200) {
            console.log('🟡 GOOD: Server performs well under load');
        } else if (connectionSuccessRate >= 80 && actionSuccessRate >= 70 && avgResponseTime < 500) {
            console.log('🟠 ACCEPTABLE: Server has some performance issues');
        } else {
            console.log('🔴 POOR: Server struggles under load');
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (connectionSuccessRate < 95) {
            console.log('   - Consider increasing server resources');
            console.log('   - Check WebSocket connection limits');
        }
        
        if (actionSuccessRate < 90) {
            console.log('   - Optimize game logic processing');
            console.log('   - Check database connection pooling');
        }
        
        if (avgResponseTime > 200) {
            console.log('   - Optimize message handling');
            console.log('   - Consider caching frequently accessed data');
        }
        
        if (stats.errors.length > 0) {
            console.log('   - Review error logs for specific issues');
            console.log('   - Implement better error handling');
        }
    }
}

// CLI interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🎮 Poker Game Server Load Testing Tool');
console.log('=====================================\n');

// Parse command line arguments
const args = process.argv.slice(2);
let customConfig = {};

args.forEach(arg => {
    if (arg.startsWith('--url=')) {
        customConfig.serverUrl = arg.split('=')[1];
    } else if (arg.startsWith('--connections=')) {
        customConfig.maxConnections = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--duration=')) {
        customConfig.testDuration = parseInt(arg.split('=')[1]);
    } else if (arg === '--help' || arg === '-h') {
        console.log('\nUsage: node load-test.js [options]');
        console.log('\nOptions:');
        console.log('  --url=<url>           Server WebSocket URL (default: ws://localhost:3000)');
        console.log('  --connections=<num>   Maximum concurrent connections (default: 100)');
        console.log('  --duration=<ms>       Test duration in milliseconds (default: 60000)');
        console.log('  --help, -h            Show this help message');
        console.log('\nExamples:');
        console.log('  node load-test.js');
        console.log('  node load-test.js --url=ws://my-server.com:3000 --connections=200');
        console.log('  node load-test.js --duration=120000 --connections=50');
        process.exit(0);
    }
});

// Apply custom configuration
Object.assign(CONFIG, customConfig);

console.log('Configuration:');
console.log(`  Server URL: ${CONFIG.serverUrl}`);
console.log(`  Max Connections: ${CONFIG.maxConnections}`);
console.log(`  Test Duration: ${CONFIG.testDuration}ms (${CONFIG.testDuration / 1000}s)`);
console.log(`  Connection Interval: ${CONFIG.connectionInterval}ms`);

rl.question('\nPress Enter to start the load test (or Ctrl+C to cancel)...', () => {
    const loadTest = new LoadTest();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Received interrupt signal, stopping test...');
        loadTest.stop();
        rl.close();
        process.exit(0);
    });
    
    loadTest.start();
});

module.exports = { LoadTest, TestConnection, CONFIG }; 