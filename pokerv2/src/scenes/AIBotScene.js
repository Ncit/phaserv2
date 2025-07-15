import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';
import { HandEvaluator } from '../utils/HandEvaluator.js';

export class AIBotScene extends Phaser.Scene {
    constructor() {
        super('AIBotScene');
        this.gameState = {
            phase: 'preflop', // preflop, flop, turn, river, showdown
            pot: 0,
            currentBet: 0,
            dealerPosition: 0,
            currentPlayer: 0,
            players: [],
            communityCards: [],
            deck: [],
            smallBlind: 10,
            bigBlind: 20,
            minBet: 20,
            bettingRoundStartPlayer: 0, // Track who started the betting round
            hasEveryoneActed: false // Track if everyone has acted
        };
        this.aiPlayers = [];
        this.humanPlayer = null;
        this.handEvaluator = new HandEvaluator();
    }

    preload() {
        // Use AssetHelper for centralized asset loading
        AssetHelper.loadGameAssets(this);
        AssetHelper.loadCardAssets(this);
        AssetHelper.loadPlayerAssets(this);
    }

    create() {
        // Initialize all managers
        this.buttonManager = new ButtonManager(this);
        this.playerManager = new PlayerManager(this);
        this.cardManager = new CardManager(this);
        
        // Wait a frame to ensure all assets are loaded
        this.time.delayedCall(100, () => {
            // Debug: Check if cards are loaded
            const loadedCards = this.cardManager.loadAllCards();
            console.log(`AIBotScene: Found ${loadedCards} loaded cards`);
            
                    // Debug: Check specific cards
        console.log('AIBotScene: Checking card textures...');
        console.log('back_card exists:', this.textures.exists('back_card'));
        console.log('ace_of_hearts exists:', this.textures.exists('ace_of_hearts'));
        console.log('2_of_spades exists:', this.textures.exists('2_of_spades'));
        
        // Debug: Check card scale configuration
        console.log('AIBotScene: Card scale configuration:', PlayerConfig.cardContainer.cardScale);
            
            // Initialize game after cards are confirmed loaded
            this.initializeGame();
        });
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        this.uiManager.initializeAIBotScene();

        // Create background elements
        this.background = this.add.image(640, 360, 'game_bg');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        this.gamingTable.scale = 0.4;

        // Create game interface buttons
        this.menuGame = this.buttonManager.createButton('menuGame', 85, 60);
        this.settingsGame = this.buttonManager.createButton('settingsGame', 150, 60);
        this.chatButton = this.buttonManager.createButton('chat', 150, 640);

        // Create poker action buttons
        this.foldButton = this.buttonManager.createButton('fold', 310, 640);
        this.callButton = this.buttonManager.createButton('call', 510, 640);
        this.raiseButton = this.buttonManager.createButton('raise', 710, 640);
        
        
        // Quick action buttons removed
        
        // Create Next Round button (initially hidden)
        this.nextRoundButton = this.buttonManager.createButton('call', 1100, 628);
        this.nextRoundButton.setVisible(false);

        this.underline = this.add.image(640, 700, 'underline');
        this.underline.setDisplaySize(400, 10);

        // Add text labels
        this.createButtonLabels();
        this.createPokerActionLabels();
        this.createNextRoundButtonLabel();

        // Create chip bank display
        this.chipBank = this.add.image(600, 280, 'chip_button');
        this.chipBankText = this.add
            .text(670, 280, 'БАНК: 0', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.chipBank.scale = 0.2;

        // Create community cards container
        this.communityCardsContainer = this.add.container(640, 360);
        this.communityCardsContainer.setScale(0.5);
        // Create hand rank display
        this.handRank = this.add
            .text(640, 430, '', {
                fontFamily: 'Arial',
                fontSize: '22px',
                fill: '#FF4B00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create game info display
        this.gameInfo = this.add
            .text(640, 50, 'Texas Hold\'em - AI Bot Game', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.phaseText = this.add
            .text(640, 80, 'Preflop', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Setup button handlers
        this.setupButtonHandlers();
        
        // Add scene shutdown event listener
        this.events.on('shutdown', () => {
            console.log('AIBotScene: Scene shutdown event triggered');
            this.shutdown();
        });
    }

    initializeGame() {
        // Create 5 AI players and 1 human player
        const playerData = [
            {
                name: 'AI Bot 1',
                bank: 1000,
                position: { x: 280, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'medium'
            },
            {
                name: 'AI Bot 2',
                bank: 1000,
                position: { x: 280, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'medium'
            },
            {
                name: window.appData?.first_name || 'Player',
                bank: 1000,
                position: { x: 670, y: 520 },
                avatarUrl: window.appData?.photo_200 || 'https://gravatar.com/avatar/3?s=400&d=robohash&r=x',
                isAI: false
            },
            {
                name: 'AI Bot 3',
                bank: 1000,
                position: { x: 980, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'medium'
            },
            {
                name: 'AI Bot 4',
                bank: 1000,
                position: { x: 980, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/5?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'medium'
            }
        ];

        // Initialize players
        this.gameState.players = playerData.map((data, index) => ({
            id: index,
            name: data.name,
            bank: data.bank,
            avatarUrl: data.avatarUrl,
            currentBet: 0,
            folded: false,
            allIn: false,
            isAI: data.isAI,
            aiLevel: data.aiLevel,
            hand: [],
            handRank: null,
            position: data.position
        }));

        // Create player UI elements
        playerData.forEach((player, index) => {
            this.createCustomPlayer(index + 1, player);
        });

        // Initialize deck
        this.initializeDeck();
        
        // Start new hand
        this.startNewHand();
    }

    initializeDeck() {
        this.gameState.deck = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        for (const suit of suits) {
            for (const value of values) {
                this.gameState.deck.push({ suit, value });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.gameState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameState.deck[i], this.gameState.deck[j]] = [this.gameState.deck[j], this.gameState.deck[i]];
        }
    }

    dealCard() {
        if (this.gameState.deck.length === 0) return null;
        return this.gameState.deck.pop();
    }

    startNewHand() {
        // Reset game state
        this.gameState.phase = 'preflop';
        this.gameState.pot = 0;
        this.gameState.currentBet = 0;
        this.gameState.communityCards = [];
        
        // Clear community cards from UI
        this.communityCardsContainer.removeAll(true);
        
        // Clear all player cards
        this.gameState.players.forEach((player, index) => {
            this.cardManager.clearPlayerCards(index + 1);
            player.currentBet = 0;
            player.folded = false;
            player.allIn = false;
            player.hand = [];
            player.handRank = null;
        });

        // Move dealer button
        this.gameState.dealerPosition = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
        
        // Shuffle deck
        this.initializeDeck();
        this.shuffleDeck();

        // Post blinds
        const smallBlindPos = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
        const bigBlindPos = (this.gameState.dealerPosition + 2) % this.gameState.players.length;
        
        this.postBlind(smallBlindPos, this.gameState.smallBlind);
        this.postBlind(bigBlindPos, this.gameState.bigBlind);
        
        this.gameState.currentBet = this.gameState.bigBlind;
        this.gameState.currentPlayer = (bigBlindPos + 1) % this.gameState.players.length;

        // Deal hole cards
        this.dealHoleCards();

        // Update UI
        this.updateUI();
        
        // Start betting round
        this.startBettingRound();
    }

    postBlind(playerIndex, amount) {
        const player = this.gameState.players[playerIndex];
        const actualBet = Math.min(amount, player.bank);
        player.currentBet = actualBet;
        player.bank -= actualBet;
        this.gameState.pot += actualBet;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
    }

    dealHoleCards() {
        console.log('AIBotScene: Starting to deal hole cards');
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.gameState.players.length; j++) {
                const card = this.dealCard();
                if (card) {
                    this.gameState.players[j].hand.push(card);
                    
                    // Add card to UI (face down for other players)
                    const isHumanPlayer = j === 2; // Human player is at index 2
                    console.log(`AIBotScene: Adding card ${card.value} of ${card.suit} to player ${j + 1}, faceUp: ${isHumanPlayer}`);
                    const result = this.cardManager.addCardToPlayer(j + 1, card.value, card.suit, isHumanPlayer);
                    if (!result) {
                        console.error(`AIBotScene: Failed to add card to player ${j + 1}`);
                    }
                }
            }
        }
        console.log('AIBotScene: Finished dealing hole cards');
    }

    dealCommunityCards(count) {
        for (let i = 0; i < count; i++) {
            const card = this.dealCard();
            if (card) {
                this.gameState.communityCards.push(card);
                this.addCommunityCard(card);
            }
        }
    }

    addCommunityCard(card) {
        const cardIndex = this.gameState.communityCards.length - 1;
        const cardX = -380 + (cardIndex * 200);
        const cardY = 0;
        
        const cardKey = `${card.value}_of_${card.suit}`;
        
        // Check if texture exists before creating sprite
        if (!this.textures.exists(cardKey)) {
            console.error(`AIBotScene: Card texture '${cardKey}' not found`);
            return;
        }
        
        try {
            const cardSprite = this.add.image(cardX, cardY, cardKey);
            cardSprite.setScale(0.3);
            this.communityCardsContainer.add(cardSprite);
        } catch (error) {
            console.error(`AIBotScene: Failed to create community card ${cardKey}:`, error);
        }
    }

    startBettingRound() {
        this.updateUI();
        
        console.log('AIBotScene: startBettingRound called, current player:', this.gameState.currentPlayer);
        
        // Check if current player is AI
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        console.log('AIBotScene: Current player:', {
            id: currentPlayer.id,
            name: currentPlayer.name,
            isAI: currentPlayer.isAI,
            folded: currentPlayer.folded,
            allIn: currentPlayer.allIn
        });
        
        // Safety check: if all players except one are folded, complete the round
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        if (activePlayers.length <= 1) {
            console.log('AIBotScene: Only one active player remaining, completing betting round');
            this.nextPhase();
            return;
        }
        
        // If current player is folded or all-in, move to next player immediately
        if (currentPlayer.folded || currentPlayer.allIn) {
            console.log('AIBotScene: Player folded/all-in, moving to next player');
            this.nextPlayer();
            return;
        }
        
        if (currentPlayer.isAI) {
            console.log('AIBotScene: AI player turn');
            this.makeAIDecision(currentPlayer);
        } else {
            console.log('AIBotScene: Human player turn - enabling actions');
            this.enablePlayerActions();
        }
    }

    makeAIDecision(player) {
        // Simple AI decision making
        setTimeout(() => {
            const decision = this.calculateAIDecision(player);
            this.executeAIAction(player, decision);
        }, 1000);
    }

    calculateAIDecision(player) {
        const callAmount = this.gameState.currentBet - player.currentBet;
        const potOdds = callAmount / (this.gameState.pot + callAmount);
        
        // Evaluate hand strength using HandEvaluator
        const handStrength = this.evaluateHandStrength(player);
        
        // AI decision logic based on hand strength, pot odds, and position
        const position = this.getPlayerPosition(player.id);
        const isLatePosition = position >= 3;
        
        if (handStrength > 0.8) {
            // Very strong hand - raise aggressively
            const raiseAmount = this.gameState.currentBet === 0 ? this.gameState.bigBlind * 3 : this.gameState.currentBet * 3;
            return { action: 'raise', amount: raiseAmount };
        } else if (handStrength > 0.6) {
            // Strong hand - raise
            const raiseAmount = this.gameState.currentBet === 0 ? this.gameState.bigBlind * 2 : this.gameState.currentBet * 2;
            return { action: 'raise', amount: raiseAmount };
        } else if (handStrength > 0.4 || potOdds < 0.25 || isLatePosition) {
            // Medium hand or good pot odds or late position - call
            return { action: 'call', amount: callAmount };
        } else if (handStrength > 0.2 && isLatePosition) {
            // Weak hand but late position - call small bets
            return { action: 'call', amount: Math.min(callAmount, this.gameState.bigBlind) };
        } else {
            // Weak hand - fold
            return { action: 'fold', amount: 0 };
        }
    }

    evaluateHandStrength(player) {
        const hand = player.hand;
        const community = this.gameState.communityCards;
        
        if (community.length === 0) {
            // Preflop - evaluate hole cards only
            return this.evaluateHoleCards(hand);
        } else {
            // Postflop - evaluate complete hand
            const handEvaluation = this.handEvaluator.evaluateHand(hand, community);
            return this.handEvaluator.getHandStrength(handEvaluation);
        }
    }

    evaluateHoleCards(holeCards) {
        if (holeCards.length !== 2) return 0;
        
        const [card1, card2] = holeCards;
        const val1 = this.handEvaluator.cardValues[card1.value];
        const val2 = this.handEvaluator.cardValues[card2.value];
        const isSuited = card1.suit === card2.suit;
        
        // Premium hands
        if (val1 === 14 && val2 === 14) return 0.95; // AA
        if ((val1 === 14 && val2 === 13) || (val1 === 13 && val2 === 14)) return 0.9; // AK
        if ((val1 === 14 && val2 === 12) || (val1 === 12 && val2 === 14)) return 0.85; // AQ
        if (val1 === 14 && val2 === 14) return 0.8; // AJ
        
        // Pairs
        if (val1 === val2) {
            if (val1 >= 10) return 0.75; // TT+
            if (val1 >= 7) return 0.6; // 77-99
            return 0.4; // Lower pairs
        }
        
        // High cards
        if (val1 >= 12 && val2 >= 12) return isSuited ? 0.5 : 0.4; // KQ
        if (val1 >= 11 && val2 >= 11) return isSuited ? 0.45 : 0.35; // KJ
        
        return 0.2; // Weak hands
    }

    getPlayerPosition(playerId) {
        const dealerPos = this.gameState.dealerPosition;
        const playerPos = (playerId - dealerPos + this.gameState.players.length) % this.gameState.players.length;
        return playerPos;
    }

    executeAIAction(player, decision) {
        switch (decision.action) {
            case 'fold':
                this.foldPlayer(player.id);
                break;
            case 'call':
                this.callPlayer(player.id, decision.amount);
                break;
            case 'raise':
                this.raisePlayer(player.id, decision.amount);
                break;
        }
    }

    foldPlayer(playerId) {
        const player = this.gameState.players[playerId];
        player.folded = true;
        this.nextPlayer();
    }

    callPlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        const callAmount = Math.min(amount, player.bank);
        
        // If callAmount is 0, this is a check (no bet to call)
        if (callAmount > 0) {
            player.currentBet += callAmount;
            player.bank -= callAmount;
            this.gameState.pot += callAmount;
        }
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        this.nextPlayer();
    }

    raisePlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        const raiseAmount = Math.min(amount, player.bank);
        
        player.currentBet += raiseAmount;
        player.bank -= raiseAmount;
        this.gameState.pot += raiseAmount;
        this.gameState.currentBet = player.currentBet;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        this.nextPlayer();
    }

    nextPlayer() {
        let nextPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
        let iterations = 0;
        const maxIterations = this.gameState.players.length;
        
        console.log('AIBotScene: nextPlayer called, current player:', this.gameState.currentPlayer);
        
        // Skip folded players with safety check
        while (this.gameState.players[nextPlayer].folded && nextPlayer !== this.gameState.currentPlayer && iterations < maxIterations) {
            nextPlayer = (nextPlayer + 1) % this.gameState.players.length;
            iterations++;
        }
        
        // Safety check: if we've iterated too many times, something is wrong
        if (iterations >= maxIterations) {
            console.error('AIBotScene: Infinite loop detected in nextPlayer, forcing next phase');
            this.nextPhase();
            return;
        }
        
        // Check if we've gone around the table
        if (nextPlayer === this.gameState.bettingRoundStartPlayer) {
            this.gameState.hasEveryoneActed = true;
            console.log('AIBotScene: Everyone has acted');
        }
        
        console.log('AIBotScene: Next player would be:', nextPlayer);
        
        // Check if betting round is complete
        if (this.isBettingRoundComplete()) {
            console.log('AIBotScene: Betting round complete, moving to next phase');
            this.nextPhase();
        } else if (nextPlayer === this.gameState.currentPlayer) {
            // We've gone around the table and come back to the same player
            // This means all other players are folded, so we should complete the round
            console.log('AIBotScene: All other players folded, completing betting round');
            this.nextPhase();
        } else {
            console.log('AIBotScene: Continuing betting round, next player:', nextPlayer);
            this.gameState.currentPlayer = nextPlayer;
            this.startBettingRound();
        }
    }

    isBettingRoundComplete() {
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        
        // If there's only one active player, betting is complete
        if (activePlayers.length <= 1) {
            console.log('AIBotScene: Betting complete - only one active player');
            return true;
        }
        
        // Check if all active players have equal bets or are all-in
        const allBetsEqual = activePlayers.every(p => p.currentBet === this.gameState.currentBet || p.allIn);
        
        console.log('AIBotScene: Betting round check:', {
            phase: this.gameState.phase,
            currentBet: this.gameState.currentBet,
            activePlayers: activePlayers.length,
            allBetsEqual,
            hasEveryoneActed: this.gameState.hasEveryoneActed,
            playerBets: activePlayers.map(p => ({ id: p.id, bet: p.currentBet, allIn: p.allIn }))
        });
        
        // For preflop, complete if all bets are equal
        if (this.gameState.phase === 'preflop') {
            const shouldComplete = allBetsEqual;
            console.log('AIBotScene: Preflop betting complete:', shouldComplete);
            return shouldComplete;
        }
        
        // For post-flop phases, check if everyone has acted AND all bets are equal
        const shouldComplete = allBetsEqual && this.gameState.hasEveryoneActed;
        console.log('AIBotScene: Post-flop betting complete:', shouldComplete);
        return shouldComplete;
    }

    nextPhase() {
        console.log('AIBotScene: nextPhase called, current phase:', this.gameState.phase);
        
        // Check if we should go directly to showdown
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        if (activePlayers.length <= 1) {
            console.log('AIBotScene: Only one active player, going directly to showdown');
            this.gameState.phase = 'showdown';
            this.showdown();
            return;
        }
        
        switch (this.gameState.phase) {
            case 'preflop':
                this.gameState.phase = 'flop';
                this.dealCommunityCards(3);
                break;
            case 'flop':
                this.gameState.phase = 'turn';
                this.dealCommunityCards(1);
                break;
            case 'turn':
                this.gameState.phase = 'river';
                this.dealCommunityCards(1);
                break;
            case 'river':
                this.gameState.phase = 'showdown';
                this.showdown();
                return;
        }
        
        // Reset betting for new phase
        this.gameState.currentBet = 0;
        this.gameState.players.forEach(player => {
            player.currentBet = 0;
        });
        
        // Set starting player for this betting round, ensuring it's an active player
        let startingPlayer = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
        let attempts = 0;
        
        // Find the first active player after the dealer
        while (this.gameState.players[startingPlayer].folded && attempts < this.gameState.players.length) {
            startingPlayer = (startingPlayer + 1) % this.gameState.players.length;
            attempts++;
        }
        
        this.gameState.currentPlayer = startingPlayer;
        this.gameState.bettingRoundStartPlayer = startingPlayer;
        this.gameState.hasEveryoneActed = false;
        
        console.log('AIBotScene: Starting new betting round for phase:', this.gameState.phase);
        this.startBettingRound();
    }

    showdown() {
        console.log('AIBotScene: Starting showdown - revealing AI players\' cards');
        
        // Only reveal AI players' cards (both active and folded)
        this.gameState.players.forEach((player, playerIndex) => {
            if (player.hand && player.hand.length > 0 && player.isAI) {
                console.log(`AIBotScene: Revealing cards for AI ${player.name}:`, player.hand);
                
                // Flip both cards face up for this AI player
                for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
                    this.cardManager.flipCard(playerIndex + 1, cardIndex);
                }
            }
        });
        
        // Wait a moment for the card flip animation to be visible
        this.time.delayedCall(1000, () => {
            this.evaluateShowdown();
        });
    }
    
    evaluateShowdown() {
        // Evaluate all hands and determine winner
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        
        if (activePlayers.length === 0) {
            // All players folded - shouldn't happen but handle it
            this.startNewHand();
            return;
        }
        
        // Debug: Log community cards
        console.log('AIBotScene: Community cards for showdown:', this.gameState.communityCards);
        
        // Evaluate each player's hand
        const playerHands = activePlayers.map(player => {
            const allCards = [...player.hand, ...this.gameState.communityCards];
            console.log(`AIBotScene: Evaluating hand for ${player.name}:`, {
                holeCards: player.hand.map(c => `${c.value} of ${c.suit}`),
                communityCards: this.gameState.communityCards.map(c => `${c.value} of ${c.suit}`),
                allCards: allCards.map(c => `${c.value} of ${c.suit}`)
            });
            
            const handEvaluation = this.handEvaluator.evaluateHand(player.hand, this.gameState.communityCards);
            console.log(`AIBotScene: ${player.name} hand evaluation:`, handEvaluation);
            
            return {
                player,
                hand: handEvaluation
            };
        });
        
        // Find the winner(s)
        let winners = [playerHands[0]];
        for (let i = 1; i < playerHands.length; i++) {
            const comparison = this.handEvaluator.compareHands(playerHands[i].hand, winners[0].hand);
            if (comparison > 0) {
                winners = [playerHands[i]];
            } else if (comparison === 0) {
                winners.push(playerHands[i]);
            }
        }
        
        // Split pot among winners
        const potPerWinner = Math.floor(this.gameState.pot / winners.length);
        winners.forEach(({ player }) => {
            player.bank += potPerWinner;
        });
        
        // Highlight winning players' cards
        this.highlightWinningCards(winners);
        
        // Show hand rankings for all players
        this.showHandRankings(playerHands);
        
        // Update UI
        const winnerNames = winners.map(({ player }) => player.name).join(', ');
        
        // Sort winners by hand strength to get the best hand description
        const sortedWinners = winners.sort((a, b) => {
            return this.handEvaluator.compareHands(b.hand, a.hand);
        });
        const handDescription = sortedWinners[0].hand.rankName;
        
        this.handRank.setText(`Winner: ${winnerNames} (${handDescription})`);
        
        // Update player displays
        this.updateUI();
        
        // Show Next Round button
        this.nextRoundButton.setVisible(true);
        this.nextRoundButtonText.setVisible(true);
        
        console.log('AIBotScene: Showdown complete');
    }
    
    showHandRankings(playerHands) {
        // Sort hands by strength (strongest first)
        playerHands.sort((a, b) => {
            return this.handEvaluator.compareHands(b.hand, a.hand);
        });
        
        // Create hand ranking display
        let rankingText = 'Hand Rankings:\n';
        playerHands.forEach((handData, index) => {
            const player = handData.player;
            const hand = handData.hand;
            const rank = index + 1;
            const rankSymbol = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            rankingText += `${rankSymbol} ${player.name}: ${hand.rankName}\n`;
        });
        
        // Display the rankings (you can customize this display method)
        console.log('AIBotScene: Hand Rankings:', rankingText);
        
        // You could also create a UI element to show this on screen
        // For now, we'll just log it to console
    }
    
    highlightWinningCards(winners) {
        // Reset all card highlights first
        this.gameState.players.forEach((player, playerIndex) => {
            if (player.hand && player.hand.length > 0) {
                for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
                    const cardData = this.cardManager.getCard(playerIndex + 1, cardIndex);
                    if (cardData && cardData.sprite) {
                        cardData.sprite.clearTint();
                    }
                }
            }
        });
        
        // Highlight winning AI players' cards only
        winners.forEach(({ player }) => {
            const playerIndex = this.gameState.players.indexOf(player);
            if (player.hand && player.hand.length > 0 && player.isAI) {
                for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
                    const cardData = this.cardManager.getCard(playerIndex + 1, cardIndex);
                    if (cardData && cardData.sprite) {
                        // Add golden tint to winning AI cards
                        cardData.sprite.setTint(0xFFD700);
                    }
                }
            }
        });
    }

    updateUI() {
        // Update pot display
        this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
        
        // Update phase text
        this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
        
        // Update player displays
        this.gameState.players.forEach((player, index) => {
            this.updatePlayerDisplay(index + 1, player);
        });
    }

    updatePlayerDisplay(playerNumber, player) {
        // Find the player elements using the correct ID mapping
        // playerNumber is 1-based (1, 2, 3, 4, 5), but we need to convert to 0-based index
        const playerIndex = playerNumber - 1;
        
        let playerElements;
        if (player.isAI) {
            const aiPlayer = this.aiPlayers.find(p => p.id === playerIndex);
            if (aiPlayer) playerElements = aiPlayer.elements;
        } else {
            if (this.humanPlayer && this.humanPlayer.id === playerIndex) {
                playerElements = this.humanPlayer.elements;
            }
        }
        
        // Debug logging to help identify the issue
        if (!playerElements) {
            console.warn(`AIBotScene: No player elements found for player ${player.id} (${player.name}) at index ${playerIndex}`);
            return;
        }
        
        if (!playerElements.bankText || !playerElements.playerName || !playerElements.avatar) {
            console.warn(`AIBotScene: Missing player elements for player ${player.id}:`, {
                hasBankText: !!playerElements.bankText,
                hasPlayerName: !!playerElements.playerName,
                hasAvatar: !!playerElements.avatar
            });
            return;
        }
        
        try {
            // Update bank display
            playerElements.bankText.setText(`$${player.bank}`);
            
            // Update player name with current bet if applicable
            let displayName = player.name;
            if (player.currentBet > 0) {
                displayName += ` ($${player.currentBet})`;
            }
            if (player.folded) {
                displayName += ' [FOLDED]';
            }
            if (player.allIn) {
                displayName += ' [ALL IN]';
            }
            
            playerElements.playerName.setText(displayName);
            
            // Highlight current player
            if (player.id === this.gameState.currentPlayer) {
                playerElements.avatar.setTint(0x00ff00); // Green tint for current player
            } else {
                playerElements.avatar.clearTint();
            }
        } catch (error) {
            console.error(`AIBotScene: Error updating player display for player ${player.id}:`, error);
        }
    }

    createButtonLabels() {
        // Betting button labels removed
    }

    createPokerActionLabels() {
        this.foldButtonText = this.add
            .text(310, 628, 'СБРОСИТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.foldButtonValueX = this.add.image(310, 650, 'fold_x');
        this.foldButtonValueX.scale = 0.3;

        this.callButtonText = this.add
            .text(510, 628, 'УРАВНЯТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonText = this.add
            .text(710, 628, 'ПОДНЯТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    createNextRoundButtonLabel() {
        this.nextRoundButtonText = this.add
            .text(1100, 628, 'СЛЕДУЮЩИЙ РАУНД', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.nextRoundButtonText.setVisible(false);
    }

    setupButtonHandlers() {
        // Setup button click handlers
        this.foldButton.on('pointerdown', () => this.handleFold());
        this.callButton.on('pointerdown', () => this.handleCall());
        this.raiseButton.on('pointerdown', () => this.handleRaise());
        this.menuGame.on('pointerdown', () => this.handleMenu());
        this.settingsGame.on('pointerdown', () => this.handleSettings());
        this.chatButton.on('pointerdown', () => this.handleChat());
        this.nextRoundButton.on('pointerdown', () => this.handleNextRound());
    }

    enablePlayerActions() {
        // Enable action buttons for human player
        this.foldButton.setInteractive();
        this.callButton.setInteractive();
        this.raiseButton.setInteractive();
    }

    disablePlayerActions() {
        // Disable action buttons
        this.foldButton.disableInteractive();
        this.callButton.disableInteractive();
        this.raiseButton.disableInteractive();
    }

    handleFold() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            this.foldPlayer(currentPlayer.id);
            this.disablePlayerActions();
        }
    }

    handleCall() {
        console.log('AIBotScene: handleCall called');
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            const callAmount = this.gameState.currentBet - currentPlayer.currentBet;
            // If callAmount is 0 or negative, this is a check
            const actualCallAmount = Math.max(0, callAmount);
            console.log('AIBotScene: Call details:', {
                currentBet: this.gameState.currentBet,
                playerCurrentBet: currentPlayer.currentBet,
                callAmount,
                actualCallAmount
            });
            this.callPlayer(currentPlayer.id, actualCallAmount);
            this.disablePlayerActions();
        }
    }

    handleRaise() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            // Calculate proper raise amount
            let raiseAmount;
            if (this.gameState.currentBet === 0) {
                // No current bet, so minimum raise is big blind
                raiseAmount = this.gameState.bigBlind;
            } else {
                // Current bet exists, so raise must be at least double the current bet
                raiseAmount = this.gameState.currentBet * 2;
            }
            
            // Ensure raise doesn't exceed player's bank
            raiseAmount = Math.min(raiseAmount, currentPlayer.bank);
            
            this.raisePlayer(currentPlayer.id, raiseAmount);
            this.disablePlayerActions();
        }
    }

    handleMenu() {
        // Clean up before switching scenes
        this.shutdown();
        this.scene.start('LobbyScene');
    }

    handleSettings() {
        // Handle settings
    }

    handleChat() {
        // Handle chat
    }

    handleNextRound() {
        // Hide winner title and Next Round button
        this.handRank.setText('');
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Check if any player has 0 money
        const hasPlayerWithZeroMoney = this.gameState.players.some(player => player.bank <= 0);
        
        if (hasPlayerWithZeroMoney) {
            console.log('AIBotScene: Player with 0 money detected, restarting room from scratch');
            // Restart the room from scratch by going back to lobby
            this.scene.start('LobbyScene');
        } else {
            // Start new hand
            this.startNewHand();
        }
    }

    createCustomPlayer(playerNumber, playerData) {
        const { x, y } = playerData.position;
        
        // Create temporary avatar placeholder first
        const avatar = this.add.image(x, y, 'avatar');
        avatar.setScale(0.3);
        
        // Load and create avatar from URL
        const avatarKey = `avatar${playerNumber}`;
        this.load.image(avatarKey, playerData.avatarUrl);
        
        // Create avatar after loading
        this.load.once('complete', () => {
            if (this.textures.exists(avatarKey)) {
                // Replace the placeholder with the loaded avatar
                avatar.setTexture(avatarKey);
            }
            // If loading fails, keep the default avatar
        });
        
        // Start loading
        this.load.start();
        
        // Create player name background
        const nameX = x - 90;
        const nameY = y + 0;
        const nameBackground = this.add.image(nameX, nameY, 'player_name_placeholder');
        nameBackground.setScale(0.2);
        
        // Create player name text
        const playerName = this.add.text(nameX, nameY, playerData.name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create bank text
        const bankText = this.add.text(x, y + 70, `$${playerData.bank}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create card container
        this.cardManager.createCardContainer(playerNumber, x + 60, y + 30);
        
        // Store player elements
        const playerElements = {
            avatar,
            nameBackground,
            playerName,
            bankText
        };
        
        if (playerData.isAI) {
            this.aiPlayers.push({ id: playerNumber - 1, elements: playerElements });
        } else {
            this.humanPlayer = { id: playerNumber - 1, elements: playerElements };
        }
    }

    getPlayerElements(playerId) {
        // Find player elements by ID
        if (this.humanPlayer && this.humanPlayer.id === playerId) {
            return this.humanPlayer.elements;
        }
        
        const aiPlayer = this.aiPlayers.find(p => p.id === playerId);
        return aiPlayer ? aiPlayer.elements : null;
    }

    update() {
        // Game loop updates
    }

    shutdown() {
        console.log('AIBotScene: Shutting down and cleaning up resources');
        
        // Remove all event listeners from buttons
        if (this.foldButton) {
            this.foldButton.off('pointerdown');
            this.foldButton.destroy();
        }
        if (this.callButton) {
            this.callButton.off('pointerdown');
            this.callButton.destroy();
        }
        if (this.raiseButton) {
            this.raiseButton.off('pointerdown');
            this.raiseButton.destroy();
        }
        if (this.menuGame) {
            this.menuGame.off('pointerdown');
            this.menuGame.destroy();
        }
        if (this.settingsGame) {
            this.settingsGame.off('pointerdown');
            this.settingsGame.destroy();
        }
        if (this.chatButton) {
            this.chatButton.off('pointerdown');
            this.chatButton.destroy();
        }
        if (this.nextRoundButton) {
            this.nextRoundButton.off('pointerdown');
            this.nextRoundButton.destroy();
        }

        // Remove all event listeners from text objects
        if (this.foldButtonText) {
            this.foldButtonText.destroy();
        }
        if (this.callButtonText) {
            this.callButtonText.destroy();
        }
        if (this.raiseButtonText) {
            this.raiseButtonText.destroy();
        }
        if (this.nextRoundButtonText) {
            this.nextRoundButtonText.destroy();
        }
        if (this.foldButtonValueX) {
            this.foldButtonValueX.destroy();
        }

        // Clean up UI elements
        if (this.chipBankText) {
            this.chipBankText.destroy();
        }
        if (this.phaseText) {
            this.phaseText.destroy();
        }
        if (this.handRank) {
            this.handRank.destroy();
        }

        // Clean up background images
        if (this.background) {
            this.background.destroy();
        }
        if (this.gamingTable) {
            this.gamingTable.destroy();
        }
        if (this.underline) {
            this.underline.destroy();
        }
        if (this.chipBank) {
            this.chipBank.destroy();
        }
        if (this.gameInfo) {
            this.gameInfo.destroy();
        }

        // Clean up player elements
        if (this.humanPlayer && this.humanPlayer.elements) {
            Object.values(this.humanPlayer.elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        }

        this.aiPlayers.forEach(aiPlayer => {
            if (aiPlayer.elements) {
                Object.values(aiPlayer.elements).forEach(element => {
                    if (element && element.destroy) {
                        element.destroy();
                    }
                });
            }
        });

        // Clean up community cards container
        if (this.communityCardsContainer) {
            this.communityCardsContainer.destroy();
        }

        // Clean up managers
        if (this.cardManager) {
            this.cardManager.cleanup();
        }
        if (this.uiManager) {
            this.uiManager.cleanup();
        }

        // Remove all loaded avatar textures
        for (let i = 1; i <= 5; i++) {
            const avatarKey = `avatar${i}`;
            if (this.textures.exists(avatarKey)) {
                this.textures.remove(avatarKey);
            }
        }

        // Clear all timers and intervals
        if (this.aiTimer) {
            clearTimeout(this.aiTimer);
            this.aiTimer = null;
        }

        // Reset game state
        this.gameState = null;
        this.aiPlayers = [];
        this.humanPlayer = null;

        // Remove all scene events
        this.events.removeAllListeners();
        
        // Clear any remaining game objects
        this.children.removeAll(true);

        console.log('AIBotScene: Cleanup completed');
    }
} 