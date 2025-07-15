import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';
import { NetworkManager } from '../managers/NetworkManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';
import { HandEvaluator } from '../utils/HandEvaluator.js';

export class FastGameScene extends Phaser.Scene {
    constructor() {
        super('FastGameScene');
        this.networkManager = new NetworkManager();
        this.handEvaluator = new HandEvaluator();
        
        // Game state
        this.gameState = null;
        this.players = [];
        this.myPlayerId = null;
        this.isMyTurn = false;
        
        // UI elements
        this.playerElements = new Map(); // playerId -> UI elements
        this.communityCardsContainer = null;
        this.chipBankText = null;
        this.phaseText = null;
        this.handRank = null;
        this.gameInfo = null;
        
        // Action buttons
        this.foldButton = null;
        this.callButton = null;
        this.raiseButton = null;
        this.allInButton = null;
        this.nextRoundButton = null;
        
        // Lobby buttons
        this.readyButton = null;
        this.startGameButton = null;
        
        // Button texts
        this.foldButtonText = null;
        this.callButtonText = null;
        this.raiseButtonText = null;
        this.allInButtonText = null;
        this.nextRoundButtonText = null;
        
        // Lobby button texts
        this.readyButtonText = null;
        this.startGameButtonText = null;
        
        // Connection status
        this.connectionStatus = null;
        this.isConnected = false;
    }

    preload() {
        // Use AssetHelper for centralized asset loading
        AssetHelper.loadGameAssets(this);
        AssetHelper.loadCardAssets(this);
        AssetHelper.loadPlayerAssets(this);
    }

    async create() {
        // Initialize managers
        this.buttonManager = new ButtonManager(this);
        this.playerManager = new PlayerManager(this);
        this.cardManager = new CardManager(this);
        this.uiManager = new UIManager(this);
        
        // Wait for assets to load
        this.time.delayedCall(100, () => {
            const loadedCards = this.cardManager.loadAllCards();
            console.log(`FastGameScene: Found ${loadedCards} loaded cards`);
            this.initializeGame();
        });
        
        // Initialize UI
        this.uiManager.initializeAIBotScene();
        this.createUI();
        this.setupButtonHandlers();
        
        // Setup network event listeners
        this.setupNetworkListeners();
        
        // Connect to server
        await this.connectToServer();
        
        // Add scene shutdown event listener
        this.events.on('shutdown', () => {
            console.log('FastGameScene: Scene shutdown event triggered');
            this.shutdown();
        });
    }

    createUI() {
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

        // Create lobby buttons
        this.readyButton = this.buttonManager.createButton('call', 400, 640);
        this.readyButton.setVisible(false);
        
        this.startGameButton = this.buttonManager.createButton('call', 600, 640);
        this.startGameButton.setVisible(false);

        this.underline = this.add.image(640, 700, 'underline');
        this.underline.setDisplaySize(400, 10);

        // Add text labels
        this.createButtonLabels();
        this.createPokerActionLabels();
        this.createNextRoundButtonLabel();
        this.createLobbyButtonLabels();

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
            .text(640, 50, 'Texas Hold\'em - Multiplayer Game', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.phaseText = this.add
            .text(640, 80, 'Connecting...', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create raise counter display
        this.raiseCounterText = this.add
            .text(640, 110, '', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create connection status text
        this.connectionStatusText = this.add
            .text(640, 140, 'Connecting to server...', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#00FF00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create player info text (debug mode)
        if (window.isDebug && window.appData) {
            this.playerInfoText = this.add
                .text(640, 170, `Playing as: ${window.appData.first_name} (ID: ${window.appData.vk_user_id})`, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    fill: '#FFD700',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
        }
    }

    async connectToServer() {
        try {
            await this.networkManager.connect();
            this.isConnected = true;
            this.connectionStatusText.setText('Connected to server');
            this.connectionStatusText.setFill('#00FF00');
            
            // Join game with player data
            const playerData = {
                name: window.appData?.first_name || 'Player',
                avatarUrl: window.appData?.photo_200 || 'https://gravatar.com/avatar/default?s=400&d=robohash&r=x',
                bank: 1000,
                vk_user_id: window.appData?.vk_user_id || 0
            };
            
            this.networkManager.joinGame(playerData);
            
        } catch (error) {
            console.error('FastGameScene: Failed to connect to server:', error);
            this.connectionStatusText.setText('Connection failed');
            this.connectionStatusText.setFill('#FF0000');
        }
    }

    setupNetworkListeners() {
        // Game joined event
        this.networkManager.on('gameJoined', (data) => {
            console.log('FastGameScene: Game joined:', data);
            this.myPlayerId = data.playerId;
            this.gameState = data.gameState;
            this.players = data.players;
            this.initializePlayers();
            this.updateUI();
        });

                // Game state update event
        this.networkManager.on('gameStateChanged', (data) => {
            console.log('FastGameScene: Game state changed:', data);
            this.gameState = data.gameState;
            this.players = data.gameState.players;
            
            if (data.gameStarted) {
                console.log('FastGameScene: Game started!');
                this.handleGameStarted();
            } else if (data.newHand) {
                this.handleNewHand();
            }
            
            // Handle showdown results
            if (this.gameState.phase === 'showdown' && this.gameState.showdownResults) {
                this.handleShowdownResults(this.gameState.showdownResults);
            }
            
            this.updateUI();
            this.handleLastAction(data.lastAction);
        });

        // Player joined event
        this.networkManager.on('playerJoined', (data) => {
            console.log('FastGameScene: Player joined:', data);
            this.addPlayer(data.player);
        });

        // Player left event
        this.networkManager.on('playerLeft', (data) => {
            console.log('FastGameScene: Player left:', data);
            this.removePlayer(data.playerId);
        });

        // Network error event
        this.networkManager.on('networkError', (data) => {
            console.error('FastGameScene: Network error:', data);
            this.connectionStatusText.setText(`Error: ${data.message}`);
            this.connectionStatusText.setFill('#FF0000');
        });

        // Disconnected event
        this.networkManager.on('disconnected', (data) => {
            console.log('FastGameScene: Disconnected from server:', data);
            this.isConnected = false;
            this.connectionStatusText.setText('Disconnected from server');
            this.connectionStatusText.setFill('#FF0000');
        });
    }

    initializeGame() {
        // Game will be initialized when we join the server
        console.log('FastGameScene: Game initialization ready');
    }

    initializePlayers() {
        // Store existing player numbers before clearing
        const existingPlayerNumbers = Array.from(this.playerElements.values())
            .map(elements => elements.playerNumber)
            .filter(number => number !== undefined);
        
        // Clear existing players
        this.playerElements.clear();
        
        // Clear existing card containers (only if they exist)
        existingPlayerNumbers.forEach(playerNumber => {
            this.cardManager.safeClearPlayerCards(playerNumber);
        });
        
        // Create player positions
        const positions = [
            { x: 280, y: 270 }, // Top left
            { x: 280, y: 460 }, // Bottom left
            { x: 670, y: 520 }, // Bottom center (human player)
            { x: 980, y: 270 }, // Top right
            { x: 980, y: 460 }, // Bottom right
            { x: 670, y: 200 }  // Top center
        ];
        
        // Create UI for each player
        this.players.forEach((player, index) => {
            if (index < positions.length) {
                this.createPlayerUI(player, positions[index], index + 1);
            }
        });
    }

    createPlayerUI(player, position, playerNumber) {
        const { x, y } = position;
        
        // Create avatar
        const avatar = this.add.image(x, y, 'avatar');
        avatar.setScale(0.3);
        
        // Load avatar from URL
        const avatarKey = `avatar_${player.id}`;
        this.load.image(avatarKey, player.avatarUrl);
        
        this.load.once('complete', () => {
            if (this.textures.exists(avatarKey)) {
                avatar.setTexture(avatarKey);
            }
        });
        this.load.start();
        
        // Create player name background
        const nameX = x - 90;
        const nameY = y + 0;
        const nameBackground = this.add.image(nameX, nameY, 'player_name_placeholder');
        nameBackground.setScale(0.2);
        
        // Create player name text
        const playerName = this.add.text(nameX, nameY, player.name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create bank text
        const bankText = this.add.text(x, y + 70, `$${player.bank}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create card container
        this.cardManager.createCardContainer(playerNumber, x + 60, y + 30);
        
        // Store player elements
        this.playerElements.set(player.id, {
            avatar,
            nameBackground,
            playerName,
            bankText,
            playerNumber
        });
    }

    addPlayer(player) {
        // Find available position
        const positions = [
            { x: 280, y: 270 },
            { x: 280, y: 460 },
            { x: 670, y: 520 },
            { x: 980, y: 270 },
            { x: 980, y: 460 },
            { x: 670, y: 200 }
        ];
        
        const availableIndex = this.players.findIndex(p => p.id === player.id);
        if (availableIndex === -1) {
            this.players.push(player);
        }
        
        const playerIndex = this.players.findIndex(p => p.id === player.id);
        if (playerIndex < positions.length) {
            this.createPlayerUI(player, positions[playerIndex], playerIndex + 1);
        }
    }

    removePlayer(playerId) {
        const playerElements = this.playerElements.get(playerId);
        if (playerElements) {
            // Remove UI elements
            Object.values(playerElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.playerElements.delete(playerId);
        }
        
        // Remove from players list
        this.players = this.players.filter(p => p.id !== playerId);
    }

    handleGameStarted() {
        console.log('FastGameScene: Handling game started');
        // Clear any lobby-specific UI
        this.handRank.setText('');
        
        // The game will automatically deal cards and start the first hand
    }

    handleNewHand() {
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear all player cards
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Deal hole cards to players
        this.dealHoleCards();
    }

    clearCardHighlights() {
        // Clear all card highlights
        this.playerElements.forEach((elements, playerId) => {
            if (elements.playerNumber) {
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        cardData.sprite.clearTint();
                    }
                }
            }
        });
    }

    handleShowdownResults(showdownResults) {
        console.log('FastGameScene: Handling showdown results:', showdownResults);
        
        // Display winner information
        const winnerNames = showdownResults.winnerNames.join(', ');
        const handDescription = showdownResults.handDescription;
        
        this.handRank.setText(`Winner: ${winnerNames} (${handDescription})`);
        
        // Show hand rankings in console
        this.showHandRankings(showdownResults.playerHands);
        
        // Highlight winning players' cards
        this.highlightWinningCards(showdownResults.winners);
        
        // Show Next Round button
        this.nextRoundButton.setVisible(true);
        this.nextRoundButtonText.setVisible(true);
        
        console.log('FastGameScene: Showdown results displayed');
    }

    showHandRankings(playerHands) {
        // Sort hands by strength (strongest first)
        playerHands.sort((a, b) => b.handScore - a.handScore);
        
        // Create hand ranking display
        let rankingText = 'Hand Rankings:\n';
        playerHands.forEach((handData, index) => {
            const rank = index + 1;
            const rankSymbol = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            rankingText += `${rankSymbol} ${handData.playerName}: ${handData.handRank}\n`;
        });
        
        // Display the rankings in console
        console.log('FastGameScene: Hand Rankings:', rankingText);
    }

    highlightWinningCards(winnerIds) {
        // Reset all card highlights first
        this.playerElements.forEach((elements, playerId) => {
            if (elements.playerNumber) {
                // Clear any existing tints on cards
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        cardData.sprite.clearTint();
                    }
                }
            }
        });
        
        // Highlight winning players' cards
        winnerIds.forEach(winnerId => {
            const elements = this.playerElements.get(winnerId);
            if (elements && elements.playerNumber) {
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        // Add golden tint to winning cards
                        cardData.sprite.setTint(0xFFD700);
                    }
                }
            }
        });
    }

    dealHoleCards() {
        this.players.forEach((player, index) => {
            if (player.hand && player.hand.length > 0) {
                const playerElements = this.playerElements.get(player.id);
                if (playerElements) {
                    player.hand.forEach((card, cardIndex) => {
                        const isMyPlayer = player.id === this.myPlayerId;
                        this.cardManager.addCardToPlayer(
                            playerElements.playerNumber,
                            card.value,
                            card.suit,
                            isMyPlayer
                        );
                    });
                }
            }
        });
    }

    handleLastAction(lastAction) {
        if (!lastAction) return;
        
        console.log('FastGameScene: Last action:', lastAction);
        
        // Update UI based on action
        switch (lastAction.action) {
            case 'fold':
                this.handlePlayerFold(lastAction);
                break;
            case 'call':
            case 'check':
                this.handlePlayerCall(lastAction);
                break;
            case 'raise':
            case 'allIn':
                this.handlePlayerRaise(lastAction);
                break;
        }
    }

    handlePlayerFold(action) {
        // Player folded - no special UI needed, just update display
        this.updatePlayerDisplay(action.playerId);
    }

    handlePlayerCall(action) {
        // Player called/checked - update display
        this.updatePlayerDisplay(action.playerId);
    }

    handlePlayerRaise(action) {
        // Player raised - update display
        this.updatePlayerDisplay(action.playerId);
    }

    updateUI() {
        if (!this.gameState) return;
        
        // Update pot display
        this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
        
        // Update phase text based on game status
        if (this.gameState.status === 'lobby') {
            this.phaseText.setText(`Лобби (${this.gameState.readyCount}/${this.gameState.totalPlayers} готовы)`);
            this.raiseCounterText.setText(''); // Hide raise counter in lobby
            this.updateLobbyUI();
        } else {
            this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
            
            // Update raise counter display
            if (this.gameState.currentRaisesInRound !== undefined && this.gameState.maxRaisesPerRound !== undefined) {
                this.raiseCounterText.setText(`Raises: ${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}`);
            } else {
                this.raiseCounterText.setText('');
            }
            
            this.updateGameUI();
        }
        
        // Update community cards
        this.updateCommunityCards();
        
        // Update all player displays
        this.players.forEach(player => {
            this.updatePlayerDisplay(player.id);
        });
    }

    updateLobbyUI() {
        // Hide poker action buttons
        this.foldButton.setVisible(false);
        this.callButton.setVisible(false);
        this.raiseButton.setVisible(false);
        this.allInButton.setVisible(false);
        this.foldButtonText.setVisible(false);
        this.callButtonText.setVisible(false);
        this.raiseButtonText.setVisible(false);
        this.allInButtonText.setVisible(false);
        
        // Show lobby buttons
        this.readyButton.setVisible(true);
        this.readyButtonText.setVisible(true);
        
        // Show start game button if all players are ready
        if (this.gameState.allPlayersReady) {
            this.startGameButton.setVisible(true);
            this.startGameButtonText.setVisible(true);
        } else {
            this.startGameButton.setVisible(false);
            this.startGameButtonText.setVisible(false);
        }
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
    }

    updateGameUI() {
        // Hide lobby buttons
        this.readyButton.setVisible(false);
        this.readyButtonText.setVisible(false);
        this.startGameButton.setVisible(false);
        this.startGameButtonText.setVisible(false);
        
        // Check if game is in showdown phase
        if (this.gameState.phase === 'showdown') {
            // Hide poker action buttons in showdown
            this.foldButton.setVisible(false);
            this.callButton.setVisible(false);
            this.raiseButton.setVisible(false);
            this.allInButton.setVisible(false);
            this.foldButtonText.setVisible(false);
            this.callButtonText.setVisible(false);
            this.raiseButtonText.setVisible(false);
            this.allInButtonText.setVisible(false);
            
            // Show next round button
            this.nextRoundButton.setVisible(true);
            this.nextRoundButtonText.setVisible(true);
        } else {
            // Show poker action buttons for active game
            this.foldButton.setVisible(true);
            this.callButton.setVisible(true);
            this.raiseButton.setVisible(true);
            this.allInButton.setVisible(true);
            this.foldButtonText.setVisible(true);
            this.callButtonText.setVisible(true);
            this.raiseButtonText.setVisible(true);
            this.allInButtonText.setVisible(true);
            
            // Hide next round button
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
            
            // Update action buttons
            this.updateActionButtons();
        }
    }

    updateCommunityCards() {
        if (!this.gameState.communityCards) return;
        
        // Clear existing community cards
        this.communityCardsContainer.removeAll(true);
        
        // Add community cards
        this.gameState.communityCards.forEach((card, index) => {
            const cardX = -380 + (index * 200);
            const cardY = 0;
            const cardKey = `${card.value}_of_${card.suit}`;
            
            if (this.textures.exists(cardKey)) {
                const cardSprite = this.add.image(cardX, cardY, cardKey);
                cardSprite.setScale(0.3);
                this.communityCardsContainer.add(cardSprite);
            }
        });
    }

    updatePlayerDisplay(playerId) {
        const player = this.players.find(p => p.id === playerId);
        const elements = this.playerElements.get(playerId);
        
        if (!player || !elements) return;
        
        // Update bank display
        elements.bankText.setText(`$${player.bank}`);
        
        // Update player name with current bet if applicable
        let displayName = player.name;
        
        // Show ready status in lobby
        if (this.gameState.status === 'lobby') {
            if (player.ready) {
                displayName += ' ✅';
            } else {
                displayName += ' ❌';
            }
        } else {
            // Show game status
            if (player.currentBet > 0) {
                displayName += ` ($${player.currentBet})`;
            }
            if (player.folded) {
                displayName += ' [FOLDED]';
            }
            if (player.allIn) {
                displayName += ' [ALL IN]';
            }
        }
        
        elements.playerName.setText(displayName);
        
        // Highlight current player
        if (player.isCurrentPlayer) {
            elements.avatar.setTint(0x00ff00); // Green tint for current player
        } else {
            elements.avatar.clearTint();
        }
        
        // Update cards if this is a new hand
        if (player.hand && player.hand.length > 0) {
            this.updatePlayerCards(player, elements);
        }
    }

    updatePlayerCards(player, elements) {
        // Clear existing cards
        this.cardManager.safeClearPlayerCards(elements.playerNumber);
        
        // Add new cards
        player.hand.forEach((card, cardIndex) => {
            const isMyPlayer = player.id === this.myPlayerId;
            this.cardManager.addCardToPlayer(
                elements.playerNumber,
                card.value,
                card.suit,
                isMyPlayer
            );
        });
    }

    updateActionButtons() {
        const isMyTurn = this.networkManager.isMyTurn();
        const myPlayer = this.networkManager.getMyPlayer();
        
        // Disable actions if game is in showdown phase
        if (this.gameState.phase === 'showdown') {
            this.disablePlayerActions();
            return;
        }
        
        if (isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn) {
            this.enablePlayerActions();
            
            // Check raise limit and disable raise button if limit reached
            const canRaise = this.networkManager.canRaise();
            if (!canRaise) {
                this.raiseButton.disableInteractive();
                this.raiseButtonText.setFill('#888888'); // Gray out the text
                console.log('FastGameScene: Raise limit reached, raise button disabled');
            } else {
                this.raiseButton.setInteractive();
                this.raiseButtonText.setFill('#ffffff'); // Normal text color
            }
        } else {
            this.disablePlayerActions();
        }
    }

    createButtonLabels() {
        // Button labels are created in createPokerActionLabels
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

    createLobbyButtonLabels() {
        this.readyButtonText = this.add
            .text(400, 628, 'ГОТОВ', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.readyButtonText.setVisible(false);

        this.startGameButtonText = this.add
            .text(600, 628, 'НАЧАТЬ ИГРУ', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.startGameButtonText.setVisible(false);
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
        
        // Lobby button handlers
        this.readyButton.on('pointerdown', () => this.handleReady());
        this.startGameButton.on('pointerdown', () => this.handleStartGame());
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
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        try {
            this.networkManager.sendPokerAction('fold');
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending fold action:', error);
        }
    }

    handleCall() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        try {
            const myPlayer = this.networkManager.getMyPlayer();
            const currentBet = this.gameState.currentBet;
            const callAmount = currentBet - myPlayer.currentBet;
            
            if (callAmount <= 0) {
                this.networkManager.sendPokerAction('check');
            } else {
                this.networkManager.sendPokerAction('call', callAmount);
            }
            
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending call action:', error);
        }
    }

    handleRaise() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        // Check if we can still raise
        if (!this.networkManager.canRaise()) {
            console.log('FastGameScene: Cannot raise - limit reached');
            return;
        }
        
        try {
            const myPlayer = this.networkManager.getMyPlayer();
            let totalBetAmount;
            
            // Default big blind if not defined
            const bigBlind = this.gameState.bigBlind || 20;
            
            if (this.gameState.currentBet === 0) {
                // No current bet, so minimum raise is big blind
                totalBetAmount = bigBlind;
            } else {
                // Current bet exists, so raise must be at least current bet + 10
                totalBetAmount = this.gameState.currentBet + 10;
            }
            
            // Ensure totalBetAmount is a valid number
            if (isNaN(totalBetAmount) || totalBetAmount <= 0) {
                console.error('FastGameScene: Invalid raise amount calculated:', totalBetAmount);
                return;
            }
            
            // Check if player has enough money for the minimum raise
            const additionalAmountNeeded = totalBetAmount - myPlayer.currentBet;
            if (myPlayer.bank < additionalAmountNeeded) {
                // Player doesn't have enough for minimum raise, make it all-in
                console.log('FastGameScene: Insufficient funds for minimum raise, making all-in');
                this.networkManager.sendPokerAction('allIn', myPlayer.bank);
            } else {
                // Player has enough money, proceed with normal raise
                // Ensure we don't exceed player's bank
                totalBetAmount = Math.min(totalBetAmount, myPlayer.bank);
                
                // Calculate the additional amount needed
                const additionalAmount = totalBetAmount - myPlayer.currentBet;
                
                console.log('FastGameScene: Raise calculation:', {
                    currentBet: this.gameState.currentBet,
                    myCurrentBet: myPlayer.currentBet,
                    totalBetAmount,
                    additionalAmount,
                    myBank: myPlayer.bank,
                    bigBlind
                });
                
                this.networkManager.sendPokerAction('raise', totalBetAmount);
            }
            
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending raise action:', error);
        }
    }

    handleAllIn() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        try {
            const myPlayer = this.networkManager.getMyPlayer();
            this.networkManager.sendPokerAction('allIn', myPlayer.bank);
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending all-in action:', error);
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

    handleReady() {
        try {
            const myPlayer = this.networkManager.getMyPlayer();
            if (myPlayer) {
                const isReady = !myPlayer.ready;
                this.networkManager.setReady(isReady);
                
                // Update button text
                this.readyButtonText.setText(isReady ? 'НЕ ГОТОВ' : 'ГОТОВ');
                this.readyButtonText.setFill(isReady ? '#FF0000' : '#00FF00');
            }
        } catch (error) {
            console.error('FastGameScene: Error setting ready status:', error);
        }
    }

    handleStartGame() {
        try {
            this.networkManager.startGame();
        } catch (error) {
            console.error('FastGameScene: Error starting game:', error);
        }
    }

    handleNextRound() {
        try {
            this.networkManager.requestNewHand();
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
        } catch (error) {
            console.error('FastGameScene: Error requesting new hand:', error);
        }
    }

    update() {
        // Game loop updates
    }

    shutdown() {
        console.log('FastGameScene: Shutting down and cleaning up resources');
        
        // Clean up network manager
        if (this.networkManager) {
            this.networkManager.cleanup();
        }
        
        // Clean up managers
        if (this.cardManager) {
            this.cardManager.cleanup();
        }
        if (this.uiManager) {
            this.uiManager.cleanup();
        }

        // Clean up UI elements
        this.playerElements.forEach(elements => {
            Object.values(elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });

        // Clear all timers and intervals
        if (this.actionTimer) {
            clearTimeout(this.actionTimer);
            this.actionTimer = null;
        }

        // Remove all scene events
        this.events.removeAllListeners();
        
        // Clear any remaining game objects
        this.children.removeAll(true);

        console.log('FastGameScene: Cleanup completed');
    }
} 