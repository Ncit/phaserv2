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

export class FastGameScene extends Phaser.Scene {
    constructor() {
        super('FastGameScene');
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
            bettingRoundStartPlayer: 0,
            hasEveryoneActed: false,
            isMultiplayer: true,
            roomId: null,
            connectedPlayers: 0
        };
        this.handEvaluator = new HandEvaluator();
        this.multiplayerManager = null;
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
            console.log(`FastGameScene: Found ${loadedCards} loaded cards`);
            
            // Debug: Check specific cards
            console.log('FastGameScene: Checking card textures...');
            console.log('back_card exists:', this.textures.exists('back_card'));
            console.log('ace_of_hearts exists:', this.textures.exists('ace_of_hearts'));
            console.log('2_of_spades exists:', this.textures.exists('2_of_spades'));
            
            // Debug: Check card scale configuration
            console.log('FastGameScene: Card scale configuration:', PlayerConfig.cardContainer.cardScale);
            
            // Initialize game after cards are confirmed loaded
            this.initializeGame();
        });
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);
        this.uiManager.initializeAIBotScene(); // Reuse AI bot UI for now

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
        this.allInButton = this.buttonManager.createButton('allIn', 910, 640);
        
        // Create Next Round button (initially hidden)
        this.nextRoundButton = this.buttonManager.createButton('call', 1100, 640);
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
            .text(640, 50, 'Texas Hold\'em - Fast Game', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.phaseText = this.add
            .text(640, 80, 'Waiting for players...', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create multiplayer status display
        this.multiplayerStatus = this.add
            .text(640, 110, 'Players: 1/5', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#00FF00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Setup button handlers
        this.setupButtonHandlers();
        
        // Add scene shutdown event listener
        this.events.on('shutdown', () => {
            console.log('FastGameScene: Scene shutdown event triggered');
            this.shutdown();
        });

        // Initialize multiplayer connection
        this.initializeMultiplayer();
    }

    initializeMultiplayer() {
        // Generate a random room ID
        this.gameState.roomId = 'room_' + Math.random().toString(36).substr(2, 9);
        console.log('FastGameScene: Created room with ID:', this.gameState.roomId);

        // Simulate multiplayer connection (replace with actual multiplayer logic)
        this.simulateMultiplayerConnection();
    }

    simulateMultiplayerConnection() {
        // Simulate players joining the room
        let playerCount = 1; // Start with current player
        
        const joinInterval = setInterval(() => {
            if (playerCount < 5) {
                playerCount++;
                this.gameState.connectedPlayers = playerCount;
                this.updateMultiplayerStatus();
                
                if (playerCount === 5) {
                    clearInterval(joinInterval);
                    this.startMultiplayerGame();
                }
            }
        }, 2000); // Add a player every 2 seconds
    }

    updateMultiplayerStatus() {
        this.multiplayerStatus.setText(`Players: ${this.gameState.connectedPlayers}/5`);
        
        if (this.gameState.connectedPlayers === 5) {
            this.multiplayerStatus.setFill('#00FF00');
            this.phaseText.setText('Starting game...');
        } else {
            this.multiplayerStatus.setFill('#FFFF00');
        }
    }

    startMultiplayerGame() {
        console.log('FastGameScene: Starting multiplayer game with 5 players');
        this.phaseText.setText('Preflop');
        this.initializeGame();
    }

    initializeGame() {
        // Create 5 multiplayer players
        const playerData = [
            {
                name: window.appData?.first_name || 'Player 1',
                bank: 1000,
                position: { x: 280, y: 270 },
                avatarUrl: window.appData?.photo_200 || 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x',
                isAI: false,
                playerId: 'player1'
            },
            {
                name: 'Player 2',
                bank: 1000,
                position: { x: 280, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x',
                isAI: false,
                playerId: 'player2'
            },
            {
                name: 'Player 3',
                bank: 1000,
                position: { x: 670, y: 520 },
                avatarUrl: 'https://gravatar.com/avatar/3?s=400&d=robohash&r=x',
                isAI: false,
                playerId: 'player3'
            },
            {
                name: 'Player 4',
                bank: 1000,
                position: { x: 980, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x',
                isAI: false,
                playerId: 'player4'
            },
            {
                name: 'Player 5',
                bank: 1000,
                position: { x: 980, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/5?s=400&d=robohash&r=x',
                isAI: false,
                playerId: 'player5'
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
            hasActed: false,
            isAI: data.isAI,
            playerId: data.playerId,
            hand: [],
            handRank: null,
            position: data.position
        }));

        // Initialize deck and start first hand
        this.initializeDeck();
        this.startNewHand();
    }

    initializeDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        this.gameState.deck = [];
        for (const suit of suits) {
            for (const value of values) {
                this.gameState.deck.push({ suit, value });
            }
        }
        
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.gameState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameState.deck[i], this.gameState.deck[j]] = [this.gameState.deck[j], this.gameState.deck[i]];
        }
    }

    dealCard() {
        return this.gameState.deck.pop();
    }

    startNewHand() {
        console.log('FastGameScene: Starting new hand');
        
        // Reset game state
        this.gameState.phase = 'preflop';
        this.gameState.pot = 0;
        this.gameState.currentBet = 0;
        this.gameState.communityCards = [];
        this.gameState.hasEveryoneActed = false;
        
        // Reset players
        this.gameState.players.forEach(player => {
            player.hand = [];
            player.currentBet = 0;
            player.folded = false;
            player.allIn = false;
            player.hasActed = false;
        });
        
        // Move dealer position
        this.gameState.dealerPosition = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
        
        // Set current player to small blind
        this.gameState.currentPlayer = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
        
        // Shuffle and deal
        this.shuffleDeck();
        this.dealHoleCards();
        
        // Post blinds
        this.postBlind((this.gameState.dealerPosition + 1) % this.gameState.players.length, this.gameState.smallBlind);
        this.postBlind((this.gameState.dealerPosition + 2) % this.gameState.players.length, this.gameState.bigBlind);
        
        // Set current player to first to act after big blind
        this.gameState.currentPlayer = (this.gameState.dealerPosition + 3) % this.gameState.players.length;
        
        // Update UI
        this.updateUI();
        this.phaseText.setText('Preflop');
        
        // Start betting round
        this.startBettingRound();
    }

    postBlind(playerIndex, amount) {
        const player = this.gameState.players[playerIndex];
        const blindAmount = Math.min(amount, player.bank);
        
        player.currentBet = blindAmount;
        player.bank -= blindAmount;
        this.gameState.pot += blindAmount;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        this.updatePlayerDisplay(playerIndex, player);
    }

    dealHoleCards() {
        // Deal 2 cards to each player
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.gameState.players.length; j++) {
                const card = this.dealCard();
                this.gameState.players[j].hand.push(card);
                
                // Display card for current player only
                if (j === 2) { // Current player position
                    this.cardManager.displayPlayerCard(j, card, i);
                } else {
                    this.cardManager.displayPlayerCard(j, { suit: 'back', value: 'back' }, i);
                }
            }
        }
    }

    dealCommunityCards(count) {
        for (let i = 0; i < count; i++) {
            const card = this.dealCard();
            this.addCommunityCard(card);
        }
    }

    addCommunityCard(card) {
        this.gameState.communityCards.push(card);
        this.cardManager.displayCommunityCard(card, this.gameState.communityCards.length - 1);
    }

    startBettingRound() {
        console.log('FastGameScene: Starting betting round for phase:', this.gameState.phase);
        
        // Reset action tracking
        this.gameState.players.forEach(player => {
            player.hasActed = false;
        });
        
        // Set betting round start player
        this.gameState.bettingRoundStartPlayer = this.gameState.currentPlayer;
        
        // Enable actions for current player if it's the human player
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            this.enablePlayerActions();
        } else {
            // Simulate AI decision (in real multiplayer, this would be handled by other players)
            this.simulateAIDecision(currentPlayer);
        }
    }

    simulateAIDecision(player) {
        // Simulate AI decision for multiplayer (in real implementation, this would be handled by actual players)
        const decisions = ['fold', 'call', 'raise'];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];
        
        console.log(`FastGameScene: Simulating AI decision for ${player.name}: ${decision}`);
        
        setTimeout(() => {
            this.executeAIAction(player, decision);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }

    executeAIAction(player, decision) {
        switch (decision) {
            case 'fold':
                this.foldPlayer(player.id);
                break;
            case 'call':
                const callAmount = this.gameState.currentBet - player.currentBet;
                if (callAmount <= 0) {
                    this.checkPlayer(player.id);
                } else {
                    this.callPlayer(player.id, callAmount);
                }
                break;
            case 'raise':
                const raiseAmount = Math.min(this.gameState.bigBlind * 2, player.bank);
                this.raisePlayer(player.id, raiseAmount);
                break;
        }
    }

    foldPlayer(playerId) {
        const player = this.gameState.players[playerId];
        console.log(`FastGameScene: Player ${player.name} is folding`);
        player.folded = true;
        player.hasActed = true;
        this.nextPlayer();
    }

    checkPlayer(playerId) {
        const player = this.gameState.players[playerId];
        console.log(`FastGameScene: Player ${player.name} is checking`);
        player.hasActed = true;
        this.nextPlayer();
    }

    callPlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        const callAmount = Math.min(amount, player.bank);
        
        console.log(`FastGameScene: Player ${player.name} is calling with amount: ${callAmount}`);
        
        if (callAmount > 0) {
            player.currentBet += callAmount;
            player.bank -= callAmount;
            this.gameState.pot += callAmount;
        }
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        player.hasActed = true;
        this.nextPlayer();
    }

    raisePlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        const raiseAmount = Math.min(amount, player.bank);
        
        console.log(`FastGameScene: Player ${player.name} is raising with amount: ${raiseAmount}`);
        
        player.currentBet += raiseAmount;
        player.bank -= raiseAmount;
        this.gameState.pot += raiseAmount;
        this.gameState.currentBet = player.currentBet;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        // Reset action tracking for all players when someone raises
        this.gameState.players.forEach(p => {
            p.hasActed = false;
        });
        player.hasActed = true;
        
        this.nextPlayer();
    }

    nextPlayer() {
        // Find next active player
        let nextPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
        
        // Skip folded players
        while (this.gameState.players[nextPlayer].folded && nextPlayer !== this.gameState.bettingRoundStartPlayer) {
            nextPlayer = (nextPlayer + 1) % this.gameState.players.length;
        }
        
        this.gameState.currentPlayer = nextPlayer;
        
        // Check if betting round is complete
        if (this.isBettingRoundComplete()) {
            this.nextPhase();
        } else {
            // Continue with next player
            const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
            if (!currentPlayer.isAI) {
                this.enablePlayerActions();
            } else {
                this.simulateAIDecision(currentPlayer);
            }
        }
        
        this.updateUI();
    }

    isBettingRoundComplete() {
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        
        // If there's only one active player, betting is complete
        if (activePlayers.length <= 1) {
            console.log('FastGameScene: Betting complete - only one active player');
            return true;
        }
        
        // Check if all active players have acted and have equal bets or are all-in
        const allBetsEqual = activePlayers.every(p => p.currentBet === this.gameState.currentBet || p.allIn);
        const allHaveActed = activePlayers.every(p => p.hasActed || p.allIn);
        
        console.log('FastGameScene: Betting round check:', {
            phase: this.gameState.phase,
            currentBet: this.gameState.currentBet,
            activePlayers: activePlayers.length,
            allBetsEqual,
            allHaveActed,
            playerBets: activePlayers.map(p => ({ id: p.id, bet: p.currentBet, allIn: p.allIn, hasActed: p.hasActed }))
        });
        
        return allBetsEqual && allHaveActed;
    }

    nextPhase() {
        const phases = ['preflop', 'flop', 'turn', 'river', 'showdown'];
        const currentIndex = phases.indexOf(this.gameState.phase);
        
        if (currentIndex < phases.length - 1) {
            this.gameState.phase = phases[currentIndex + 1];
            
            // Deal community cards based on phase
            switch (this.gameState.phase) {
                case 'flop':
                    this.dealCommunityCards(3);
                    break;
                case 'turn':
                case 'river':
                    this.dealCommunityCards(1);
                    break;
            }
            
            // Reset betting for new phase
            this.gameState.currentBet = 0;
            this.gameState.players.forEach(player => {
                player.currentBet = 0;
                player.hasActed = false;
            });
            
            // Set current player to first active player after dealer
            this.gameState.currentPlayer = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
            while (this.gameState.players[this.gameState.currentPlayer].folded) {
                this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
            }
            
            this.updateUI();
            this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
            
            if (this.gameState.phase !== 'showdown') {
                this.startBettingRound();
            } else {
                this.showdown();
            }
        }
    }

    showdown() {
        console.log('FastGameScene: Starting showdown');
        this.disablePlayerActions();
        
        // Reveal all cards
        this.gameState.players.forEach((player, index) => {
            if (!player.folded) {
                console.log(`FastGameScene: Revealing cards for ${player.name}:`, player.hand);
                player.hand.forEach((card, cardIndex) => {
                    this.cardManager.flipPlayerCard(index, cardIndex);
                });
            }
        });
        
        // Evaluate hands after a delay
        this.time.delayedCall(2000, () => {
            this.evaluateShowdown();
        });
    }

    evaluateShowdown() {
        const activePlayers = this.gameState.players.filter(p => !p.folded);
        
        if (activePlayers.length === 0) {
            this.startNewHand();
            return;
        }
        
        // Evaluate each player's hand
        const playerHands = activePlayers.map(player => {
            const allCards = [...player.hand, ...this.gameState.communityCards];
            console.log(`FastGameScene: Evaluating hand for ${player.name}:`, {
                holeCards: player.hand,
                communityCards: this.gameState.communityCards,
                allCards: allCards
            });
            
            const handEvaluation = this.handEvaluator.evaluateHand(player.hand, this.gameState.communityCards);
            console.log(`FastGameScene: ${player.name} hand evaluation:`, handEvaluation);
            
            return {
                player,
                hand: handEvaluation
            };
        });
        
        // Sort by hand rank (best first)
        playerHands.sort((a, b) => b.hand.score - a.hand.score);
        
        // Determine winner(s)
        const winners = [playerHands[0]];
        for (let i = 1; i < playerHands.length; i++) {
            if (playerHands[i].hand.score === playerHands[0].hand.score) {
                winners.push(playerHands[i]);
            } else {
                break;
            }
        }
        
        // Award pot to winner(s)
        const potPerWinner = Math.floor(this.gameState.pot / winners.length);
        winners.forEach(winner => {
            winner.player.bank += potPerWinner;
            console.log(`FastGameScene: ${winner.player.name} wins ${potPerWinner} chips`);
        });
        
        // Show results
        this.showHandRankings(playerHands);
        this.highlightWinningCards(winners);
        
        // Update UI
        this.updateUI();
        
        // Show Next Round button
        this.nextRoundButton.setVisible(true);
        this.nextRoundButtonText.setVisible(true);
    }

    showHandRankings(playerHands) {
        console.log('FastGameScene: Hand Rankings:');
        playerHands.forEach((playerHand, index) => {
            const rank = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
            console.log(`${rank} ${playerHand.player.name}: ${playerHand.hand.rankName}`);
        });
        
        // Display winner in UI
        const winner = playerHands[0];
        this.handRank.setText(`${winner.player.name} wins with ${winner.hand.rankName}!`);
    }

    highlightWinningCards(winners) {
        winners.forEach(winner => {
            winner.hand.cards.forEach(card => {
                // Highlight winning cards (implement visual highlighting)
                console.log(`FastGameScene: Highlighting winning card: ${card.value} of ${card.suit}`);
            });
        });
    }

    updateUI() {
        this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
        
        // Update all player displays
        this.gameState.players.forEach((player, index) => {
            this.updatePlayerDisplay(index, player);
        });
    }

    updatePlayerDisplay(playerNumber, player) {
        const playerElements = this.getPlayerElements(playerNumber);
        if (playerElements) {
            // Update bank display
            if (playerElements.bankText) {
                playerElements.bankText.setText(player.bank.toString());
            }
            
            // Update bet display
            if (playerElements.betText) {
                playerElements.betText.setText(player.currentBet > 0 ? player.currentBet.toString() : '');
            }
            
            // Update fold indicator
            if (playerElements.foldIndicator) {
                playerElements.foldIndicator.setVisible(player.folded);
            }
            
            // Highlight current player
            if (playerElements.container) {
                if (playerNumber === this.gameState.currentPlayer && !player.folded) {
                    playerElements.container.setTint(0x00FF00);
                } else {
                    playerElements.container.clearTint();
                }
            }
        }
    }

    createButtonLabels() {
        this.menuGameText = this.add
            .text(85, 45, 'МЕНЮ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.settingsGameText = this.add
            .text(150, 45, 'НАСТРОЙКИ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    createPokerActionLabels() {
        this.foldButtonText = this.add
            .text(310, 628, 'СБРОС', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.callButtonText = this.add
            .text(510, 628, 'КОЛЛ', {
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

        this.allInButtonText = this.add
            .text(910, 628, 'ВА-БАНК', {
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
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.nextRoundButtonText.setVisible(false);
    }

    setupButtonHandlers() {
        this.foldButton.on('pointerdown', () => this.handleFold());
        this.callButton.on('pointerdown', () => this.handleCall());
        this.raiseButton.on('pointerdown', () => this.handleRaise());
        this.allInButton.on('pointerdown', () => this.handleAllIn());
        this.menuGame.on('pointerdown', () => this.handleMenu());
        this.settingsGame.on('pointerdown', () => this.handleSettings());
        this.chatButton.on('pointerdown', () => this.handleChat());
        this.nextRoundButton.on('pointerdown', () => this.handleNextRound());
    }

    enablePlayerActions() {
        this.foldButton.setInteractive();
        this.callButton.setInteractive();
        this.raiseButton.setInteractive();
        this.allInButton.setInteractive();
    }

    disablePlayerActions() {
        this.foldButton.disableInteractive();
        this.callButton.disableInteractive();
        this.raiseButton.disableInteractive();
        this.allInButton.disableInteractive();
    }

    handleFold() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            this.foldPlayer(currentPlayer.id);
            this.disablePlayerActions();
        }
    }

    handleCall() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            const callAmount = this.gameState.currentBet - currentPlayer.currentBet;
            
            if (callAmount <= 0) {
                // This is a check
                this.checkPlayer(currentPlayer.id);
            } else {
                // This is a call
                this.callPlayer(currentPlayer.id, callAmount);
            }
            
            this.disablePlayerActions();
        }
    }

    handleRaise() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            let raiseAmount;
            if (this.gameState.currentBet === 0) {
                raiseAmount = this.gameState.bigBlind;
            } else {
                raiseAmount = this.gameState.currentBet * 2;
            }
            
            raiseAmount = Math.min(raiseAmount, currentPlayer.bank);
            this.raisePlayer(currentPlayer.id, raiseAmount);
            this.disablePlayerActions();
        }
    }

    handleAllIn() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            this.raisePlayer(currentPlayer.id, currentPlayer.bank);
            this.disablePlayerActions();
        }
    }

    handleMenu() {
        console.log('FastGameScene: Menu button clicked');
        this.scene.start('LobbyScene');
    }

    handleSettings() {
        console.log('FastGameScene: Settings button clicked');
    }

    handleChat() {
        console.log('FastGameScene: Chat button clicked');
    }

    handleNextRound() {
        this.handRank.setText('');
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Check if any player has 0 money
        const hasPlayerWithZeroMoney = this.gameState.players.some(player => player.bank <= 0);
        
        if (hasPlayerWithZeroMoney) {
            console.log('FastGameScene: Player with 0 money detected, resetting game data');
            // Reset all players to starting money
            this.gameState.players.forEach(player => {
                player.bank = 1000;
                player.currentBet = 0;
                player.folded = false;
                player.allIn = false;
                player.hasActed = false;
            });
            
            // Reset game state
            this.gameState.pot = 0;
            this.gameState.currentBet = 0;
            this.gameState.currentPlayer = 0;
            this.gameState.phase = 'preflop';
            
            // Update UI
            this.updateUI();
        }
        
        this.startNewHand();
    }

    createCustomPlayer(playerNumber, playerData) {
        const position = playerData.position;
        
        // Create player container
        const container = this.add.container(position.x, position.y);
        
        // Create avatar
        const avatar = this.add.image(0, 0, 'avatar_cirlce');
        avatar.setScale(0.3);
        
        // Load player avatar
        if (playerData.avatarUrl) {
            this.loadPlayerAvatar(avatar, playerData.avatarUrl);
        }
        
        // Create player name
        const nameText = this.add.text(0, 40, playerData.name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create bank display
        const bankText = this.add.text(0, 60, playerData.bank.toString(), {
            fontFamily: 'Arial',
            fontSize: '16px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create bet display
        const betText = this.add.text(0, 80, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#00FF00',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create fold indicator
        const foldIndicator = this.add.image(0, 0, 'fold_x');
        foldIndicator.setScale(0.2);
        foldIndicator.setVisible(false);
        
        // Add all elements to container
        container.add([avatar, nameText, bankText, betText, foldIndicator]);
        
        // Store references
        this[`player${playerNumber}Container`] = container;
        this[`player${playerNumber}Avatar`] = avatar;
        this[`player${playerNumber}Name`] = nameText;
        this[`player${playerNumber}Bank`] = bankText;
        this[`player${playerNumber}Bet`] = betText;
        this[`player${playerNumber}Fold`] = foldIndicator;
        
        return {
            container,
            avatar,
            nameText,
            bankText,
            betText,
            foldIndicator
        };
    }

    loadPlayerAvatar(avatarImage, avatarUrl) {
        if (avatarUrl && avatarUrl !== '') {
            this.load.image(`avatar_${avatarUrl}`, avatarUrl);
            this.load.once('complete', () => {
                if (this.textures.exists(`avatar_${avatarUrl}`)) {
                    avatarImage.setTexture(`avatar_${avatarUrl}`);
                }
            });
            this.load.start();
        }
    }

    getPlayerElements(playerId) {
        return {
            container: this[`player${playerId}Container`],
            avatar: this[`player${playerId}Avatar`],
            nameText: this[`player${playerId}Name`],
            bankText: this[`player${playerId}Bank`],
            betText: this[`player${playerId}Bet`],
            foldIndicator: this[`player${playerId}Fold`]
        };
    }

    update() {
        // Update logic here if needed
    }

    shutdown() {
        console.log('FastGameScene: Shutting down scene');
        
        // Clean up event listeners
        this.events.off('shutdown');
        
        // Clean up button handlers
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
        if (this.allInButton) {
            this.allInButton.off('pointerdown');
            this.allInButton.destroy();
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
        
        // Clean up text elements
        if (this.foldButtonText) {
            this.foldButtonText.destroy();
        }
        if (this.callButtonText) {
            this.callButtonText.destroy();
        }
        if (this.raiseButtonText) {
            this.raiseButtonText.destroy();
        }
        if (this.allInButtonText) {
            this.allInButtonText.destroy();
        }
        if (this.nextRoundButtonText) {
            this.nextRoundButtonText.destroy();
        }
        
        // Clean up UI elements
        if (this.background) this.background.destroy();
        if (this.gamingTable) this.gamingTable.destroy();
        if (this.underline) this.underline.destroy();
        if (this.chipBank) this.chipBank.destroy();
        if (this.chipBankText) this.chipBankText.destroy();
        if (this.communityCardsContainer) this.communityCardsContainer.destroy();
        if (this.handRank) this.handRank.destroy();
        if (this.gameInfo) this.gameInfo.destroy();
        if (this.phaseText) this.phaseText.destroy();
        if (this.multiplayerStatus) this.multiplayerStatus.destroy();
        
        // Clean up player elements
        for (let i = 0; i < 5; i++) {
            if (this[`player${i}Container`]) {
                this[`player${i}Container`].destroy();
            }
        }
        
        // Clean up managers
        if (this.buttonManager) this.buttonManager = null;
        if (this.playerManager) this.playerManager = null;
        if (this.cardManager) this.cardManager = null;
        if (this.uiManager) this.uiManager = null;
        
        console.log('FastGameScene: Scene shutdown complete');
    }
} 