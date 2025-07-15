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
            socket.to(game.id).emit('playerJoined', {
                player: game.getPlayerInfo(player.id)
            });
            
            // Join the game room
            socket.join(game.id);
            
            console.log(`Player ${playerData.name} joined game ${game.id}`);
        } catch (error) {
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
            io.to(game.id).emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                lastAction: result
            });
            
            console.log(`Player ${socket.id} performed action: ${actionData.action}`);
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
            io.to(game.id).emit('gameStateUpdate', {
                gameState: game.getPublicState(),
                newHand: true
            });
            
            console.log(`New hand started in game ${game.id}`);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    // Player disconnects
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        const game = gameManager.getGameByPlayerId(socket.id);
        if (game) {
            const player = game.removePlayer(socket.id);
            if (player) {
                // Notify other players
                socket.to(game.id).emit('playerLeft', {
                    playerId: player.id,
                    playerName: player.name
                });
                
                // If game is empty, remove it
                if (game.getPlayerCount() === 0) {
                    gameManager.removeGame(game.id);
                    console.log(`Game ${game.id} removed (no players)`);
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
    console.log(`Poker server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
}); 