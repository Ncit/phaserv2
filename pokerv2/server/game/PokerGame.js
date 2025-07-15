const HandEvaluator = require('./HandEvaluator');

class PokerGame {
    constructor(gameId) {
        this.id = gameId;
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
        
        // Players
        this.players = new Map(); // playerId -> Player
        this.playerOrder = []; // Array of player IDs in order
        
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

    addPlayer(player) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error('Game is full');
        }

        // Check if this is a reconnection (player with same name already exists)
        const existingPlayer = this.findPlayerByName(player.name);
        
        if (existingPlayer) {
            // This is a reconnection - update the socket ID and restore the player
            console.log(`🔄 Player ${player.name} reconnecting...`);
            existingPlayer.socketId = player.socketId;
            existingPlayer.avatarUrl = player.avatarUrl; // Update avatar if changed
            
            // If game is in progress, mark player as not folded and not all-in
            if (this.status === 'playing') {
                existingPlayer.folded = false;
                existingPlayer.allIn = false;
                existingPlayer.hasActed = false;
                // Don't reset hand - keep existing cards
            }
            
            return existingPlayer;
        }

        // Allow joining only in lobby state for new players
        if (this.status === 'playing') {
            throw new Error('Game is already in progress. Please wait for the current game to finish.');
        }

        this.players.set(player.id, {
            ...player,
            currentBet: 0,
            folded: false,
            allIn: false,
            hasActed: false,
            hand: [],
            handRank: null,
            position: this.players.size,
            ready: false
        });

        this.playerOrder.push(player.id);

        return player;
    }

    removePlayer(socketId) {
        const playerId = this.getPlayerIdBySocketId(socketId);
        if (!playerId) return null;

        const player = this.players.get(playerId);
        if (player) {
            // Mark player as disconnected instead of removing them completely
            player.socketId = null;
            player.disconnected = true;
            
            // Remove player from ready players set when they disconnect
            this.readyPlayers.delete(playerId);
            player.ready = false;
            
            // Recalculate allPlayersReady status
            this.allPlayersReady = this.readyPlayers.size >= this.minPlayers && 
                                  this.readyPlayers.size === this.getPlayerCount();
            
            // If game is in progress, mark player as folded
            if (this.status === 'playing') {
                player.folded = true;
                console.log(`🔄 Player ${player.name} marked as disconnected and folded`);
            }
            
            // If not enough active players, end the game
            const activePlayers = this.getActivePlayers();
            if (activePlayers.length < this.minPlayers && this.status === 'playing') {
                console.log(`🛑 Not enough active players (${activePlayers.length}/${this.minPlayers}), ending game`);
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

    hasPlayerBySocketId(socketId) {
        for (const [playerId, player] of this.players.entries()) {
            if (player.socketId === socketId) {
                return true;
            }
        }
        return false;
    }

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

    setPlayerReady(playerId) {
        if (!this.players.has(playerId)) {
            throw new Error('Player not found');
        }

        const player = this.players.get(playerId);
        player.ready = true;
        this.readyPlayers.add(playerId);

        // Give player 1000 money when they click ready
        player.bank = 1000;

        // Check if all players are ready and we have enough players
        if (this.readyPlayers.size >= this.minPlayers && 
            this.readyPlayers.size === this.getPlayerCount()) {
            this.allPlayersReady = true;
        }

        return {
            playerId,
            ready: true,
            allPlayersReady: this.allPlayersReady,
            readyCount: this.readyPlayers.size,
            totalPlayers: this.getPlayerCount()
        };
    }

    setPlayerNotReady(playerId) {
        if (!this.players.has(playerId)) {
            throw new Error('Player not found');
        }

        const player = this.players.get(playerId);
        player.ready = false;
        this.readyPlayers.delete(playerId);
        this.allPlayersReady = false;

        return {
            playerId,
            ready: false,
            allPlayersReady: false,
            readyCount: this.readyPlayers.size,
            totalPlayers: this.getPlayerCount()
        };
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

    endGame() {
        this.status = 'lobby';
        this.phase = 'lobby';
        this.readyPlayers.clear();
        this.allPlayersReady = false;
        
        // Reset all players to not ready
        for (const player of this.players.values()) {
            player.ready = false;
            player.currentBet = 0;
            player.folded = false;
            player.allIn = false;
            player.hand = [];
            player.handRank = null;
            // Reset bank to 1000 for next game
            player.bank = 1000;
        }
        
        // Clear game state
        this.pot = 0;
        this.currentBet = 0;
        this.communityCards = [];
        
        this.clearTimers();
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

    resetRoom() {
        console.log('PokerGame: Resetting entire room state');
        
        // Reset game status to lobby
        this.status = 'lobby';
        this.phase = 'lobby';
        
        // Clear all game state
        this.pot = 0;
        this.currentBet = 0;
        this.communityCards = [];
        this.showdownResults = null;
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        // Reset all players to lobby state
        for (const player of this.players.values()) {
            player.currentBet = 0;
            player.folded = false;
            player.allIn = false;
            player.hand = [];
            player.handRank = null;
            player.hasActed = false;
            player.ready = false;
            // Reset bank to 1000 for next game
            player.bank = 1000;
        }
        
        // Clear ready status
        this.readyPlayers.clear();
        this.allPlayersReady = false;
        
        // Clear timers
        this.clearTimers();
        
        console.log('PokerGame: Room reset complete - back to lobby state');
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
        
        // Don't start betting round if we're in showdown
        if (this.phase === 'showdown') {
            console.log('PokerGame: Cannot start betting round in showdown phase');
            return;
        }
        
        // Check if only one active player remains
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            console.log('PokerGame: Only one active player, moving to showdown');
            this.nextPhase();
            return;
        }

        // Check if betting round is already complete
        if (this.isBettingRoundComplete()) {
            console.log('PokerGame: Betting round already complete, moving to next phase');
            this.nextPhase();
            return;
        }

        // Skip folded/all-in players
        while (this.isCurrentPlayerFoldedOrAllIn()) {
            this.nextPlayer();
            
            // Check again if betting round is complete after skipping players
            if (this.isBettingRoundComplete()) {
                console.log('PokerGame: Betting round complete after skipping players, moving to next phase');
                this.nextPhase();
                return;
            }
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
        return Array.from(this.players.values()).filter(p => !p.folded && !p.disconnected);
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
        
        // Check if we've reached the maximum raises for this round
        if (this.currentRaisesInRound >= this.maxRaisesPerRound) {
            throw new Error('Maximum number of raises reached for this betting round');
        }
        
        // The amount parameter is the total bet amount the player wants to bet
        const totalBetAmount = Math.min(amount, player.bank);
        
        // Calculate the additional amount needed
        const additionalAmount = totalBetAmount - player.currentBet;
        
        // Validate that this is a valid raise
        if (totalBetAmount <= this.currentBet) {
            throw new Error('Raise must be greater than current bet');
        }
        
        // Update player's bet and bank
        player.currentBet = totalBetAmount;
        player.bank -= additionalAmount;
        this.pot += additionalAmount;
        this.currentBet = totalBetAmount;
        player.hasActed = true;
        
        // Increment raise counter and track last raiser
        this.currentRaisesInRound++;
        this.lastRaisePlayerId = playerId;
        
        console.log(`PokerGame: Player ${player.name} raised. Raises this round: ${this.currentRaisesInRound}/${this.maxRaisesPerRound}`);
        
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
        
        // For all-in, we don't need to validate against current bet
        // because all-in is always a valid action regardless of the current bet
        player.currentBet += allInAmount;
        player.bank -= allInAmount;
        this.pot += allInAmount;
        
        // If the all-in amount is greater than current bet, update current bet
        if (player.currentBet > this.currentBet) {
            this.currentBet = player.currentBet;
            
            // Check if this all-in acts as a raise and enforce raise limit
            if (this.currentRaisesInRound >= this.maxRaisesPerRound) {
                console.log(`PokerGame: All-in by ${player.name} would exceed raise limit, but all-in is always allowed`);
            } else {
                // Increment raise counter and track last raiser
                this.currentRaisesInRound++;
                this.lastRaisePlayerId = playerId;
                console.log(`PokerGame: Player ${player.name} all-in acts as raise. Raises this round: ${this.currentRaisesInRound}/${this.maxRaisesPerRound}`);
            }
            
            // Reset action tracking for other players since this is a raise
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
            console.log('PokerGame: Betting round complete, moving to next phase');
            this.nextPhase();
        } else {
            this.currentPlayer = nextPlayer;
            // Only start betting round if we're not already in the middle of a phase transition
            // and if we're not in showdown phase
            if (this.phase !== 'showdown') {
                console.log('PokerGame: Continuing betting round, next player:', nextPlayer);
                this.startBettingRound();
            }
        }
    }

    isBettingRoundComplete() {
        const activePlayers = this.getActivePlayers();
        
        if (activePlayers.length <= 1) {
            console.log('PokerGame: Betting complete - only one active player');
            return true;
        }
        
        const allBetsEqual = activePlayers.every(p => 
            p.currentBet === this.currentBet || p.allIn
        );
        
        const allHaveActed = activePlayers.every(p => 
            p.hasActed || p.allIn
        );
        
        const allAllIn = activePlayers.every(p => p.allIn);
        
        // For preflop, we need all bets equal (blinds are already posted)
        if (this.phase === 'preflop') {
            const shouldComplete = allBetsEqual;
            console.log('PokerGame: Preflop betting complete:', shouldComplete, {
                phase: this.phase,
                currentBet: this.currentBet,
                activePlayers: activePlayers.length,
                allBetsEqual,
                playerBets: activePlayers.map(p => ({ 
                    id: p.id, 
                    name: p.name,
                    bet: p.currentBet, 
                    allIn: p.allIn 
                }))
            });
            return shouldComplete;
        }
        
        // For post-flop phases, we need all bets equal AND everyone has acted
        // OR if everyone has equal bets and no one can act (all all-in)
        // OR if we're in river phase and all bets are equal (no more betting after river)
        const shouldComplete = (allBetsEqual && allHaveActed) || allAllIn || (this.phase === 'river' && allBetsEqual);
        
        console.log('PokerGame: Post-flop betting complete:', shouldComplete, {
            phase: this.phase,
            currentBet: this.currentBet,
            activePlayers: activePlayers.length,
            allBetsEqual,
            allHaveActed,
            allAllIn,
            playerBets: activePlayers.map(p => ({ 
                id: p.id, 
                name: p.name,
                bet: p.currentBet, 
                allIn: p.allIn,
                hasActed: p.hasActed 
            }))
        });
        
        return shouldComplete;
    }

    nextPhase() {
        // Don't transition if we're already in showdown
        if (this.phase === 'showdown') {
            console.log('PokerGame: Already in showdown phase, no further transitions needed');
            return;
        }
        
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length <= 1) {
            console.log('PokerGame: Moving to showdown - only one active player');
            this.phase = 'showdown';
            this.showdown();
            return;
        }
        
        const previousPhase = this.phase;
        
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
        
        console.log(`PokerGame: Phase transition: ${previousPhase} → ${this.phase}`);
        
        // Reset betting for new phase
        this.currentBet = 0;
        this.currentRaisesInRound = 0;
        this.lastRaisePlayerId = null;
        
        for (const player of this.players.values()) {
            player.currentBet = 0;
            player.hasActed = false; // Reset action tracking for new betting round
        }
        
        // Set starting player
        let startingPlayer = (this.dealerPosition + 1) % this.playerOrder.length;
        while (this.players.get(this.playerOrder[startingPlayer]).folded) {
            startingPlayer = (startingPlayer + 1) % this.playerOrder.length;
        }
        
        this.currentPlayer = startingPlayer;
        this.bettingRoundStartPlayer = startingPlayer;
        this.hasEveryoneActed = false;
        
        console.log(`PokerGame: Starting new betting round for ${this.phase}, starting player: ${startingPlayer}`);
        this.startBettingRound();
    }

    showdown() {
        console.log('PokerGame: Starting showdown - evaluating hands and revealing all cards');
        
        const activePlayers = this.getActivePlayers();
        
        if (activePlayers.length === 0) {
            console.log('PokerGame: No active players, starting new hand');
            this.startNewHand();
            return;
        }
        
        // Reveal all players' cards (both active and folded)
        const allPlayers = Array.from(this.players.values());
        const revealedCards = allPlayers.map(player => ({
            playerId: player.id,
            playerName: player.name,
            cards: player.hand,
            folded: player.folded,
            allIn: player.allIn
        }));
        
        console.log('PokerGame: Revealing all players\' cards:', revealedCards);
        
        // Evaluate hands
        const playerHands = activePlayers.map(player => {
            const handEvaluation = this.handEvaluator.evaluateHand(
                player.hand, 
                this.communityCards
            );
            console.log(`PokerGame: ${player.name} hand evaluation:`, handEvaluation);
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
            console.log(`PokerGame: ${player.name} wins ${potPerWinner} chips`);
        });
        
        // Update hand rankings
        playerHands.forEach(({ player, hand }) => {
            player.handRank = hand;
        });
        
        // Store showdown results for client
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
            // Add revealed cards information
            revealedCards: revealedCards
        };
        
        console.log('PokerGame: Showdown complete:', this.showdownResults);
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
            hasEveryoneActed: this.hasEveryoneActed,
            // Betting configuration
            smallBlind: this.smallBlind,
            bigBlind: this.bigBlind,
            minBet: this.minBet,
            // Raise tracking
            currentRaisesInRound: this.currentRaisesInRound,
            maxRaisesPerRound: this.maxRaisesPerRound,
            lastRaisePlayerId: this.lastRaisePlayerId,
            // Lobby information
            readyPlayers: Array.from(this.readyPlayers),
            allPlayersReady: this.allPlayersReady,
            readyCount: this.readyPlayers.size,
            totalPlayers: this.getPlayerCount(), // Use active player count instead of total players
            minPlayers: this.minPlayers,
            // Showdown results
            showdownResults: this.showdownResults
        };
    }

    getPlayersList() {
        return this.playerOrder.map(playerId => {
            const player = this.players.get(playerId);
            
            // Skip disconnected players
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
                isCurrentPlayer: playerId === this.playerOrder[this.currentPlayer],
                ready: player.ready
            };
            
            // Only include hand information if game has started (not in lobby)
            if (this.status === 'playing') {
                playerData.hand = player.hand;
            }
            
            return playerData;
        }).filter(player => player !== null); // Remove null entries for disconnected players
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