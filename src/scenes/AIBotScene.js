import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';
import { AIManager } from '../managers/AIManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';

export class AIBotScene extends Phaser.Scene {
    constructor(sceneKey = 'AIBotScene') {
        super(sceneKey);
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
            hasEveryoneActed: false, // Track if everyone has acted
            // Raise limit tracking
            maxRaisesPerRound: 3,
            currentRaisesInRound: 0,
            lastRaisePlayerId: null
        };
        this.aiPlayers = [];
        this.humanPlayer = null;
        this.aiManager = new AIManager();
        
        console.log('AIBotScene: Constructor completed, AIManager initialized:', !!this.aiManager);
    }

    preload() {
        // Use AssetHelper for centralized asset loading
        AssetHelper.loadGameAssets(this);
        AssetHelper.loadCardAssets(this);
        AssetHelper.loadPlayerAssets(this);
        window.firstFlop = false;
    }

    create() {
        console.log(`AIBotScene: Creating scene with key: ${this.scene.key}`);
        
        // Reset scene state
        this.resetScene();
        
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
        this.allInButton = this.buttonManager.createButton('allIn', 910, 640);
        
        
        // Quick action buttons removed
        
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
            .text(640, 50, 'Texas Hold\'em - Enhanced AI Bot Game', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create AI personality info display
        this.aiInfo = this.add
            .text(640, 25, '🎯 Tight Aggressive | 🐟 Loose Passive | 🎭 Manic Bluffer | 🪨 Solid Rock', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#FFD700',
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

        // Create raise counter display
        this.raiseCounterText = this.add
            .text(940, 80, '', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create AI adaptation debug panel
        this.createAdaptationPanel();

        // Create player info text (debug mode)
        if (window.gameConfig && window.gameConfig.isFeatureEnabled('debugLogging') && window.appData) {
            this.playerInfoText = this.add
                .text(640, 110, `Playing as: ${window.appData.first_name} (ID: ${window.appData.vk_user_id})`, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    fill: '#FFD700',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
        }

        // Setup button handlers
        this.setupButtonHandlers();
        
        // Add scene lifecycle event listeners
        this.events.on('shutdown', () => {
            console.log('AIBotScene: Scene shutdown event triggered');
            this.shutdown();
        });
        
        this.events.on('wake', () => {
            console.log('AIBotScene: Scene wake event triggered');
            this.resetScene();
        });
        
        this.events.on('sleep', () => {
            console.log('AIBotScene: Scene sleep event triggered');
        });

        // Adaptation debug panel
        this.createAdaptationPanel();
    }

    createAdaptationPanel() {
        // Toggle button (now under environment block)
        this.adaptPanelVisible = false;
        this.adaptPanelButton = this.add.text(20, 110, '[AI Adaptation]', {
            fontFamily: 'Arial', fontSize: '14px', fill: '#FFD700', backgroundColor: '#222', padding: { left: 6, right: 6, top: 2, bottom: 2 }
        }).setInteractive().setDepth(1000);
        this.adaptPanelButton.on('pointerdown', () => {
            this.adaptPanelVisible = !this.adaptPanelVisible;
            this.updateAdaptationPanel();
        });
        // Panel text (now under environment block)
        this.adaptPanelText = this.add.text(20, 140, '', {
            fontFamily: 'Courier New', fontSize: '13px', fill: '#FFD700', backgroundColor: '#111', padding: { left: 8, right: 8, top: 6, bottom: 6 }, align: 'left', wordWrap: { width: 400 }
        }).setDepth(1000).setVisible(false);
        // Update every time UI updates
        const origUpdateUI = this.updateUI.bind(this);
        this.updateUI = (...args) => {
            origUpdateUI(...args);
            this.updateAdaptationPanel();
        };
    }
    updateAdaptationPanel() {
        if (!this.adaptPanelText) return;
        this.adaptPanelText.setVisible(this.adaptPanelVisible);
        if (!this.adaptPanelVisible) return;
        // Player profile
        const p = this.aiManager.playerProfile;
        let txt = `PLAYER PROFILE\n`;
        txt += `Aggression: ${(p.aggression*100).toFixed(0)}%\n`;
        txt += `Looseness: ${(p.looseness*100).toFixed(0)}%\n`;
        txt += `Bluff Freq: ${(p.bluffFrequency*100).toFixed(0)}%\n`;
        txt += `Total Actions: ${p.totalActions}\n`;
        txt += `\nAI PERSONALITIES\n`;
        // For each AI
        this.gameState.players.forEach((plr, idx) => {
            if (plr.isAI && plr.personality) {
                const base = plr.personality;
                const adapted = this.aiManager.getAdaptedPersonality(base);
                txt += `#${idx+1} ${plr.name}\n`;
                txt += `  Base:   Agg:${(base.aggression*100).toFixed(0)}% Loose:${(base.looseness*100).toFixed(0)}% Bluff:${(base.bluffFrequency*100).toFixed(0)}%\n`;
                txt += `  Adapt:  Agg:${(adapted.aggression*100).toFixed(0)}% Loose:${(adapted.looseness*100).toFixed(0)}% Bluff:${(adapted.bluffFrequency*100).toFixed(0)}%\n`;
            }
        });
        this.adaptPanelText.setText(txt);
    }
    
    resetScene() {
        console.log('AIBotScene: Resetting scene state');
        
        // Reset game state
        this.gameState = {
            phase: 'preflop',
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
            maxRaisesPerRound: 3,
            currentRaisesInRound: 0,
            lastRaisePlayerId: null
        };
        
        // Reset player arrays
        this.aiPlayers = [];
        this.humanPlayer = null;
        
        // Reset managers
        if (this.cardManager) {
            this.cardManager.cleanup();
        }
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        
        // Clear any existing timers
        if (this.aiTimer) {
            clearTimeout(this.aiTimer);
            this.aiTimer = null;
        }
        
        // Clear any existing UI elements
        if (this.communityCardsContainer) {
            this.communityCardsContainer.removeAll(true);
        }
        
        console.log('AIBotScene: Scene state reset completed');
    }

    /**
     * Get safe avatar URL with fallback to avatar.png
     * @param {string} avatarUrl - The original avatar URL
     * @returns {string} - Safe avatar URL with fallback
     */
    getSafeAvatarUrl(avatarUrl) {
        // Check if avatar URL is empty, null, undefined, or just whitespace
        if (!avatarUrl || avatarUrl.trim() === '' || avatarUrl === 'null' || avatarUrl === 'undefined') {
            console.log('📱 Avatar URL is empty/null, using fallback avatar.png');
            return 'assets/avatar.png';
        }
        
        // Check if the URL is valid (basic validation)
        try {
            const url = new URL(avatarUrl);
            if (!url.protocol || !url.hostname) {
                console.log('📱 Invalid avatar URL format, using fallback avatar.png');
                return 'assets/avatar.png';
            }
            
            // Check for CORS-prone domains (Telegram, VK, etc.)
            const corsProneDomains = ['t.me', 'telegram.org', 'vk.com', 'vk.ru', 'vk.me'];
            const isCorsProne = corsProneDomains.some(domain => url.hostname.includes(domain));
            
            if (isCorsProne) {
                console.log('📱 Avatar URL from CORS-prone domain detected, using fallback avatar.png');
                console.log('📱 CORS-prone URL:', avatarUrl);
                return 'assets/avatar.png';
            }
            
        } catch (error) {
            console.log('📱 Avatar URL parsing failed, using fallback avatar.png');
            return 'assets/avatar.png';
        }
        
        // For non-CORS-prone URLs, we can try to use them
        console.log('📱 Using provided avatar URL:', avatarUrl);
        return avatarUrl;
    }

    initializeGame() {
        // Create 4 AI players with different levels and 1 human player
        const playerData = [
            {
                name: 'Tight Aggressive',
                bank: 1000,
                position: { x: 280, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'tight_aggressive',
                personality: {
                    aggression: 0.8,
                    looseness: 0.2,
                    bluffFrequency: 0.1,
                    patience: 0.9,
                    riskTolerance: 0.6
                }
            },
            {
                name: 'Loose Passive',
                bank: 1000,
                position: { x: 280, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'loose_passive',
                personality: {
                    aggression: 0.2,
                    looseness: 0.8,
                    bluffFrequency: 0.05,
                    patience: 0.3,
                    riskTolerance: 0.4
                }
            },
            {
                name: window.appData?.first_name || 'Player',
                bank: 1000,
                position: { x: 670, y: 520 },
                avatarUrl: this.getSafeAvatarUrl(window.appData?.userAvatar),
                isAI: false,
                vk_user_id: window.appData?.vk_user_id || 0
            },
            {
                name: 'Manic Bluffer',
                bank: 1000,
                position: { x: 980, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'manic_bluffer',
                personality: {
                    aggression: 0.9,
                    looseness: 0.7,
                    bluffFrequency: 0.4,
                    patience: 0.1,
                    riskTolerance: 0.9
                }
            },
            {
                name: 'Solid Rock',
                bank: 1000,
                position: { x: 980, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/5?s=400&d=robohash&r=x',
                isAI: true,
                aiLevel: 'solid_rock',
                personality: {
                    aggression: 0.3,
                    looseness: 0.1,
                    bluffFrequency: 0.02,
                    patience: 0.95,
                    riskTolerance: 0.2
                }
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
            aiLevel: data.aiLevel,
            personality: data.personality,
            hand: [],
            handRank: null,
            position: data.position,
            // AI-specific tracking
            handsPlayed: 0,
            handsWon: 0,
            totalBets: 0,
            lastAction: null,
            confidenceLevel: 0.5
        }));

        // Create player UI elements
        playerData.forEach((player, index) => {
            this.createCustomPlayer(index + 1, player);
        });

        // Start the first hand
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
        this.gameState.currentRaisesInRound = 0;
        this.gameState.lastRaisePlayerId = null;
        
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
            console.log('AIBotScene: AI player turn - disabling player actions');
            this.disablePlayerActions();
            this.makeAIDecision(currentPlayer);
        } else {
            console.log('AIBotScene: Human player turn - enabling actions');
            this.enablePlayerActions();
        }
    }

    makeAIDecision(player) {
        // Safety check for AIManager
        if (!this.aiManager) {
            console.error('AIBotScene: AIManager is null, cannot make AI decision');
            return;
        }
        
        // Safety check for player
        if (!player) {
            console.error('AIBotScene: Player is null, cannot make AI decision');
            return;
        }
        
        // Safety check for gameState
        if (!this.gameState) {
            console.error('AIBotScene: GameState is null, cannot make AI decision');
            return;
        }
        
        console.log(`AIBotScene: Making AI decision for player ${player.name}`);
        
        // Enhanced AI decision making with personality-based timing
        const thinkingTime = this.aiManager.calculateThinkingTime(player);
        setTimeout(() => {
            try {
                const decision = this.aiManager.calculateAIDecision(player, this.gameState);
                this.executeAIAction(player, decision);
            } catch (error) {
                console.error('AIBotScene: Error making AI decision:', error);
                // Fallback to a simple fold decision
                this.executeAIAction(player, { action: 'fold', amount: 0 });
            }
        }, thinkingTime);
    }







    executeAIAction(player, decision) {
        // Safety check for AIManager
        if (!this.aiManager) {
            console.error('AIBotScene: AIManager is null, cannot execute AI action');
            return;
        }
        
        // Safety check for player
        if (!player) {
            console.error('AIBotScene: Player is null, cannot execute AI action');
            return;
        }
        
        // Safety check for decision
        if (!decision) {
            console.error('AIBotScene: Decision is null, cannot execute AI action');
            return;
        }
        
        console.log(`AIBotScene: Executing AI action for ${player.name}:`, decision);
        
        // Use AIManager to execute the action
        this.aiManager.executeAIAction(player, decision);
        
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
            default:
                console.warn(`AIBotScene: Unknown AI action: ${decision.action}, defaulting to fold`);
                this.foldPlayer(player.id);
                break;
        }
    }

    foldPlayer(playerId) {
        const player = this.gameState.players[playerId];
        console.log(`AIBotScene: Player ${player.name} is folding`);
        player.folded = true;
        
        // Mark that this player has acted in this betting round
        player.hasActed = true;
        
        this.nextPlayer();
    }

    checkPlayer(playerId) {
        const player = this.gameState.players[playerId];
        console.log(`AIBotScene: Player ${player.name} is checking`);
        
        // Mark that this player has acted in this betting round
        player.hasActed = true;
        
        this.nextPlayer();
    }

    callPlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        const callAmount = Math.min(amount, player.bank);
        
        console.log(`AIBotScene: Player ${player.name} is calling with amount: ${callAmount}`);
        
        // Update player's bet to match the current bet
        const additionalBet = callAmount;
        player.currentBet += additionalBet;
        player.bank -= additionalBet;
        this.gameState.pot += additionalBet;
        
        // Mark that this player has acted in this betting round
        player.hasActed = true;
        
        if (player.bank === 0) {
            player.allIn = true;
        }
        
        this.nextPlayer();
    }

    raisePlayer(playerId, amount) {
        const player = this.gameState.players[playerId];
        
        // Check if we've reached the maximum raises for this round
        if (this.gameState.currentRaisesInRound >= this.gameState.maxRaisesPerRound) {
            console.log(`AIBotScene: Maximum raises reached (${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}), forcing call`);
            // Force a call instead of raise
            this.callPlayer(playerId, amount);
            return;
        }
        
        const raiseAmount = Math.min(amount, player.bank);
        
        console.log(`AIBotScene: Player ${player.name} is raising with amount: ${raiseAmount}`);
        
        player.currentBet += raiseAmount;
        player.bank -= raiseAmount;
        this.gameState.pot += raiseAmount;
        this.gameState.currentBet = player.currentBet;
        
        // Increment raise counter and track last raiser
        this.gameState.currentRaisesInRound++;
        this.gameState.lastRaisePlayerId = playerId;
        
        console.log(`AIBotScene: Player ${player.name} raised. Raises this round: ${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}`);
        
        // Mark that this player has acted in this betting round
        player.hasActed = true;
        
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
        
        // Check if all active players have acted in this betting round
        const allHaveActed = activePlayers.every(p => p.hasActed || p.allIn);
        
        console.log('AIBotScene: Betting round check:', {
            phase: this.gameState.phase,
            currentBet: this.gameState.currentBet,
            activePlayers: activePlayers.length,
            allBetsEqual,
            allHaveActed,
            playerBets: activePlayers.map(p => ({ 
                id: p.id, 
                name: p.name,
                bet: p.currentBet, 
                allIn: p.allIn,
                hasActed: p.hasActed 
            }))
        });
        
        // For preflop, complete if all bets are equal
        if (this.gameState.phase === 'preflop') {
            const shouldComplete = allBetsEqual;
            console.log('AIBotScene: Preflop betting complete:', shouldComplete);
            return shouldComplete;
        }
        
        // For post-flop phases, check if everyone has acted AND all bets are equal
        const shouldComplete = allBetsEqual && allHaveActed;
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
        this.gameState.currentRaisesInRound = 0;
        this.gameState.lastRaisePlayerId = null;
        
        this.gameState.players.forEach(player => {
            player.currentBet = 0;
            player.hasActed = false; // Reset action tracking for new betting round
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
        console.log('AIBotScene: Starting showdown - revealing AI players\' cards only');
        
        // Reveal only AI players' cards (both active and folded) with rotation
        this.gameState.players.forEach((player, playerIndex) => {
            if (player.hand && player.hand.length > 0 && player.isAI) {
                console.log(`AIBotScene: Revealing cards for AI player ${player.name}:`, player.hand);
                
                // Flip both cards face up for AI players with rotation
                for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
                    this.cardManager.flipCard(playerIndex + 1, cardIndex);
                }
            } else if (player.hand && player.hand.length > 0 && !player.isAI) {
                console.log(`AIBotScene: Keeping human player ${player.name} cards face down`);
                // Human player cards remain face down during showdown
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
            
            const handEvaluation = this.aiManager.handEvaluator.evaluateHand(player.hand, this.gameState.communityCards);
            console.log(`AIBotScene: ${player.name} hand evaluation:`, handEvaluation);
            
            return {
                player,
                hand: handEvaluation
            };
        });
        
        // Find the winner(s)
        let winners = [playerHands[0]];
        for (let i = 1; i < playerHands.length; i++) {
            const comparison = this.aiManager.handEvaluator.compareHands(playerHands[i].hand, winners[0].hand);
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
        
        // Update AI statistics
        this.updateAIStatistics(playerHands, winners);
        
        // Highlight winning players' cards
        this.highlightWinningCards(winners);
        
        // Show hand rankings for all players
        this.showHandRankings(playerHands);
        
        // Update UI
        const winnerNames = winners.map(({ player }) => player.name).join(', ');
        
        // Sort winners by hand strength to get the best hand description
        const sortedWinners = winners.sort((a, b) => {
            return this.aiManager.handEvaluator.compareHands(b.hand, a.hand);
        });
        const handDescription = sortedWinners[0].hand.rankName;
        
        this.handRank.setText(`Winner: ${winnerNames} (${handDescription})`);
        
        // Update player displays
        this.updateUI();
        
        // Disable poker actions when Next Round button appears
        this.disablePlayerActions();
        
        // Show Next Round button
        this.nextRoundButton.setVisible(true);
        this.nextRoundButtonText.setVisible(true);
        
        // Hide raise counter during showdown
        this.raiseCounterText.setText('');
        
        console.log('AIBotScene: Showdown complete');
    }

    updateAIStatistics(playerHands, winners) {
        // Use AIManager to update AI statistics
        this.aiManager.updateAIStatistics(playerHands, winners, this.gameState.players);
    }
    
    showHandRankings(playerHands) {
        // Sort hands by strength (strongest first)
        playerHands.sort((a, b) => {
            return this.aiManager.handEvaluator.compareHands(b.hand, a.hand);
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
        
        // Highlight winning players' cards (all players, not just AI)
        winners.forEach(({ player }) => {
            const playerIndex = this.gameState.players.indexOf(player);
            if (player.hand && player.hand.length > 0) {
                for (let cardIndex = 0; cardIndex < player.hand.length; cardIndex++) {
                    const cardData = this.cardManager.getCard(playerIndex + 1, cardIndex);
                    if (cardData && cardData.sprite) {
                        // Add golden tint to winning cards
                        cardData.sprite.setTint(0xFFD700);
                    }
                }
            }
        });
        
        console.log('AIBotScene: Highlighted winning cards for players:', winners.map(w => w.player.name));
    }

    updateUI() {
        // Update pot display
        this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
        
        // Update phase text
        this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
        
        // Update raise counter display
        if (this.gameState.currentRaisesInRound !== undefined && this.gameState.maxRaisesPerRound !== undefined) {
            this.raiseCounterText.setText(`Raises: ${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}`);
        } else {
            this.raiseCounterText.setText('');
        }
        
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
            
            // Update player name with current bet and AI personality info
            let displayName = player.name;
            
            // Add AI personality indicator for AI players
            if (player.isAI && player.personality) {
                const personalityIcon = this.aiManager.getPersonalityIcon(player.aiLevel);
                displayName = `${personalityIcon} ${displayName}`;
            }
            
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
            
            // Highlight current player with different colors based on AI personality
            if (player.id === this.gameState.currentPlayer) {
                if (player.isAI && player.personality) {
                    const personalityColor = this.aiManager.getPersonalityColor(player.aiLevel);
                    playerElements.avatar.setTint(personalityColor);
                } else {
                    playerElements.avatar.setTint(0x00ff00); // Green tint for human player
                }
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
            .text(1100, 640, 'СЛЕДУЮЩИЙ РАУНД', {
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
        this.allInButton.on('pointerdown', () => this.handleAllIn());
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
        this.allInButton.setInteractive();
    }

    disablePlayerActions() {
        // Disable action buttons
        this.foldButton.disableInteractive();
        this.callButton.disableInteractive();
        this.raiseButton.disableInteractive();
        this.allInButton.disableInteractive();
    }

    handleFold() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            // Record player action
            this.aiManager.recordPlayerAction('fold');
            this.foldPlayer(currentPlayer.id);
        }
    }
    handleCall() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            var callAmount = this.gameState.currentBet - currentPlayer.currentBet;
            // Estimate hand strength for adaptation
            let handStrength = this.aiManager.evaluateHandStrength(currentPlayer, this.gameState);
            if (callAmount <= 0) {
                this.aiManager.recordPlayerAction('call', { handStrength });
                this.checkPlayer(currentPlayer.id);
            } else {
                this.aiManager.recordPlayerAction('call', { handStrength });
                this.callPlayer(currentPlayer.id, Math.min(callAmount, currentPlayer.bank));
            }
            if (window.firstFlop == false) {
                window.firstFlop = true;
                this.handleCall();
            }
        }
    }
    handleRaise() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            let raiseAmount;
            if (this.gameState.currentRaisesInRound >= this.gameState.maxRaisesPerRound) {
                console.log('AIBotScene: Cannot raise - limit reached');
                return;
            }
            if (this.gameState.currentBet === 0) {
                raiseAmount = this.gameState.bigBlind;
            } else {
                raiseAmount = this.gameState.currentBet * 2;
            }
            const additionalAmountNeeded = raiseAmount - currentPlayer.currentBet;
            let handStrength = this.aiManager.evaluateHandStrength(currentPlayer, this.gameState);
            if (currentPlayer.bank < additionalAmountNeeded) {
                this.aiManager.recordPlayerAction('raise', { handStrength });
                this.raisePlayer(currentPlayer.id, currentPlayer.bank);
            } else {
                this.aiManager.recordPlayerAction('raise', { handStrength });
                raiseAmount = Math.min(raiseAmount, currentPlayer.bank);
                this.raisePlayer(currentPlayer.id, raiseAmount);
            }
        }
    }
    handleAllIn() {
        const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
        if (!currentPlayer.isAI) {
            let handStrength = this.aiManager.evaluateHandStrength(currentPlayer, this.gameState);
            this.aiManager.recordPlayerAction('raise', { handStrength });
            const allInAmount = currentPlayer.bank;
            this.raisePlayer(currentPlayer.id, allInAmount);
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
            console.log('AIBotScene: Player with 0 money detected, resetting game data');
            // Reset all players' money to starting amount
            this.gameState.players.forEach(player => {
                player.bank = 1000;
                player.currentBet = 0;
                player.folded = false;
                player.allIn = false;
            });
            
            // Reset pot and game state
            this.gameState.pot = 0;
            this.gameState.currentBet = 0;
            this.gameState.currentPlayer = 0;
            this.gameState.phase = 'preflop';
            
            // Update UI to reflect reset
            this.updateUI();
        }
        
        // Start new hand (whether reset was needed or not)
        this.startNewHand();
    }

    createCustomPlayer(playerNumber, playerData) {
        const { x, y } = playerData.position;
        
        // Create temporary avatar placeholder first
        const avatar = this.add.image(x, y, 'avatar');
        // Use different scale based on whether it's fallback avatar or user avatar
        const isFallbackAvatar = playerData.avatarUrl === 'assets/avatar.png';
        avatar.setScale(isFallbackAvatar ? 0.3 : 0.3);
        
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
        console.log(`AIBotScene: Shutting down scene ${this.scene.key} and cleaning up resources`);
        
        // Remove all event listeners from buttons
        if (this.foldButton) {
            this.foldButton.off('pointerdown');
            this.foldButton.destroy();
            this.foldButton = null;
        }
        if (this.callButton) {
            this.callButton.off('pointerdown');
            this.callButton.destroy();
            this.callButton = null;
        }
        if (this.raiseButton) {
            this.raiseButton.off('pointerdown');
            this.raiseButton.destroy();
            this.raiseButton = null;
        }
        if (this.allInButton) {
            this.allInButton.off('pointerdown');
            this.allInButton.destroy();
            this.allInButton = null;
        }
        if (this.menuGame) {
            this.menuGame.off('pointerdown');
            this.menuGame.destroy();
            this.menuGame = null;
        }
        if (this.settingsGame) {
            this.settingsGame.off('pointerdown');
            this.settingsGame.destroy();
            this.settingsGame = null;
        }
        if (this.chatButton) {
            this.chatButton.off('pointerdown');
            this.chatButton.destroy();
            this.chatButton = null;
        }
        if (this.nextRoundButton) {
            this.nextRoundButton.off('pointerdown');
            this.nextRoundButton.destroy();
            this.nextRoundButton = null;
        }

        // Remove all event listeners from text objects
        if (this.foldButtonText) {
            this.foldButtonText.destroy();
            this.foldButtonText = null;
        }
        if (this.callButtonText) {
            this.callButtonText.destroy();
            this.callButtonText = null;
        }
        if (this.raiseButtonText) {
            this.raiseButtonText.destroy();
            this.raiseButtonText = null;
        }
        if (this.allInButtonText) {
            this.allInButtonText.destroy();
            this.allInButtonText = null;
        }
        if (this.nextRoundButtonText) {
            this.nextRoundButtonText.destroy();
            this.nextRoundButtonText = null;
        }
        if (this.foldButtonValueX) {
            this.foldButtonValueX.destroy();
            this.foldButtonValueX = null;
        }

        // Clean up UI elements
        if (this.chipBankText) {
            this.chipBankText.destroy();
            this.chipBankText = null;
        }
        if (this.phaseText) {
            this.phaseText.destroy();
            this.phaseText = null;
        }
        if (this.raiseCounterText) {
            this.raiseCounterText.destroy();
            this.raiseCounterText = null;
        }
        if (this.handRank) {
            this.handRank.destroy();
            this.handRank = null;
        }

        // Clean up background images
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        if (this.gamingTable) {
            this.gamingTable.destroy();
            this.gamingTable = null;
        }
        if (this.underline) {
            this.underline.destroy();
            this.underline = null;
        }
        if (this.chipBank) {
            this.chipBank.destroy();
            this.chipBank = null;
        }
        if (this.gameInfo) {
            this.gameInfo.destroy();
            this.gameInfo = null;
        }
        if (this.aiInfo) {
            this.aiInfo.destroy();
            this.aiInfo = null;
        }

        // Clean up player elements
        if (this.humanPlayer && this.humanPlayer.elements) {
            Object.values(this.humanPlayer.elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.humanPlayer = null;
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
        this.aiPlayers = [];

        // Clean up community cards container
        if (this.communityCardsContainer) {
            this.communityCardsContainer.destroy();
            this.communityCardsContainer = null;
        }

        // Clean up managers
        if (this.cardManager) {
            this.cardManager.cleanup();
            this.cardManager = null;
        }
        if (this.uiManager) {
            this.uiManager.cleanup();
            this.uiManager = null;
        }
        if (this.buttonManager) {
            this.buttonManager = null;
        }
        if (this.playerManager) {
            this.playerManager = null;
        }
        if (this.aiManager) {
            this.aiManager = null;
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

        // Remove all scene events
        this.events.removeAllListeners();
        
        // Clear any remaining game objects
        this.children.removeAll(true);

        console.log(`AIBotScene: Cleanup completed for scene ${this.scene.key}`);
    }
} 