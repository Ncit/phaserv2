const { v4: uuidv4 } = require('uuid');

class PlayerManager {
    constructor() {
        this.players = new Map(); // socketId -> Player
        this.playerIds = new Map(); // playerId -> socketId
    }

    addPlayer(socketId, playerData) {
        const playerId = uuidv4();
        
        const player = {
            id: playerId,
            socketId: socketId,
            name: playerData.name || 'Anonymous',
            avatarUrl: playerData.avatarUrl || 'https://gravatar.com/avatar/default?s=400&d=robohash&r=x',
            bank: playerData.bank || 1000,
            isConnected: true,
            joinedAt: new Date(),
            lastSeen: new Date()
        };

        this.players.set(socketId, player);
        this.playerIds.set(playerId, socketId);
        
        console.log(`Player added: ${player.name} (${playerId})`);
        return player;
    }

    getPlayer(socketId) {
        return this.players.get(socketId);
    }

    getPlayerById(playerId) {
        const socketId = this.playerIds.get(playerId);
        return socketId ? this.players.get(socketId) : null;
    }

    updatePlayer(socketId, updates) {
        const player = this.players.get(socketId);
        if (player) {
            Object.assign(player, updates);
            player.lastSeen = new Date();
        }
        return player;
    }

    removePlayer(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            this.players.delete(socketId);
            this.playerIds.delete(player.id);
            console.log(`Player removed: ${player.name} (${player.id})`);
        }
        return player;
    }

    getConnectedPlayers() {
        return Array.from(this.players.values()).filter(p => p.isConnected);
    }

    getPlayerCount() {
        return this.players.size;
    }

    isPlayerConnected(socketId) {
        const player = this.players.get(socketId);
        return player && player.isConnected;
    }

    markPlayerDisconnected(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            player.isConnected = false;
            player.lastSeen = new Date();
        }
    }

    cleanup() {
        // Remove players who haven't been seen for more than 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        for (const [socketId, player] of this.players.entries()) {
            if (player.lastSeen < fiveMinutesAgo) {
                this.removePlayer(socketId);
            }
        }
    }
}

module.exports = PlayerManager; 