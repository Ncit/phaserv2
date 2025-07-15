const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const GameManager = require('./game/GameManager');
const PlayerManager = require('./game/PlayerManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Game managers
const gameManager = new GameManager();
const playerManager = new PlayerManager();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Player joins the game
    socket.on('joinGame', (playerData) => {
        try {
            const player = playerManager.addPlayer(socket.id, playerData);
            const game = gameManager.findOrCreateGame();
            
            game.addPlayer(player);
            
            // Send game state to the new player
            socket.emit('gameJoined', {
                playerId: player.id,
                gameId: game.id,
                gameState: game.getPublicState(),
                players: game.getPlayersList()
            });
            
            // Notify other players
            socket.to('main-room').emit('playerJoined', {
                player: game.getPlayerInfo(player.id)
            });
            
            // Join the main game room
            socket.join('main-room');
            
            console.log(`👤 Player ${playerData.name} joined main room (${game.getPlayerCount()}/${game.maxPlayers} players)`);
        } catch (error) {
            console.error(`❌ Failed to join game: ${error.message}`);
            socket.emit('error', { message: error.message });
        }
    });

    // Player makes a poker action
    socket.on('pokerAction', (actionData) => {
        try {
            const game = gameManager.getGameByPlayerId(socket.id);
            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            const result = game.handlePlayerAction(socket.id, actionData);
            
            // Broadcast updated game state to all players in the game
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                lastAction: result
            });
            
            console.log(`Player ${socket.id} performed action: ${actionData.action}`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player sets ready status
    socket.on('setReady', (ready) => {
        try {
            const game = gameManager.getGameByPlayerId(socket.id);
            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            const playerId = game.getPlayerIdBySocketId(socket.id);
            if (!playerId) {
                socket.emit('error', { message: 'Player not found' });
                return;
            }

            const result = ready ? game.setPlayerReady(playerId) : game.setPlayerNotReady(playerId);
            
            // Broadcast updated game state
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                readyUpdate: result
            });
            
            console.log(`Player ${result.playerId} ${ready ? 'is ready' : 'is not ready'} (${result.readyCount}/${result.totalPlayers})`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to start the game
    socket.on('startGame', () => {
        try {
            const game = gameManager.getGameByPlayerId(socket.id);
            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            game.startGame();
            
            // Broadcast game started
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                gameStarted: true
            });
            
            console.log(`🎮 Game started in main room`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to start a new hand
    socket.on('startNewHand', () => {
        try {
            const game = gameManager.getGameByPlayerId(socket.id);
            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            game.startNewHand();
            
            // Broadcast new hand state
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                newHand: true
            });
            
            console.log(`🃏 New hand started in main room`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player requests to reset the room (Next Round button)
    socket.on('resetRoom', () => {
        try {
            const game = gameManager.getGameByPlayerId(socket.id);
            if (!game) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }

            game.resetRoom();
            
            // Broadcast room reset state
            io.to('main-room').emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                roomReset: true
            });
            
            console.log(`🔄 Room reset in main room`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player disconnects
    socket.on('disconnect', () => {
        console.log(`👋 Player disconnected: ${socket.id}`);
        
        const game = gameManager.getGameByPlayerId(socket.id);
        if (game) {
            const player = game.removePlayer(socket.id);
            if (player) {
                // Notify other players
                socket.to('main-room').emit('playerLeft', {
                    playerId: player.id,
                    playerName: player.name
                });
                
                console.log(`👤 Player ${player.name} left main room (${game.getPlayerCount()}/${game.maxPlayers} players remaining)`);
                
                // If game is empty, remove it
                if (game.getPlayerCount() === 0) {
                    gameManager.removeGame(game.id);
                    console.log(`🏁 Main room closed (no players remaining)`);
                }
            }
        }
        
        playerManager.removePlayer(socket.id);
    });
});

// REST API endpoints
app.get('/api/games', (req, res) => {
    const games = gameManager.getAllGames().map(game => ({
        id: game.id,
        playerCount: game.getPlayerCount(),
        maxPlayers: game.maxPlayers,
        status: game.status
    }));
    res.json(games);
});

app.get('/api/games/:gameId', (req, res) => {
    const game = gameManager.getGame(req.params.gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    res.json({
        id: game.id,
        playerCount: game.getPlayerCount(),
        maxPlayers: game.maxPlayers,
        status: game.status,
        players: game.getPlayersList()
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎰 Single Room Poker Server running on port ${PORT}`);
    console.log(`🌐 WebSocket server ready for connections`);
    console.log(`📋 All players will join the main room automatically`);
    console.log(`👥 Maximum players per room: 6`);
}); 