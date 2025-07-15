import { EventManager } from '../utils/EventManager.js';

export class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.gameId = null;
        this.playerId = null;
        this.serverUrl = 'http://localhost:3000';
        this.eventManager = new EventManager();
        
        // Connection state
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        
        // Game state cache
        this.gameState = null;
        this.players = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for custom events
        this.eventManager.on('gameStateUpdate', (data) => {
            this.handleGameStateUpdate(data);
        });
        
        this.eventManager.on('playerJoined', (data) => {
            this.handlePlayerJoined(data);
        });
        
        this.eventManager.on('playerLeft', (data) => {
            this.handlePlayerLeft(data);
        });
        
        this.eventManager.on('error', (data) => {
            this.handleError(data);
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log('NetworkManager: Connecting to server...');
                
                // Import socket.io-client dynamically
                import('https://cdn.socket.io/4.7.2/socket.io.esm.min.js')
                    .then(({ io }) => {
                        this.socket = io(this.serverUrl, {
                            transports: ['websocket', 'polling'],
                            timeout: 20000,
                            reconnection: true,
                            reconnectionAttempts: this.maxReconnectAttempts,
                            reconnectionDelay: this.reconnectDelay
                        });

                        this.setupSocketListeners();
                        
                        this.socket.on('connect', () => {
                            console.log('NetworkManager: Connected to server');
                            this.isConnected = true;
                            this.connectionAttempts = 0;
                            resolve();
                        });

                        this.socket.on('connect_error', (error) => {
                            console.error('NetworkManager: Connection error:', error);
                            this.isConnected = false;
                            reject(error);
                        });

                        this.socket.on('disconnect', (reason) => {
                            console.log('NetworkManager: Disconnected from server:', reason);
                            this.isConnected = false;
                            this.eventManager.emit('disconnected', { reason });
                        });

                    })
                    .catch(error => {
                        console.error('NetworkManager: Failed to load socket.io:', error);
                        reject(error);
                    });

            } catch (error) {
                console.error('NetworkManager: Connection setup error:', error);
                reject(error);
            }
        });
    }

    setupSocketListeners() {
        if (!this.socket) return;

        // Game events
        this.socket.on('gameJoined', (data) => {
            console.log('NetworkManager: Game joined:', data);
            this.gameId = data.gameId;
            this.playerId = data.playerId;
            this.gameState = data.gameState;
            this.players = data.players;
            this.eventManager.emit('gameJoined', data);
        });

        this.socket.on('gameStateUpdate', (data) => {
            console.log('NetworkManager: Game state update:', data);
            this.gameState = data.gameState;
            this.players = data.gameState.players;
            this.eventManager.emit('gameStateUpdate', data);
        });

        this.socket.on('playerJoined', (data) => {
            console.log('NetworkManager: Player joined:', data);
            this.eventManager.emit('playerJoined', data);
        });

        this.socket.on('playerLeft', (data) => {
            console.log('NetworkManager: Player left:', data);
            this.eventManager.emit('playerLeft', data);
        });

        this.socket.on('error', (data) => {
            console.error('NetworkManager: Server error:', data);
            this.eventManager.emit('error', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.gameId = null;
        this.playerId = null;
        this.gameState = null;
        this.players = [];
    }

    joinGame(playerData) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Joining game with player data:', playerData);
        this.socket.emit('joinGame', playerData);
    }

    sendPokerAction(action, amount = 0) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        const actionData = { action, amount };
        console.log('NetworkManager: Sending poker action:', actionData);
        this.socket.emit('pokerAction', actionData);
    }

    requestNewHand() {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Requesting new hand');
        this.socket.emit('startNewHand');
    }

    // Event handlers
    handleGameStateUpdate(data) {
        // Update local state
        this.gameState = data.gameState;
        this.players = data.gameState.players;
        
        // Emit to scene
        this.eventManager.emit('gameStateChanged', {
            gameState: this.gameState,
            lastAction: data.lastAction,
            newHand: data.newHand
        });
    }

    handlePlayerJoined(data) {
        // Update players list
        const newPlayer = data.player;
        const existingPlayerIndex = this.players.findIndex(p => p.id === newPlayer.id);
        
        if (existingPlayerIndex >= 0) {
            this.players[existingPlayerIndex] = newPlayer;
        } else {
            this.players.push(newPlayer);
        }
        
        this.eventManager.emit('playerJoined', data);
    }

    handlePlayerLeft(data) {
        // Remove player from list
        this.players = this.players.filter(p => p.id !== data.playerId);
        
        this.eventManager.emit('playerLeft', data);
    }

    handleError(data) {
        console.error('NetworkManager: Error received:', data);
        this.eventManager.emit('networkError', data);
    }

    // Utility methods
    isMyTurn() {
        if (!this.gameState || !this.playerId) return false;
        
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        return currentPlayer && currentPlayer.id === this.playerId;
    }

    getCurrentPlayer() {
        if (!this.gameState) return null;
        return this.gameState.players[this.gameState.currentPlayer];
    }

    getMyPlayer() {
        if (!this.playerId || !this.players) return null;
        return this.players.find(p => p.id === this.playerId);
    }

    getPlayerById(playerId) {
        if (!this.players) return null;
        return this.players.find(p => p.id === playerId);
    }

    getActivePlayers() {
        if (!this.players) return [];
        return this.players.filter(p => !p.folded);
    }

    // Event subscription methods
    on(event, callback) {
        this.eventManager.on(event, callback);
    }

    off(event, callback) {
        this.eventManager.off(event, callback);
    }

    // Connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            gameId: this.gameId,
            playerId: this.playerId,
            playerCount: this.players.length
        };
    }

    // Cleanup
    cleanup() {
        this.disconnect();
        this.eventManager.cleanup();
    }
} 