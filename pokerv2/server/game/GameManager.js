const { v4: uuidv4 } = require('uuid');
const PokerGame = require('./PokerGame');

class GameManager {
    constructor() {
        this.games = new Map();
        this.maxGames = 10;
    }

    findOrCreateGame() {
        // Find an available game
        for (const [gameId, game] of this.games) {
            if (game.getPlayerCount() < game.maxPlayers && game.status === 'waiting') {
                return game;
            }
        }

        // Create a new game if we haven't reached the limit
        if (this.games.size < this.maxGames) {
            const gameId = uuidv4();
            const game = new PokerGame(gameId);
            this.games.set(gameId, game);
            console.log(`Created new game: ${gameId}`);
            return game;
        }

        throw new Error('No available games. Please try again later.');
    }

    getGame(gameId) {
        return this.games.get(gameId);
    }

    getGameByPlayerId(playerId) {
        for (const game of this.games.values()) {
            if (game.hasPlayer(playerId)) {
                return game;
            }
        }
        return null;
    }

    getAllGames() {
        return Array.from(this.games.values());
    }

    removeGame(gameId) {
        const game = this.games.get(gameId);
        if (game) {
            game.cleanup();
            this.games.delete(gameId);
            console.log(`Removed game: ${gameId}`);
        }
    }

    getGameStats() {
        const stats = {
            totalGames: this.games.size,
            activeGames: 0,
            totalPlayers: 0,
            games: []
        };

        for (const game of this.games.values()) {
            const playerCount = game.getPlayerCount();
            if (playerCount > 0) {
                stats.activeGames++;
                stats.totalPlayers += playerCount;
            }

            stats.games.push({
                id: game.id,
                playerCount,
                maxPlayers: game.maxPlayers,
                status: game.status,
                phase: game.phase
            });
        }

        return stats;
    }
}

module.exports = GameManager; 