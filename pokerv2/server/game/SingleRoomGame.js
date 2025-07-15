const { v4: uuidv4 } = require('uuid');
const HandEvaluator = require('./HandEvaluator');

class SingleRoomGame {
    constructor() {
        this.id = 'main-room';
        this.maxPlayers = 6;
        this.minPlayers = 2;
        this.status = 'lobby'; // lobby, playing, finished
        
        // Game state
        this.phase = 'lobby'; // lobby, preflop, flop, turn, river, showdown
        this.pot = 0;
        this.currentBet = 0;
        this.dealerPosition = 0;
        this.currentPlayer = 0;
        this.communityCards = [];
        this.deck = [];
        
        // Betting configuration
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.minBet = 20;
        
        // Raise limit tracking
        this.maxRaisesPerRound = 3;
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        // Players - simplified structure
        this.players = new Map(); // playerId -> Player
        this.playerOrder = []; // Array of player IDs in order
        this.socketToPlayer = new Map(); // socketId -> playerId
        
        // Lobby system
        this.readyPlayers = new Set(); // Set of ready player IDs
        this.allPlayersReady = false;
        
        // Betting round tracking
        this.bettingRoundStartPlayer = 0;
        this.hasEveryoneActed = false;
        
        // Hand evaluator
        this.handEvaluator = new HandEvaluator();
        
        // Showdown results
        this.showdownResults = null;
        
        // Game timers
        this.actionTimer = null;
        this.actionTimeout = 30000; // 30 seconds per action
    }

    handlePlayerJoin(socketId, playerData) {
        // Check if this is a reconnection (player with same name already exists)
        const existingPlayer = this.findPlayerByName(playerData.name);
        
        if (existingPlayer) {
            // This is a reconnection
            console.log(`🔄 Player ${playerData.name} reconnecting...`);
            
            // Update the existing player's socket ID
            existingPlayer.socketId = socketId;
            existingPlayer.disconnected = false;
            this.socketToPlayer.set(socketId, existingPlayer.id);
            
            // If game is in lobby, auto-ready the player
            if (this.status === 'lobby') {
                existingPlayer.ready = true;
                this.readyPlayers.add(existingPlayer.id);
                existingPlayer.bank = 1000; // Reset bank for new game
                
                // Check if all players are ready
                this.checkAllPlayersReady();
            }
            
            return {
                playerId: existingPlayer.id,
                playerName: existingPlayer.name,
                isReconnection: true
            };
        }

        // New player joining
        console.log(`🆕 New player ${playerData.name} joining...`);
        
        // Check if game is in progress
        if (this.status === 'playing') {
            throw new Error('Game is in progress. Please wait for the current game to finish.');
        }
        
        // Check if room is full
        if (this.getPlayerCount() >= this.maxPlayers) {
            throw new Error('Game room is full. Please wait for a spot to open.');
        }

        // Create new player
        const playerId = uuidv4();
        const player = {
            id: playerId,
            socketId: socketId,
            name: playerData.name || 'Anonymous',
            avatarUrl: playerData.avatarUrl || 'https://gravatar.com/avatar/default?s=400&d=robohash&r=x',
            bank: 1000,
            currentBet: 0,
            folded: false,
            allIn: false,
            hasActed: false,
            hand: [],
            handRank: null,
            position: this.getPlayerCount(),
            ready: true, // Auto-ready new players
            disconnected: false
        };

        this.players.set(playerId, player);
        this.playerOrder.push(playerId);
        this.socketToPlayer.set(socketId, playerId);
        this.readyPlayers.add(playerId);
        
        // Check if all players are ready
        this.checkAllPlayersReady();

        return {
            playerId: player.id,
            playerName: player.name,
            playerInfo: this.getPlayerInfo(player.id),
            isReconnection: false
        };
    }

    handlePlayerDisconnect(socketId) {
        const playerId = this.socketToPlayer.get(socketId);
        if (!playerId) return null;

        const player = this.players.get(playerId);
        if (!player) return null;

        console.log(`🔄 Player ${player.name} disconnected`);
        
        // Mark player as disconnected
        player.socketId = null;
        player.disconnected = true;
        this.socketToPlayer.delete(socketId);
        
        // Remove from ready players
        this.readyPlayers.delete(playerId);
        player.ready = false;
        
        // Check if all players are ready
        this.checkAllPlayersReady();
        
        // If game is in progress, check if we need to end it
        if (this.status === 'playing') {
            const activePlayers = this.getActivePlayers();
            if (activePlayers.length < this.minPlayers) {
                console.log(`🛑 Not enough active players (${activePlayers.length}/${this.minPlayers}), ending game`);
                this.endGame();
            }
        }

        return {
            playerId: player.id,
            playerName: player.name
        };
    }

    handlePlayerAction(socketId, actionData) {
        const playerId = this.socketToPlayer.get(socketId);
        if (!playerId) {
            throw new Error('Player not found');
        }

        const player = this.players.get(playerId);
        if (!player || player.disconnected) {
            throw new Error('Player not connected');
        }

        // Check if it's the player's turn
        const activePlayerOrder = this.getActivePlayerOrder();
        const currentPlayerId = activePlayerOrder[this.currentPlayer];
        
        if (playerId !== currentPlayerId) {
            throw new Error('Not your turn');
        }

        if (player.folded || player.allIn) {
            throw new Error('Player cannot act');
        }

        let result;
        switch (actionData.action) {
            case 'fold':
                result = this.foldPlayer(playerId);
                break;
            case 'check':
                result = this.checkPlayer(playerId);
                break;
            case 'call':
                result = this.callPlayer(playerId, actionData.amount);
                break;
            case 'raise':
                result = this.raisePlayer(playerId, actionData.amount);
                break;
            case 'allIn':
                result = this.allInPlayer(playerId);
                break;
            default:
                throw new Error('Invalid action');
        }

        // Clear action timer
        this.clearTimers();

        // Move to next player
        this.nextPlayer();

        return result;
    }

    startGame() {
        if (!this.allPlayersReady) {
            throw new Error('Not all players are ready');
        }

        if (this.getPlayerCount() < this.minPlayers) {
            throw new Error('Not enough players to start');
        }

        this.status = 'playing';
        this.startNewHand();
    }

    startNewHand() {
        // Reset game state
        this.phase = 'preflop';
        this.pot = 0;
        this.currentBet = 0;
        this.showdownResults = null;
        this.communityCards = [];
        
        // Reset raise tracking
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        // Reset all players
        for (const player of this.players.values()) {
            if (!player.disconnected) {
                player.currentBet = 0;
                player.folded = false;
                player.allIn = false;
                player.hand = [];
                player.handRank = null;
                player.hasActed = false;
            }
        }

        // Get active player order
        const activePlayerOrder = this.getActivePlayerOrder();
        
        // Move dealer button
        this.dealerPosition = (this.dealerPosition + 1) % activePlayerOrder.length;
        
        // Initialize and shuffle deck
        this.initializeDeck();
        this.shuffleDeck();

        // Post blinds
        const smallBlindPos = (this.dealerPosition + 1) % activePlayerOrder.length;
        const bigBlindPos = (this.dealerPosition + 2) % activePlayerOrder.length;
        
        const smallBlindPlayerId = activePlayerOrder[smallBlindPos];
        const bigBlindPlayerId = activePlayerOrder[bigBlindPos];
        
        this.postBlindById(smallBlindPlayerId, this.smallBlind);
        this.postBlindById(bigBlindPlayerId, this.bigBlind);
        
        this.currentBet = this.bigBlind;
        
        // Set current player to the position after big blind
        this.currentPlayer = (bigBlindPos + 1) % activePlayerOrder.length;

        // Deal hole cards
        this.dealHoleCards();

        // Start betting round
        this.startBettingRound();
    }

    resetRoom() {
        console.log('🔄 Resetting room to lobby state');
        
        this.status = 'lobby';
        this.phase = 'lobby';
        
        // Clear game state
        this.pot = 0;
        this.currentBet = 0;
        this.communityCards = [];
        this.showdownResults = null;
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        // Reset player tracking
        this.currentPlayer = 0;
        this.dealerPosition = 0;
        this.bettingRoundStartPlayer = 0;
        this.hasEveryoneActed = false;
        
        // Reset all players to lobby state
        for (const player of this.players.values()) {
            if (!player.disconnected) {
                player.currentBet = 0;
                player.folded = false;
                player.allIn = false;
                player.hand = [];
                player.handRank = null;
                player.hasActed = false;
                player.ready = true;
                player.bank = 1000;
            }
        }
        
        // Reset ready players
        this.readyPlayers.clear();
        for (const [playerId, player] of this.players.entries()) {
            if (!player.disconnected) {
                this.readyPlayers.add(playerId);
            }
        }
        
        this.checkAllPlayersReady();
        
        // Clear timers
        this.clearTimers();
    }

    endGame() {
        this.status = 'lobby';
        this.phase = 'lobby';
        
        // Reset all players to lobby state
        for (const player of this.players.values()) {
            if (!player.disconnected) {
                player.ready = true;
                player.currentBet = 0;
                player.folded = false;
                player.allIn = false;
                player.hand = [];
                player.handRank = null;
                player.bank = 1000;
            }
        }
        
        // Reset ready players
        this.readyPlayers.clear();
        for (const [playerId, player] of this.players.entries()) {
            if (!player.disconnected) {
                this.readyPlayers.add(playerId);
            }
        }
        
        this.checkAllPlayersReady();
        
        // Clear game state
        this.pot = 0;
        this.currentBet = 0;
        this.communityCards = [];
        
        this.clearTimers();
    }

    // Helper methods
    findPlayerByName(name) {
        for (const [playerId, player] of this.players.entries()) {
            if (player.name === name) {
                return player;
            }
        }
        return null;
    }

    getPlayerCount() {
        return Array.from(this.players.values()).filter(p => !p.disconnected).length;
    }

    getActivePlayers() {
        return Array.from(this.players.values()).filter(p => !p.folded && !p.disconnected);
    }

    getActivePlayerOrder() {
        return this.playerOrder.filter(playerId => {
            const player = this.players.get(playerId);
            return player && !player.disconnected;
        });
    }

    checkAllPlayersReady() {
        const activePlayers = Array.from(this.players.values()).filter(p => !p.disconnected);
        this.allPlayersReady = this.readyPlayers.size >= this.minPlayers && 
                              this.readyPlayers.size === activePlayers.length;
    }

    // Game logic methods (simplified from original PokerGame)
    initializeDeck() {
        this.deck = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push({ suit, value });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        if (this.deck.length === 0) return null;
        return this.deck.pop();
    }

    postBlindById(playerId, amount) {
        const player = this.players.get(playerId);
        if (!player) return;
        
        const actualBet = Math.min(amount, player.bank);
        
        player.currentBet = actualBet;
        player.bank -= actualBet;
        this.pot += actualBet;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
    }

    dealHoleCards() {
        const activePlayerOrder = this.getActivePlayerOrder();
        
        for (let i = 0; i < 2; i++) {
            for (const playerId of activePlayerOrder) {
                const card = this.dealCard();
                if (card) {
                    const player = this.players.get(playerId);
                    player.hand.push(card);
                }
            }
        }
    }

    dealCommunityCards(count) {
        for (let i = 0; i < count; i++) {
            const card = this.dealCard();
            if (card) {
                this.communityCards.push(card);
            }
        }
    }

    startBettingRound() {
        this.clearTimers();
        
        if (this.phase === 'showdown') {
            return;
        }
        
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            this.nextPhase();
            return;
        }

        if (this.isBettingRoundComplete()) {
            this.nextPhase();
            return;
        }

        // Skip folded/all-in players
        while (this.isCurrentPlayerFoldedOrAllIn()) {
            this.nextPlayer();
            
            if (this.isBettingRoundComplete()) {
                this.nextPhase();
                return;
            }
        }

        // Start action timer
        this.startActionTimer();
    }

    isCurrentPlayerFoldedOrAllIn() {
        const activePlayerOrder = this.getActivePlayerOrder();
        const currentPlayerId = activePlayerOrder[this.currentPlayer];
        const player = this.players.get(currentPlayerId);
        return player.folded || player.allIn;
    }

    foldPlayer(playerId) {
        const player = this.players.get(playerId);
        player.folded = true;
        player.hasActed = true;
        
        return {
            action: 'fold',
            playerId,
            playerName: player.name
        };
    }

    checkPlayer(playerId) {
        const player = this.players.get(playerId);
        if (this.currentBet > player.currentBet) {
            throw new Error('Cannot check when there is a bet to call');
        }
        
        player.hasActed = true;
        
        return {
            action: 'check',
            playerId,
            playerName: player.name
        };
    }

    callPlayer(playerId, amount) {
        const player = this.players.get(playerId);
        const callAmount = Math.min(amount, player.bank);
        
        player.currentBet += callAmount;
        player.bank -= callAmount;
        this.pot += callAmount;
        player.hasActed = true;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        return {
            action: 'call',
            playerId,
            playerName: player.name,
            amount: callAmount
        };
    }

    raisePlayer(playerId, amount) {
        const player = this.players.get(playerId);
        
        if (this.currentRaisesInRound >= this.maxRaisesPerRound) {
            throw new Error('Maximum number of raises reached for this betting round');
        }
        
        const totalBetAmount = Math.min(amount, player.bank);
        const additionalAmount = totalBetAmount - player.currentBet;
        
        if (totalBetAmount <= this.currentBet) {
            throw new Error('Raise must be greater than current bet');
        }
        
        player.currentBet = totalBetAmount;
        player.bank -= additionalAmount;
        this.pot += additionalAmount;
        this.currentBet = totalBetAmount;
        player.hasActed = true;
        
        this.currentRaisesInRound++;
        this.lastRaisePlayerId = playerId;
        
        // Reset action tracking for other players
        for (const p of this.players.values()) {
            if (p.id !== playerId) {
                p.hasActed = false;
            }
        }
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        return {
            action: 'raise',
            playerId,
            playerName: player.name,
            amount: additionalAmount,
            raisesInRound: this.currentRaisesInRound,
            maxRaises: this.maxRaisesPerRound
        };
    }

    allInPlayer(playerId) {
        const player = this.players.get(playerId);
        const allInAmount = player.bank;
        
        player.currentBet += allInAmount;
        player.bank -= allInAmount;
        this.pot += allInAmount;
        
        if (player.currentBet > this.currentBet) {
            this.currentBet = player.currentBet;
            
            if (this.currentRaisesInRound < this.maxRaisesPerRound) {
                this.currentRaisesInRound++;
                this.lastRaisePlayerId = playerId;
            }
            
            // Reset action tracking for other players
            for (const p of this.players.values()) {
                if (p.id !== playerId) {
                    p.hasActed = false;
                }
            }
        }
        
        player.hasActed = true;
        player.allIn = true;
        
        return {
            action: 'allIn',
            playerId,
            playerName: player.name,
            amount: allInAmount,
            raisesInRound: this.currentRaisesInRound,
            maxRaises: this.maxRaisesPerRound
        };
    }

    nextPlayer() {
        const activePlayerOrder = this.getActivePlayerOrder();
        
        let nextPlayer = (this.currentPlayer + 1) % activePlayerOrder.length;
        let iterations = 0;
        
        // Skip folded players
        while (this.players.get(activePlayerOrder[nextPlayer]).folded && 
               nextPlayer !== this.currentPlayer && 
               iterations < activePlayerOrder.length) {
            nextPlayer = (nextPlayer + 1) % activePlayerOrder.length;
            iterations++;
        }
        
        if (this.isBettingRoundComplete()) {
            this.nextPhase();
        } else {
            this.currentPlayer = nextPlayer;
            if (this.phase !== 'showdown') {
                this.startBettingRound();
            }
        }
    }

    isBettingRoundComplete() {
        const activePlayers = this.getActivePlayers();
        
        if (activePlayers.length <= 1) {
            return true;
        }
        
        const allBetsEqual = activePlayers.every(p => 
            p.currentBet === this.currentBet || p.allIn
        );
        
        const allHaveActed = activePlayers.every(p => 
            p.hasActed || p.allIn
        );
        
        const allAllIn = activePlayers.every(p => p.allIn);
        
        if (this.phase === 'preflop') {
            return allBetsEqual;
        }
        
        return (allBetsEqual && allHaveActed) || allAllIn || (this.phase === 'river' && allBetsEqual);
    }

    nextPhase() {
        if (this.phase === 'showdown') {
            return;
        }
        
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            this.phase = 'showdown';
            this.showdown();
            return;
        }
        
        switch (this.phase) {
            case 'preflop':
                this.phase = 'flop';
                this.dealCommunityCards(3);
                break;
            case 'flop':
                this.phase = 'turn';
                this.dealCommunityCards(1);
                break;
            case 'turn':
                this.phase = 'river';
                this.dealCommunityCards(1);
                break;
            case 'river':
                this.phase = 'showdown';
                this.showdown();
                return;
        }
        
        // Reset betting for new phase
        this.currentBet = 0;
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        for (const player of this.players.values()) {
            if (!player.disconnected) {
                player.currentBet = 0;
                player.hasActed = false;
            }
        }
        
        const activePlayerOrder = this.getActivePlayerOrder();
        let startingPlayer = (this.dealerPosition + 1) % activePlayerOrder.length;
        while (this.players.get(activePlayerOrder[startingPlayer]).folded) {
            startingPlayer = (startingPlayer + 1) % activePlayerOrder.length;
        }
        
        this.currentPlayer = startingPlayer;
        this.bettingRoundStartPlayer = startingPlayer;
        this.hasEveryoneActed = false;
        
        this.startBettingRound();
    }

    showdown() {
        const activePlayers = this.getActivePlayers();
        
        if (activePlayers.length === 0) {
            this.startNewHand();
            return;
        }
        
        // Reveal all players' cards
        const allPlayers = Array.from(this.players.values());
        const revealedCards = allPlayers.map(player => ({
            playerId: player.id,
            playerName: player.name,
            cards: player.hand,
            folded: player.folded,
            allIn: player.allIn
        }));
        
        // Evaluate hands
        const playerHands = activePlayers.map(player => {
            const handEvaluation = this.handEvaluator.evaluateHand(
                player.hand, 
                this.communityCards
            );
            return {
                player,
                hand: handEvaluation
            };
        });
        
        // Find winners
        let winners = [playerHands[0]];
        for (let i = 1; i < playerHands.length; i++) {
            const comparison = this.handEvaluator.compareHands(
                playerHands[i].hand, 
                winners[0].hand
            );
            if (comparison > 0) {
                winners = [playerHands[i]];
            } else if (comparison === 0) {
                winners.push(playerHands[i]);
            }
        }
        
        // Split pot
        const potPerWinner = Math.floor(this.pot / winners.length);
        winners.forEach(({ player }) => {
            player.bank += potPerWinner;
        });
        
        // Update hand rankings
        playerHands.forEach(({ player, hand }) => {
            player.handRank = hand;
        });
        
        // Store showdown results
        this.showdownResults = {
            winners: winners.map(({ player }) => player.id),
            winnerNames: winners.map(({ player }) => player.name),
            handDescription: winners[0].hand.rankName,
            playerHands: playerHands.map(({ player, hand }) => ({
                playerId: player.id,
                playerName: player.name,
                handRank: hand.rankName,
                handScore: hand.score
            })),
            revealedCards: revealedCards
        };
        
        this.phase = 'showdown';
    }

    startActionTimer() {
        this.actionTimer = setTimeout(() => {
            const activePlayerOrder = this.getActivePlayerOrder();
            const currentPlayerId = activePlayerOrder[this.currentPlayer];
            const player = this.players.get(currentPlayerId);
            
            if (!player.folded && !player.allIn) {
                this.foldPlayer(currentPlayerId);
                this.nextPlayer();
            }
        }, this.actionTimeout);
    }

    clearTimers() {
        if (this.actionTimer) {
            clearTimeout(this.actionTimer);
            this.actionTimer = null;
        }
    }

    getPublicState() {
        return {
            id: this.id,
            status: this.status,
            phase: this.phase,
            pot: this.pot,
            currentBet: this.currentBet,
            dealerPosition: this.dealerPosition,
            currentPlayer: this.currentPlayer,
            communityCards: this.communityCards,
            players: this.getPlayersList(),
            bettingRoundStartPlayer: this.bettingRoundStartPlayer,
            hasEveryoneActed: this.hasEveryoneActed,
            smallBlind: this.smallBlind,
            bigBlind: this.bigBlind,
            minBet: this.minBet,
            currentRaisesInRound: this.currentRaisesInRound,
            maxRaisesPerRound: this.maxRaisesPerRound,
            lastRaisePlayerId: this.lastRaisePlayerId,
            readyPlayers: Array.from(this.readyPlayers),
            allPlayersReady: this.allPlayersReady,
            readyCount: this.readyPlayers.size,
            totalPlayers: this.getPlayerCount(),
            minPlayers: this.minPlayers,
            showdownResults: this.showdownResults
        };
    }

    getPlayersList() {
        return this.playerOrder.map(playerId => {
            const player = this.players.get(playerId);
            
            if (player.disconnected) {
                return null;
            }
            
            const playerData = {
                id: player.id,
                name: player.name,
                avatarUrl: player.avatarUrl,
                bank: player.bank,
                currentBet: player.currentBet,
                folded: player.folded,
                allIn: player.allIn,
                hasActed: player.hasActed,
                handRank: player.handRank,
                position: player.position,
                isCurrentPlayer: playerId === this.getActivePlayerOrder()[this.currentPlayer],
                ready: player.ready
            };
            
            if (this.status === 'playing') {
                playerData.hand = player.hand;
            }
            
            return playerData;
        }).filter(player => player !== null);
    }

    getPlayerInfo(playerId) {
        const player = this.players.get(playerId);
        if (!player) return null;
        
        return {
            id: player.id,
            name: player.name,
            avatarUrl: player.avatarUrl,
            bank: player.bank,
            currentBet: player.currentBet,
            folded: player.folded,
            allIn: player.allIn,
            hasActed: player.hasActed,
            hand: player.hand,
            handRank: player.handRank,
            position: player.position,
            isCurrentPlayer: playerId === this.getActivePlayerOrder()[this.currentPlayer]
        };
    }

    cleanup() {
        this.clearTimers();
        this.players.clear();
        this.playerOrder = [];
        this.socketToPlayer.clear();
    }
}

module.exports = SingleRoomGame; 