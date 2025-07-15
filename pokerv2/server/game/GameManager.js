const { v4: uuidv4 } = require('uuid');
const PokerGame = require('./PokerGame');

class GameManager {
    constructor() {
        this.singleGame = null;
        this.maxPlayers = 6; // Maximum players in the single room
    }

    findOrCreateGame() {
        // If no game exists, create the single game
        if (!this.singleGame) {
            const gameId = 'main-room';
            this.singleGame = new PokerGame(gameId);
            console.log(`Created main game room: ${gameId}`);
        }

        // Check if the game is full
        if (this.singleGame.getPlayerCount() >= this.maxPlayers) {
            throw new Error('Game room is full. Please wait for a spot to open.');
        }

        return this.singleGame;
    }

    getGame(gameId) {
        // Always return the single game regardless of gameId
        return this.singleGame;
    }

    getGameByPlayerId(socketId) {
        if (this.singleGame) {
            // First try to find by socket ID
            if (this.singleGame.hasPlayerBySocketId(socketId)) {
                return this.singleGame;
            }
            
            // If not found, check if this socket ID corresponds to a player in the game
            const playerId = this.singleGame.getPlayerIdBySocketId(socketId);
            if (playerId && this.singleGame.hasPlayer(playerId)) {
                return this.singleGame;
            }
        }
        return null;
    }

    getAllGames() {
        // Return array with single game if it exists
        return this.singleGame ? [this.singleGame] : [];
    }

    removeGame(gameId) {
        // Only remove if it's the single game and it's empty
        if (this.singleGame && this.singleGame.id === gameId) {
            if (this.singleGame.getPlayerCount() === 0) {
                this.singleGame.cleanup();
                this.singleGame = null;
                console.log('Main game room removed (no players)');
            }
        }
    }

    getGameStats() {
        const stats = {
            totalGames: this.singleGame ? 1 : 0,
            activeGames: this.singleGame && this.singleGame.getPlayerCount() > 0 ? 1 : 0,
            totalPlayers: this.singleGame ? this.singleGame.getPlayerCount() : 0,
            games: []
        };

        if (this.singleGame) {
            stats.games.push({
                id: this.singleGame.id,
                playerCount: this.singleGame.getPlayerCount(),
                maxPlayers: this.maxPlayers,
                status: this.singleGame.status,
                phase: this.singleGame.phase
            });
        }

        return stats;
    }

    // Get the single game directly
    getMainGame() {
        return this.singleGame;
    }

    // Check if main game exists
    hasMainGame() {
        return this.singleGame !== null;
    }
}

module.exports = GameManager; 