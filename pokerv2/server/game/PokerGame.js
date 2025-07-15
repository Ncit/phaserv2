const HandEvaluator = require('./HandEvaluator');

class PokerGame {
    constructor(gameId) {
        this.id = gameId;
        this.maxPlayers = 6;
        this.minPlayers = 2;
        this.status = 'waiting'; // waiting, playing, finished
        
        // Game state
        this.phase = 'waiting'; // waiting, preflop, flop, turn, river, showdown
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
        
        // Players
        this.players = new Map(); // playerId -> Player
        this.playerOrder = []; // Array of player IDs in order
        
        // Betting round tracking
        this.bettingRoundStartPlayer = 0;
        this.hasEveryoneActed = false;
        
        // Hand evaluator
        this.handEvaluator = new HandEvaluator();
        
        // Game timers
        this.actionTimer = null;
        this.actionTimeout = 30000; // 30 seconds per action
    }

    addPlayer(player) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error('Game is full');
        }

        if (this.status === 'playing') {
            throw new Error('Game is already in progress');
        }

        this.players.set(player.id, {
            ...player,
            currentBet: 0,
            folded: false,
            allIn: false,
            hasActed: false,
            hand: [],
            handRank: null,
            position: this.players.size
        });

        this.playerOrder.push(player.id);

        // Start game if we have enough players
        if (this.players.size >= this.minPlayers && this.status === 'waiting') {
            this.startGame();
        }

        return player;
    }

    removePlayer(socketId) {
        const playerId = this.getPlayerIdBySocketId(socketId);
        if (!playerId) return null;

        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            this.playerOrder = this.playerOrder.filter(id => id !== playerId);
            
            // If not enough players, end the game
            if (this.players.size < this.minPlayers && this.status === 'playing') {
                this.endGame();
            }
        }

        return player;
    }

    getPlayerIdBySocketId(socketId) {
        for (const [playerId, player] of this.players.entries()) {
            if (player.socketId === socketId) {
                return playerId;
            }
        }
        return null;
    }

    hasPlayer(playerId) {
        return this.players.has(playerId);
    }

    getPlayerCount() {
        return this.players.size;
    }

    startGame() {
        this.status = 'playing';
        this.startNewHand();
    }

    endGame() {
        this.status = 'waiting';
        this.phase = 'waiting';
        this.clearTimers();
    }

    startNewHand() {
        // Reset game state
        this.phase = 'preflop';
        this.pot = 0;
        this.currentBet = 0;
        this.communityCards = [];
        
        // Reset all players
        for (const player of this.players.values()) {
            player.currentBet = 0;
            player.folded = false;
            player.allIn = false;
            player.hand = [];
            player.handRank = null;
            player.hasActed = false;
        }

        // Move dealer button
        this.dealerPosition = (this.dealerPosition + 1) % this.playerOrder.length;
        
        // Initialize and shuffle deck
        this.initializeDeck();
        this.shuffleDeck();

        // Post blinds
        const smallBlindPos = (this.dealerPosition + 1) % this.playerOrder.length;
        const bigBlindPos = (this.dealerPosition + 2) % this.playerOrder.length;
        
        this.postBlind(smallBlindPos, this.smallBlind);
        this.postBlind(bigBlindPos, this.bigBlind);
        
        this.currentBet = this.bigBlind;
        this.currentPlayer = (bigBlindPos + 1) % this.playerOrder.length;

        // Deal hole cards
        this.dealHoleCards();

        // Start betting round
        this.startBettingRound();
    }

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

    postBlind(playerIndex, amount) {
        const playerId = this.playerOrder[playerIndex];
        const player = this.players.get(playerId);
        const actualBet = Math.min(amount, player.bank);
        
        player.currentBet = actualBet;
        player.bank -= actualBet;
        this.pot += actualBet;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
    }

    dealHoleCards() {
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
            for (const playerId of this.playerOrder) {
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
        
        // Check if only one active player remains
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            this.nextPhase();
            return;
        }

        // Skip folded/all-in players
        while (this.isCurrentPlayerFoldedOrAllIn()) {
            this.nextPlayer();
        }

        // Start action timer
        this.startActionTimer();
    }

    isCurrentPlayerFoldedOrAllIn() {
        const currentPlayerId = this.playerOrder[this.currentPlayer];
        const player = this.players.get(currentPlayerId);
        return player.folded || player.allIn;
    }

    getActivePlayers() {
        return Array.from(this.players.values()).filter(p => !p.folded);
    }

    handlePlayerAction(socketId, actionData) {
        const playerId = this.getPlayerIdBySocketId(socketId);
        if (!playerId) {
            throw new Error('Player not found');
        }

        const currentPlayerId = this.playerOrder[this.currentPlayer];
        if (playerId !== currentPlayerId) {
            throw new Error('Not your turn');
        }

        const player = this.players.get(playerId);
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
        const raiseAmount = Math.min(amount, player.bank);
        
        if (raiseAmount <= this.currentBet) {
            throw new Error('Raise must be greater than current bet');
        }
        
        player.currentBet += raiseAmount;
        player.bank -= raiseAmount;
        this.pot += raiseAmount;
        this.currentBet = player.currentBet;
        player.hasActed = true;
        
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
            amount: raiseAmount
        };
    }

    allInPlayer(playerId) {
        const player = this.players.get(playerId);
        const allInAmount = player.bank;
        
        return this.raisePlayer(playerId, allInAmount);
    }

    nextPlayer() {
        let nextPlayer = (this.currentPlayer + 1) % this.playerOrder.length;
        let iterations = 0;
        
        // Skip folded players
        while (this.players.get(this.playerOrder[nextPlayer]).folded && 
               nextPlayer !== this.currentPlayer && 
               iterations < this.playerOrder.length) {
            nextPlayer = (nextPlayer + 1) % this.playerOrder.length;
            iterations++;
        }
        
        // Check if betting round is complete
        if (this.isBettingRoundComplete()) {
            this.nextPhase();
        } else {
            this.currentPlayer = nextPlayer;
            this.startBettingRound();
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
        
        if (this.phase === 'preflop') {
            return allBetsEqual;
        }
        
        return allBetsEqual && allHaveActed;
    }

    nextPhase() {
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
        for (const player of this.players.values()) {
            player.currentBet = 0;
            player.hasActed = false;
        }
        
        // Set starting player
        let startingPlayer = (this.dealerPosition + 1) % this.playerOrder.length;
        while (this.players.get(this.playerOrder[startingPlayer]).folded) {
            startingPlayer = (startingPlayer + 1) % this.playerOrder.length;
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
        
        this.phase = 'showdown';
    }

    startActionTimer() {
        this.actionTimer = setTimeout(() => {
            // Auto-fold current player if they don't act
            const currentPlayerId = this.playerOrder[this.currentPlayer];
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
            hasEveryoneActed: this.hasEveryoneActed
        };
    }

    getPlayersList() {
        return this.playerOrder.map(playerId => {
            const player = this.players.get(playerId);
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
                isCurrentPlayer: playerId === this.playerOrder[this.currentPlayer]
            };
        });
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
            isCurrentPlayer: playerId === this.playerOrder[this.currentPlayer]
        };
    }

    cleanup() {
        this.clearTimers();
        this.players.clear();
        this.playerOrder = [];
    }
}

module.exports = PokerGame; 