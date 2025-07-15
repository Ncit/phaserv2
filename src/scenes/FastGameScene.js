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
        
        // Action buttons
        this.foldButton = null;
        this.callButton = null;
        this.raiseButton = null;
        this.allInButton = null;
        this.nextRoundButton = null;
        
        // Start game button
        this.startGameButton = null;
        
        // Button texts
        this.foldButtonText = null;
        this.callButtonText = null;
        this.raiseButtonText = null;
        this.allInButtonText = null;
        this.nextRoundButtonText = null;
        
        // Start game button text
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

        // Create start game button only (no ready button)
        this.startGameButton = this.buttonManager.createButton('call', 640, 100);
        this.startGameButton.setVisible(false);

        this.underline = this.add.image(640, 700, 'underline');
        this.underline.setDisplaySize(400, 10);

        // Add text labels
        this.createButtonLabels();
        this.createPokerActionLabels();
        this.createNextRoundButtonLabel();
        this.createStartGameButtonLabel();

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


        this.phaseText = this.add
            .text(940, 80, 'Connecting...', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create raise counter display
        this.raiseCounterText = this.add
            .text(940, 110, '', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create connection status text
        this.connectionStatusText = this.add
            .text(940, 140, 'Connecting to server...', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#00FF00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create turn indicator text
        this.turnIndicatorText = this.add
            .text(940, 170, '', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#FFD700',
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
            } else if (data.roomReset) {
                console.log('FastGameScene: Room reset!');
                
                // Handle different types of room resets
                if (data.lastPlayerLeft) {
                    // Complete room reset due to last player leaving
                    this.handleLastPlayerLeftReset(data.leavingPlayerName);
                } else if (data.playerLeft) {
                    // Room reset due to player leaving (but others remain)
                    this.handlePlayerLeftReset(data.leavingPlayerName);
                } else if (data.newPlayerJoined) {
                    // Room reset due to new player joining
                    this.handleNewPlayerJoinedReset(data.newPlayerName);
                } else {
                    // Regular room reset (Next Round button or other reset)
                    this.handleRoomReset();
                }
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
            
            // Remove player's cards from the table if specified
            if (data.removeCards) {
                this.removePlayerCards(data.playerId);
            }
            
            // Note: The server will handle the room reset automatically
            // We don't need to remove the player here as the room reset will handle that
        });

        // Player disconnected event (but may reconnect)
        this.networkManager.on('playerDisconnected', (data) => {
            console.log('FastGameScene: Player disconnected (may reconnect):', data);
            
            // Hide the disconnected player and their cards
            this.hideDisconnectedPlayer(data.playerId);
            
            // Show notification that player disconnected but may reconnect
            const playerName = data.playerName || 'Игрок';
            this.handRank.setText(`${playerName} отключился. Ожидание переподключения...`);
            this.handRank.setFill('#FFA500'); // Orange color for disconnection
            
            // Clear notification after 5 seconds
            this.time.delayedCall(5000, () => {
                if (this.handRank && this.gameState && this.gameState.status === 'playing') {
                    this.handRank.setText('');
                }
            });
        });

        // Player reconnected event
        this.networkManager.on('playerReconnected', (data) => {
            console.log('FastGameScene: Player reconnected:', data);
            
            // Show the reconnected player and their cards
            this.showReconnectedPlayer(data.playerId);
            
            // Show notification that player reconnected
            const playerName = data.playerName || 'Игрок';
            
            // Check if this is the current player reconnecting
            const isMyReconnection = data.playerId === this.myPlayerId;
            
            if (isMyReconnection) {
                // Check if player is folded
                const myPlayer = this.networkManager.getMyPlayer();
                if (myPlayer && myPlayer.folded) {
                    this.handRank.setText(`${playerName} переподключился! Вы сбросили карты.`);
                    this.handRank.setFill('#FFA500'); // Orange for folded state
                } else {
                    this.handRank.setText(`${playerName} переподключился!`);
                    this.handRank.setFill('#00FF00'); // Green for successful reconnection
                }
                
                // Update UI to restore appropriate state
                if (this.gameState) {
                    console.log('FastGameScene: Reconnected player - updating UI for current state:', this.gameState.status);
                    this.updateUI();
                    
                    // If game is active and it's my turn, restore action buttons
                    if (this.gameState.status === 'playing' && this.networkManager.isMyTurn()) {
                        console.log('FastGameScene: Reconnected player - restoring action buttons for my turn');
                        this.updateActionButtons();
                    }
                } else {
                    console.log('FastGameScene: Reconnected player - no game state available');
                }
            } else {
                this.handRank.setText(`${playerName} переподключился!`);
                this.handRank.setFill('#00FF00'); // Green color for reconnection
            }
            
            // Clear notification after 3 seconds
            this.time.delayedCall(3000, () => {
                if (this.handRank && this.gameState && this.gameState.status === 'playing') {
                    this.handRank.setText('');
                }
            });
        });

        // Note: Player disconnection is now handled by the server automatically
        // When a player disconnects, the server removes them and resets the room
        // No need for separate disconnection handling in the client

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
        console.log('FastGameScene: Removing player:', playerId);
        
        const playerElements = this.playerElements.get(playerId);
        if (playerElements) {
            // Always remove cards when player is removed
            if (playerElements.playerNumber) {
                this.cardManager.safeClearPlayerCards(playerElements.playerNumber);
                console.log(`FastGameScene: Removed cards for player ${playerId} during player removal`);
            }
            
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
        
        console.log('FastGameScene: Player removal complete for:', playerId);
    }

    removePlayerCards(playerId) {
        console.log('FastGameScene: Removing cards for player:', playerId);
        
        const playerElements = this.playerElements.get(playerId);
        if (playerElements && playerElements.playerNumber) {
            // Clear all cards for this player
            this.cardManager.safeClearPlayerCards(playerElements.playerNumber);
            console.log(`FastGameScene: Cleared cards for player ${playerId} (player number: ${playerElements.playerNumber})`);
        } else {
            console.warn('FastGameScene: Could not find player elements for card removal:', playerId);
            
            // Fallback: try to find player by ID in the players array and clear cards
            const playerIndex = this.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                const playerNumber = playerIndex + 1;
                this.cardManager.safeClearPlayerCards(playerNumber);
                console.log(`FastGameScene: Fallback - cleared cards for player ${playerId} using player number: ${playerNumber}`);
            }
        }
    }

    handleGameStarted() {
        console.log('FastGameScene: Handling game started');
        // Clear any lobby-specific UI
        this.handRank.setText('');
        
        // Clear any existing cards from lobby state
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // The game will automatically deal cards and start the first hand
        // Cards will be dealt when the first hand starts
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
        
        // Only deal hole cards if game has started
        if (this.gameState.status === 'playing') {
            this.dealHoleCards();
        }
    }

    handleRoomReset() {
        console.log('FastGameScene: Handling room reset');
        
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
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log('FastGameScene: Room reset complete - back to lobby state');
    }

    handlePlayerLeftReset(leavingPlayerName) {
        console.log('FastGameScene: Handling room reset due to player leaving');
        
        // Clear all cards immediately when player leaves
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that room was reset due to player leaving
        const playerName = leavingPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} покинул игру. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: Player left reset complete - ${playerName} left, cards hidden and room reset to lobby`);
    }

    handleNewPlayerJoinedReset(newPlayerName) {
        console.log('FastGameScene: Handling room reset due to new player joining');
        
        // Clear all cards immediately when a new player joins
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that room was reset due to new player joining
        const playerName = newPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} присоединился к игре. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: New player joined reset complete - ${playerName} joined, cards hidden and room reset to lobby`);
    }

    handleLastPlayerLeftReset(leavingPlayerName) {
        console.log('FastGameScene: Handling complete room reset due to last player leaving');
        
        // Clear all cards immediately when the last player leaves
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that the game was reset due to the last player leaving
        const playerName = leavingPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} покинул игру. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState === null) { // Check if gameState is null
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState === null) { // Check if gameState is null
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: Last player left reset complete - ${playerName} left, cards hidden and room reset to lobby`);
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
        
        // Reveal all players' cards
        if (showdownResults.revealedCards) {
            this.revealAllPlayersCards(showdownResults.revealedCards);
        }
        
        // Highlight winning players' cards
        this.highlightWinningCards(showdownResults.winners);
        
        // Show Next Round button
        this.nextRoundButton.setVisible(true);
        this.nextRoundButtonText.setVisible(true);
        
        console.log('FastGameScene: Showdown results displayed');
    }
    
    revealAllPlayersCards(revealedCards) {
        console.log('FastGameScene: Revealing all players\' cards:', revealedCards);
        
        revealedCards.forEach(playerCardData => {
            const elements = this.playerElements.get(playerCardData.playerId);
            if (elements && elements.playerNumber && playerCardData.cards) {
                // Clear existing cards first
                this.cardManager.safeClearPlayerCards(elements.playerNumber);
                
                // Add cards face up for all players
                playerCardData.cards.forEach((card, cardIndex) => {
                    this.cardManager.addCardToPlayer(
                        elements.playerNumber,
                        card.value,
                        card.suit,
                        true // Always show face up during showdown
                    );
                });
                
                console.log(`FastGameScene: Revealed cards for ${playerCardData.playerName}:`, playerCardData.cards);
            }
        });
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
        
        console.log('FastGameScene: Highlighted winning cards for players:', winnerIds);
    }

    dealHoleCards() {
        // Only deal cards if game has started
        if (this.gameState.status !== 'playing') {
            console.log('FastGameScene: Game not started yet, skipping card dealing');
            return;
        }
        
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
        if (!this.gameState) {
            // Game state is null - this means the room was completely reset
            // Set UI to empty lobby state
            this.chipBankText.setText('БАНК: 0');
            this.phaseText.setText('Лобби (0/0 готовы)');
            this.raiseCounterText.setText('');
            
            // Hide all game UI elements
            this.foldButton.setVisible(false);
            this.callButton.setVisible(false);
            this.raiseButton.setVisible(false);
            this.allInButton.setVisible(false);
            this.foldButtonText.setVisible(false);
            this.callButtonText.setVisible(false);
            this.raiseButtonText.setVisible(false);
            this.allInButtonText.setVisible(false);
            
            // Hide start game button
            this.startGameButton.setVisible(false);
            this.startGameButton.disableInteractive();
            this.startGameButtonText.setVisible(false);
            
            // Hide next round button
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
            
            // Clear turn indicator
            this.turnIndicatorText.setText('');
            
            // Clear community cards
            this.communityCardsContainer.removeAll(true);
            
            return;
        }
        
        // Update pot display
        this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
        
        // Update phase text based on game status
        if (this.gameState.status === 'lobby') {
            this.phaseText.setText(`Лобби (${this.gameState.readyCount}/${this.gameState.totalPlayers} готовы)`);
            this.raiseCounterText.setText(''); // Hide raise counter in lobby
            this.turnIndicatorText.setText(''); // Hide turn indicator in lobby
            this.updateLobbyUI();
        } else {
            this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
            
            // Update raise counter display
            if (this.gameState.currentRaisesInRound !== undefined && this.gameState.maxRaisesPerRound !== undefined) {
                this.raiseCounterText.setText(`Raises: ${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}`);
            } else {
                this.raiseCounterText.setText('');
            }
            
            // Update turn indicator
            this.updateTurnIndicator();
            
            this.updateGameUI();
        }
        
        // Update community cards
        this.updateCommunityCards();
        
        // Update all player displays
        this.players.forEach(player => {
            this.updatePlayerDisplay(player.id);
        });
    }

    updateTurnIndicator() {
        if (!this.gameState || this.gameState.status !== 'playing') {
            this.turnIndicatorText.setText('');
            return;
        }

        // Check if game is in showdown phase
        if (this.gameState.phase === 'showdown') {
            this.turnIndicatorText.setText('Showdown - Game ended');
            this.turnIndicatorText.setFill('#FF6B6B');
            return;
        }

        // Get current player
        const currentPlayer = this.players.find(p => p.isCurrentPlayer);
        
        if (currentPlayer) {
            // Check if it's the current player's turn
            if (currentPlayer.id === this.myPlayerId) {
                this.turnIndicatorText.setText('🎯 YOUR TURN!');
                this.turnIndicatorText.setFill('#00FF00'); // Green for your turn
            } else {
                this.turnIndicatorText.setText(`Waiting for: ${currentPlayer.name}`);
                this.turnIndicatorText.setFill('#FFD700'); // Gold for other player's turn
            }
        } else {
            // No current player found
            this.turnIndicatorText.setText('Waiting for players...');
            this.turnIndicatorText.setFill('#FFD700');
        }
    }

    updateLobbyUI() {
        console.log('FastGameScene: updateLobbyUI called');
        
        // Hide poker action buttons
        this.foldButton.setVisible(false);
        this.callButton.setVisible(false);
        this.raiseButton.setVisible(false);
        this.allInButton.setVisible(false);
        this.foldButtonText.setVisible(false);
        this.callButtonText.setVisible(false);
        this.raiseButtonText.setVisible(false);
        this.allInButtonText.setVisible(false);
        
        // Show start game button if all players are ready
        if (this.gameState.allPlayersReady) {
            this.startGameButton.setVisible(true);
            this.startGameButton.setInteractive();
            this.startGameButton.removeAllListeners('pointerdown');
            this.startGameButton.on('pointerdown', () => this.handleStartGame());
            this.startGameButtonText.setVisible(true);
        } else {
            this.startGameButton.setVisible(false);
            this.startGameButton.disableInteractive();
            this.startGameButtonText.setVisible(false);
        }
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
    }

    updateGameUI() {
        // Hide start game button and disable it
        this.startGameButton.setVisible(false);
        this.startGameButton.disableInteractive();
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
        
        // Show game status (no ready status since players are auto-ready)
        if (this.gameState.status === 'playing') {
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
        
        // Update cards if this is a new hand and game has started
        if (this.gameState.status === 'playing' && player.hand && player.hand.length > 0) {
            this.updatePlayerCards(player, elements);
        }
    }

    updatePlayerCards(player, elements) {
        // Only update cards if game has started and player has cards
        if (this.gameState.status !== 'playing' || !player.hand || player.hand.length === 0) {
            // Clear any existing cards if game is not started
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
            return;
        }
        
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

    createStartGameButtonLabel() {
        this.startGameButtonText = this.add
            .text(440, 88, 'НАЧАТЬ РАЗДАЧУ', {
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
        
        // Start game button handler only
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

    handleStartGame() {
        try {
            this.networkManager.startGame();
        } catch (error) {
            console.error('FastGameScene: Error starting game:', error);
        }
    }

    handleNextRound() {
        try {
            this.networkManager.resetRoom();
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
        } catch (error) {
            console.error('FastGameScene: Error resetting room:', error);
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

    handleNewPlayerJoined(newPlayerName, readyPlayersCount, totalPlayers) {
        // Show notification that a new player joined during lobby
        const playerName = newPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} присоединился к лобби. (${readyPlayersCount}/${totalPlayers} готовы)`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        this.updateUI();
        console.log(`FastGameScene: Notified about new player joining: ${playerName}`);
    }

    hideDisconnectedPlayer(playerId) {
        const elements = this.playerElements.get(playerId);
        if (elements) {
            // Hide avatar
            elements.avatar.setVisible(false);
            // Hide name background
            elements.nameBackground.setVisible(false);
            // Hide player name text
            elements.playerName.setVisible(false);
            // Hide bank text
            elements.bankText.setVisible(false);
            // Hide card container
            this.cardManager.hidePlayerCards(elements.playerNumber);
            console.log(`FastGameScene: Hiding disconnected player: ${playerId}`);
        }
    }

    showReconnectedPlayer(playerId) {
        const elements = this.playerElements.get(playerId);
        if (elements) {
            // Show avatar
            elements.avatar.setVisible(true);
            // Show name background
            elements.nameBackground.setVisible(true);
            // Show player name text
            elements.playerName.setVisible(true);
            // Show bank text
            elements.bankText.setVisible(true);
            // Show card container
            this.cardManager.showPlayerCards(elements.playerNumber);
            console.log(`FastGameScene: Showing reconnected player: ${playerId}`);
        }
    }
}