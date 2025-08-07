const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const SingleRoomGame = require('./game/SingleRoomGame');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Requested-With", "X-VK-Platform", "X-VK-WebView"],
        credentials: false
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6,
    allowRequest: (req, callback) => {
        // Allow all requests, but log VK WebView requests
        const userAgent = req.headers['user-agent'] || '';
        const isVKWebView = userAgent.includes('wv') && userAgent.includes('Android');
        
        if (isVKWebView) {
            console.log('🔧 Server: VK Android WebView request detected:', {
                url: req.url,
                headers: req.headers,
                userAgent: userAgent
            });
        }
        
        callback(null, true);
    }
});

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With", "X-VK-Platform", "X-VK-WebView"],
    credentials: false
}));

// VK WebView specific middleware
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isVKWebView = userAgent.includes('wv') && userAgent.includes('Android');
    
    if (isVKWebView) {
        console.log('🔧 Server: VK WebView request:', {
            method: req.method,
            url: req.url,
            headers: req.headers
        });
        
        // Add VK-specific headers
        res.setHeader('X-VK-Supported', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-VK-Platform, X-VK-WebView');
    }
    
    next();
});

app.use(express.json());
app.use(express.static('public'));

// Handle /pokerserver route for nginx proxy
app.use('/pokerserver', (req, res, next) => {
    // Don't modify Socket.IO requests - let them pass through as-is
    if (req.url.startsWith('/socket.io')) {
        return next();
    }
    // Remove /pokerserver from the path for internal routing
    req.url = req.url.replace('/pokerserver', '');
    next();
});

// VK WebView test endpoint
app.get('/pokerserver/vk-test', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isVKWebView = userAgent.includes('wv') && userAgent.includes('Android');
    
    res.json({
        status: 'ok',
        message: 'VK WebView test endpoint',
        isVKWebView: isVKWebView,
        userAgent: userAgent,
        headers: req.headers,
        timestamp: new Date().toISOString()
    });
});

// Socket.IO endpoint test
app.get('/pokerserver/socket-test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Socket.IO endpoint accessible',
        socketIO: true,
        timestamp: new Date().toISOString()
    });
});

// Single room game instance
const game = new SingleRoomGame();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Player joins the game
    socket.on('joinGame', (playerData) => {
        try {
            const result = game.handlePlayerJoin(socket.id, playerData);
            
            // Join the main room
            socket.join('main-room');
            
            // Send game state to the joining player
            socket.emit('gameJoined', {
                playerId: result.playerId,
                gameState: game.getPublicState(),
                players: game.getPublicState().players, // <-- add this line
                isReconnection: result.isReconnection
            });
            
            // Notify other players
            if (result.isReconnection) {
                socket.to('main-room').emit('playerReconnected', {
                    playerId: result.playerId,
                    playerName: result.playerName,
                    wasAutoFolded: result.wasAutoFolded
                });
            } else {
                socket.to('main-room').emit('playerJoined', {
                    player: result.playerInfo
                });
            }
            
            // Broadcast updated game state to all players
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState()
            });
            
            console.log(`👤 Player ${playerData.name} ${result.isReconnection ? 'reconnected' : 'joined'} (${game.getPlayerCount()}/6 players)`);
            
        } catch (error) {
            console.error(`❌ Failed to join game: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    });

    // Player makes a poker action
    socket.on('pokerAction', (actionData) => {
        try {
            const result = game.handlePlayerAction(socket.id, actionData);
            
            // Broadcast updated game state to all players
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                lastAction: result
            });
            
            console.log(`🎯 Player action: ${actionData.action}`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to start the game
    socket.on('startGame', () => {
        try {
            game.startGame();
            
            // Broadcast game started with active player information
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                gameStarted: true,
                allPlayersActive: true,
                activePlayerCount: game.getActivePlayerCount()
            });
            
            console.log(`🎮 Game started with ${game.getActivePlayerCount()} active players`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to start a new hand
    socket.on('startNewHand', () => {
        try {
            game.startNewHand();
            
            // Broadcast new hand state
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                newHand: true
            });
            
            console.log(`🃏 New hand started`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to reset the room
    socket.on('resetRoom', () => {
        try {
            game.resetRoom();
            
            // Broadcast room reset state
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                roomReset: true
            });
            
            console.log(`🔄 Room reset`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player sends a chat message
    socket.on('chatMessage', (messageData) => {
        try {
            // Get player info from the game
            const player = game.getPlayerBySocketId(socket.id);
            
            if (!player) {
                console.log(`❌ Chat message from unknown player: ${socket.id}`);
                return;
            }

            // Create chat message object
            const chatMessage = {
                playerId: player.id,
                playerName: player.name,
                message: messageData.message,
                timestamp: messageData.timestamp || Date.now()
            };

            // Broadcast chat message to all players in the room
            io.to('main-room').emit('chatMessage', chatMessage);
            
            console.log(`💬 Chat message from ${player.name}: ${messageData.message}`);
        } catch (error) {
            console.error(`❌ Error handling chat message: ${error.message}`);
            socket.emit('error', { message: 'Failed to send chat message' });
        }
    });

    // Player disconnects
    socket.on('disconnect', () => {
        console.log(`👋 Player disconnected: ${socket.id}`);
        
        const result = game.handlePlayerDisconnect(socket.id);
        
        if (result) {
            // Check if room is now empty (only count connected players)
            const connectedPlayerCount = game.getConnectedPlayerCount();
            
            if (connectedPlayerCount === 0) {
                // Room is empty - notify any remaining clients
                io.to('main-room').emit('roomEmpty', {
                    message: 'All players have left. Room has been reset.'
                });
                
                console.log('🏠 Room is now empty - all values reset');
            } else if (connectedPlayerCount === 1) {
                // Only one connected player remaining - room has been reset to lobby
                const connectedPlayers = game.getPlayersList().filter(p => !p.disconnected);
                io.to('main-room').emit('roomResetToOnePlayer', {
                    message: 'Only one player remaining. Room has been reset to lobby state.',
                    remainingPlayer: connectedPlayers[0]
                });
                
                // Broadcast updated game state
                io.to('main-room').emit('gameStateUpdate', {
                    gameState: game.getPublicState(),
                    roomResetToOnePlayer: true
                });
                
                console.log(`👤 Only one connected player remaining - room reset to lobby`);
            } else {
                // Notify other players about the disconnection
                socket.to('main-room').emit('playerDisconnected', {
                    playerId: result.playerId,
                    playerName: result.playerName,
                    wasCurrentPlayer: result.wasCurrentPlayer
                });
                
                // If the current player disconnected, broadcast a special event
                if (result.wasCurrentPlayer) {
                    io.to('main-room').emit('currentPlayerDisconnected', {
                        playerId: result.playerId,
                        playerName: result.playerName
                    });
                }
                
                // Broadcast updated game state
                io.to('main-room').emit('gameStateUpdate', {
                    gameState: game.getPublicState()
                });
                
                console.log(`👤 Player ${result.playerName} disconnected (${connectedPlayerCount}/6 connected players remaining)`);
            }
        }
    });
});

// REST API endpoints
app.get('/api/game', (req, res) => {
    res.json({
        id: game.id,
        playerCount: game.getPlayerCount(),
        maxPlayers: game.maxPlayers,
        status: game.status,
        phase: game.phase
    });
});

app.get('/api/game/players', (req, res) => {
    res.json(game.getPlayersList());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎰 Single Room Poker Server running on port ${PORT}`);
    console.log(`🌐 WebSocket server ready for connections`);
    console.log(`📋 All players join the same room automatically`);
    console.log(`👥 Maximum players: 6`);
}); 