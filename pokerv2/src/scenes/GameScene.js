export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('game_bg', 'assets/game_bg_2.png');
        this.load.image('menu_game', 'assets/menu_game.png');
        this.load.image('settings_game', 'assets/settings_game.png');
        // this.load.image('media_poker', 'assets/media_poker.png');
        this.load.image('gaming_table', 'assets/gaming_table.png');
        this.load.image('chat_button', 'assets/chat_button.png');
        this.load.image('fold_button', 'assets/fold_button.png');
        this.load.image('call_button', 'assets/call_button.png');
        this.load.image('raise_button', 'assets/raise_button.png');
        this.load.image('minus_button', 'assets/minus_button.png');
        this.load.image('plus_button', 'assets/plus_button.png');
        this.load.image('fold_x', 'assets/fold_x.png');
        this.load.image('button_placeholder', 'assets/button_placeholder.png');

        this.load.image('underline', 'assets/underline.png');
        this.load.image('chip_button', 'assets/chip_button.png');

        // Load all playing cards from assets/cards directory
        this.loadAllCards();

        this.load.image('back_card', 'assets/back_card.png');
        this.load.image('player_name_placeholder', 'assets/player_name_placeholder.png');

        this.load.image('avatarCircle', 'assets/avatar_cirlce.png');
        this.load.image('dummy_avatar', 'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x');

    }

    loadAllCards() {
        // Define card suits and values
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        // Load all standard cards
        suits.forEach(suit => {
            values.forEach(value => {
                const cardKey = `${value}_of_${suit}`;
                const cardPath = `assets/cards/${value}_of_${suit}.png`;
                this.load.image(cardKey, cardPath);
            });
        });
        
        // Load the variant cards with "2" suffix (higher quality versions)
        const variantCards = [
            'ace_of_spades2', 'jack_of_clubs2', 'jack_of_diamonds2', 'jack_of_hearts2', 'jack_of_spades2',
            'queen_of_clubs2', 'queen_of_diamonds2', 'queen_of_hearts2', 'queen_of_spades2',
            'king_of_clubs2', 'king_of_diamonds2', 'king_of_hearts2', 'king_of_spades2'
        ];
        
        variantCards.forEach(cardKey => {
            this.load.image(cardKey, `assets/cards/${cardKey}.png`);
        });
        
        console.log(`Loaded ${suits.length * values.length + variantCards.length} card images`);
    }

    create() {
        this.background = this.add.image(640, 360, 'game_bg');
        this.menuGame = this.add.image(85, 60, 'menu_game');
        this.settingsGame = this.add.image(150, 60, 'settings_game');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        this.chatButton = this.add.image(150, 640, 'chat_button');

        this.foldButton = this.add.image(310, 640, 'fold_button');
        this.callButton = this.add.image(510, 640, 'call_button');
        this.raiseButton = this.add.image(710, 640, 'raise_button');
        this.minusButton = this.add.image(850, 640, 'minus_button');
        this.plusButton = this.add.image(1180, 640, 'plus_button');
        this.minButton = this.add.image(910, 624, 'button_placeholder');
        this.halfButton = this.add.image(980, 624, 'button_placeholder');
        this.bankButton = this.add.image(1050, 624, 'button_placeholder');
        this.maxButton = this.add.image(1120, 624, 'button_placeholder');
        

        this.underline = this.add.image(640,700, 'underline');

        // Create progress bar system
        this.createProgressBar();

        // Scale elements
        this.underline.setDisplaySize(400,10);
        this.gamingTable.scale = 0.4
        this.menuGame.scale = 0.3
        this.settingsGame.scale = 0.3
        this.chatButton.scale = 0.3

        this.foldButton.scale = 0.3
        this.callButton.scale = 0.3
        this.raiseButton.scale = 0.3

        this.minusButton.scale = 0.3
        this.plusButton.scale = 0.3

        this.minButton.scale = 0.3
        this.halfButton.scale = 0.3
        this.bankButton.scale = 0.3
        this.maxButton.scale = 0.3

        // Add text labels above the quick action buttons
        this.createButtonLabels();
        this.createPokerActionLabels();

        // Setup button interactions
        this.setupProgressBarControls();
        this.setupQuickActionButtons();
        this.setupPokerActionButtons();
        this.setupGameInterfaceButtons();


        this.chipBank = this.add.image(600, 280, 'chip_button');
        this.chipBankText = this.add.text(670, 280, 'БАНК: 1000', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ffffff',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.chipBank.scale = 0.2

        // Create card container and center it on gaming table
        this.createCardContainer();

        this.handRank = this.add.text(640, 430, 'FULL HOUSE', {
            fontFamily: 'Arial',
            fontSize: '22px',
            fill: '#FF4B00',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Add all 5 players around the table
        this.addAllPlayers()

        // Setup game-specific network handlers
        this.setupGameNetworkHandlers()
    }

    addAllPlayers() {
        // Position variables for easy adjustment
        const tableCenter = { x: 640, y: 320 }; // Gaming table center
        
        // Player position variables
        const leftPlayerX = 200;
        const leftPlayerY = 270;
        
        const topLeftPlayerX = 200;
        const topLeftPlayerY = 460;
        
        const topCenterPlayerX = tableCenter.x - 50;
        const topCenterPlayerY = 520;
        
        const topRightPlayerX = 900;
        const topRightPlayerY = 270;
        
        const rightPlayerX = 900;
        const rightPlayerY = 460;

        // Player data with different names, banks, and avatar URLs
        const playerData = [
            {
                name: 'Иванченко',
                bank: '500',
                position: { x: leftPlayerX, y: leftPlayerY }, // Left side
                avatarUrl: 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x'
            },
            {
                name: 'Петрова',
                bank: '750', 
                position: { x: topLeftPlayerX, y: topLeftPlayerY }, // Top-left
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x'
            },
            {
                name: window.appData.first_name,
                bank: '1200',
                position: { x: topCenterPlayerX, y: topCenterPlayerY }, // Top center
                avatarUrl: window.appData.photo_200
            },
            {
                name: 'Козлова',
                bank: '930',
                position: { x: topRightPlayerX, y: topRightPlayerY }, // Top-right
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x'
            },
            {
                name: 'Волков',
                bank: '680',
                position: { x: rightPlayerX, y: rightPlayerY }, // Right side
                avatarUrl: 'https://gravatar.com/avatar/5?s=400&d=robohash&r=x'
            }
        ];

        // Add each player
        playerData.forEach((player, index) => {
            this.addPlayer(index + 1, player);
        });
    }

    addPlayer(playerNumber, playerData) {
        const { name, bank, position, avatarUrl } = playerData;
        
        // Create unique property names for each player
        const playerPrefix = `player${playerNumber}`;
        
        // Name placeholder background - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}NamePlaceholder`] = this.add.image(
                position.x, position.y, 'player_name_placeholder'
            );
            this[`${playerPrefix}NamePlaceholder`].scale = 0.36;
        }

        // Avatar circle background
        this[`${playerPrefix}AvatarCircle`] = this.add.image(
            position.x + 90, position.y, 'avatarCircle'
        );
        this[`${playerPrefix}AvatarCircle`].scale = 0.3;

        // Load and create avatar dynamically
        const avatarKey = `avatar${playerNumber}`;
        this.load.image(avatarKey, avatarUrl);
        this.load.start();
        
        this.load.once('complete', () => {
            if (window.isDebug) {
                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90, position.y - 26, avatarKey
                );
                this[`${playerPrefix}Avatar`].scale = 0.3;
            } else {

                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90, position.y, avatarKey
                );
                this[`${playerPrefix}Avatar`].scale = 0.3;
            }
            
            
        // First card (slightly rotated left)
        this[`${playerPrefix}FirstCard`] = this.add.image(
            position.x + 124, position.y + 30, 'back_card'
        );
        this[`${playerPrefix}FirstCard`].scale = 0.36;
        this[`${playerPrefix}FirstCard`].rotation = -0.24;

        // Second card (slightly rotated right)
        this[`${playerPrefix}SecondCard`] = this.add.image(
            position.x + 144, position.y + 30, 'back_card'
        );
        this[`${playerPrefix}SecondCard`].scale = 0.36;
        this[`${playerPrefix}SecondCard`].rotation = 0.24;
        });

        // Player name text - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}Name`] = this.add.text(
                position.x - 20, position.y - 10, name, {
                    fontFamily: 'Arial',
                    fontSize: '22px',
                    fill: '#FF6A13',
                    strokeThickness: 1
                }
            ).setOrigin(0.5);
        }

        // Player bank text
        this[`${playerPrefix}Bank`] = this.add.text(
            position.x - 10, position.y + 16, bank, {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1
            }
        ).setOrigin(0.5);
    }

    createProgressBar() {
        // Progress bar configuration
        this.progressValue = 50; // Initial value (0-100)
        this.maxProgress = 100;
        this.minProgress = 0;
        this.progressStep = 5; // Amount to change per button click

        // Progress bar dimensions and position
        const barWidth = 260;
        const barHeight = 10;
        const barX = 1014; // Centered between minus (850) and plus (1110) buttons
        const barY = 654;

        // Create progress bar background (border)
        this.progressBarBg = this.add.rectangle(barX, barY, barWidth + 4, barHeight + 4, 0x333333);
        this.progressBarBg.setStrokeStyle(0, 0xffffff);

        // Create progress bar background (inner)
        this.progressBarInner = this.add.rectangle(barX, barY, barWidth, barHeight, 0x111111);

        // Create progress bar fill
        this.progressBarFill = this.add.rectangle(
            barX - barWidth/2, 
            barY, 
            (barWidth * this.progressValue / 100), 
            barHeight - 2, 
            0xFB733A
        );
        this.progressBarFill.setOrigin(0, 0.5);
    }

    createButtonLabels() {
        // Add text labels on quick action buttons
        this.minButtonText = this.add.text(910, 624, 'МИН.', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.halfButtonText = this.add.text(980, 624, '1/2', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.bankButtonText = this.add.text(1050, 624, 'БАНК', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.maxButtonText = this.add.text(1120, 624, 'МАКС.', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }

    createPokerActionLabels() {
        // Add text labels on poker action buttons
        this.foldButtonText = this.add.text(310, 628, 'СБРОСИТЬ', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Add text labels on poker action buttons
        this.foldButtonValueX = this.add.image(310, 650, 'fold_x');
        this.foldButtonValueX.scale = 0.3

        this.callButtonText = this.add.text(510, 628, 'УРАВНЯТЬ', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);


        this.callButtonValueText = this.add.text(510, 648, '300', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.raiseButtonText = this.add.text(710, 628, 'ПОДНЯТЬ ДО', {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        this.raiseButtonValueText = this.add.text(710, 648, '600', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }

    createCardContainer() {
        // Create container for cards and center it on gaming table
        this.cardContainer = this.add.container(640, 320); // Center on gaming table position

        // Card spacing configuration
        const cardSpacing = 88; // Equal padding between cards
        const cardScale = 0.13;
        const totalCards = 5;
        
        // Calculate starting position to center all cards
        const totalWidth = (totalCards - 1) * cardSpacing;
        const startX = -totalWidth / 2; // Start from left, centered around container origin

        // Create cards with equal spacing
        this.firstCard = this.add.image(startX, 40, 'queen_of_clubs2'); // Offset Y by 40 to position below table center
        this.firstCard.setScale(cardScale);
        
        this.secondCard = this.add.image(startX + cardSpacing, 40, 'queen_of_clubs2');
        this.secondCard.setScale(cardScale);
        
        this.thirdCard = this.add.image(startX + cardSpacing * 2, 40, '3_of_clubs');
        this.thirdCard.setScale(cardScale);
        
        this.fourthCard = this.add.image(startX + cardSpacing * 3, 40, '3_of_clubs');
        this.fourthCard.setScale(cardScale);
        
        this.fifthCard = this.add.image(startX + cardSpacing * 4, 40, '3_of_clubs');
        this.fifthCard.setScale(cardScale);

        // Add all cards to container
        this.cardContainer.add([
            this.firstCard,
            this.secondCard, 
            this.thirdCard,
            this.fourthCard,
            this.fifthCard
        ]);

        // Store cards array for easy access
        this.communityCards = [
            this.firstCard,
            this.secondCard,
            this.thirdCard,
            this.fourthCard,
            this.fifthCard
        ];

        console.log('Card container created with 5 cards centered on gaming table');
    }

    setupProgressBarControls() {
        // Make buttons interactive
        this.minusButton.setInteractive({ useHandCursor: true });
        this.plusButton.setInteractive({ useHandCursor: true });

        // Minus button functionality
        this.minusButton.on('pointerover', () => {
            this.minusButton.setTint(0xdddddd);
        });

        this.minusButton.on('pointerout', () => {
            this.minusButton.clearTint();
        });

        this.minusButton.on('pointerdown', () => {
            this.minusButton.setTint(0x888888);
            this.decreaseProgress();
        });

        this.minusButton.on('pointerup', () => {
            this.minusButton.clearTint();
        });

        // Plus button functionality
        this.plusButton.on('pointerover', () => {
            this.plusButton.setTint(0xdddddd);
        });

        this.plusButton.on('pointerout', () => {
            this.plusButton.clearTint();
        });

        this.plusButton.on('pointerdown', () => {
            this.plusButton.setTint(0x888888);
            this.increaseProgress();
        });

        this.plusButton.on('pointerup', () => {
            this.plusButton.clearTint();
        });
    }

    setupQuickActionButtons() {
        // Make all quick action buttons interactive
        const quickButtons = [this.minButton, this.halfButton, this.bankButton, this.maxButton];
        
        quickButtons.forEach(button => {
            button.setInteractive({ useHandCursor: true });
            
            // Add hover effects
            button.on('pointerover', () => {
                button.setTint(0xdddddd);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
            
            button.on('pointerdown', () => {
                button.setTint(0x888888);
            });
            
            button.on('pointerup', () => {
                button.clearTint();
            });
        });

        // MIN button - set progress to minimum (0%)
        this.minButton.on('pointerdown', () => {
            this.setProgressValue(0);
            console.log('MIN button clicked - Progress set to 0%');
        });

        // HALF button - set progress to 50%
        this.halfButton.on('pointerdown', () => {
            this.setProgressValue(50);
            console.log('HALF button clicked - Progress set to 50%');
        });

        // BANK button - set progress to 75% (representing bank/pot bet)
        this.bankButton.on('pointerdown', () => {
            this.setProgressValue(75);
            console.log('BANK button clicked - Progress set to 75%');
        });

        // MAX button - set progress to maximum (100%)
        this.maxButton.on('pointerdown', () => {
            this.setProgressValue(100);
            console.log('MAX button clicked - Progress set to 100%');
        });
    }

    setupPokerActionButtons() {
        // Make all poker action buttons interactive
        const pokerButtons = [this.foldButton, this.callButton, this.raiseButton];
        
        pokerButtons.forEach(button => {
            button.setInteractive({ useHandCursor: true });
            
            // Add hover effects
            button.on('pointerover', () => {
                button.setTint(0xdddddd);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
            
            button.on('pointerdown', () => {
                button.setTint(0x888888);
            });
            
            button.on('pointerup', () => {
                button.clearTint();
            });
        });

        // FOLD button - player folds/gives up hand
        this.foldButton.on('pointerdown', () => {
            console.log('FOLD - Player folds hand');
            this.handleFold();
        });

        // CALL button - player matches current bet
        this.callButton.on('pointerdown', () => {
            console.log('CALL - Player calls current bet');
            this.handleCall();
        });

        // RAISE button - player raises bet using progress bar value
        this.raiseButton.on('pointerdown', () => {
            const raiseAmount = this.getProgressValue();
            console.log(`RAISE - Player raises to ${raiseAmount}%`);
            this.handleRaise(raiseAmount);
        });
    }

    handleFold() {
        // Reset progress bar and handle fold action
        this.setProgressValue(0);
        console.log('Hand folded - Progress reset to 0%');
        
        // Send fold action to server
        if (window.NetworkService && window.NetworkService.isConnected()) {
            window.NetworkService.send({
                type: 'player_action',
                action: 'fold',
                playerId: window.appData?.id || 'guest',
                gameId: 'poker_table_1',
                timestamp: Date.now()
            });
        }
    }

    handleCall() {
        // Handle call action - typically matches a predetermined amount
        console.log('Call action executed');
        
        // Send call action to server
        if (window.NetworkService && window.NetworkService.isConnected()) {
            window.NetworkService.send({
                type: 'player_action',
                action: 'call',
                playerId: window.appData?.id || 'guest',
                gameId: 'poker_table_1',
                timestamp: Date.now()
            });
        }
    }

    handleRaise(amount) {
        // Handle raise action with the specified amount
        console.log(`Raise executed with ${amount}% of maximum bet`);
        
        // Send raise action to server with amount
        if (window.NetworkService && window.NetworkService.isConnected()) {
            window.NetworkService.send({
                type: 'player_action',
                action: 'raise',
                amount: amount,
                playerId: window.appData?.id || 'guest',
                gameId: 'poker_table_1',
                timestamp: Date.now()
            });
        }
    }

    setupGameInterfaceButtons() {
        // Make all game interface buttons interactive
        const interfaceButtons = [this.chatButton, this.settingsGame, this.menuGame];
        
        interfaceButtons.forEach(button => {
            button.setInteractive({ useHandCursor: true });
            
            // Add hover effects
            button.on('pointerover', () => {
                button.setTint(0xdddddd);
            });
            
            button.on('pointerout', () => {
                button.clearTint();
            });
            
            button.on('pointerdown', () => {
                button.setTint(0x888888);
            });
            
            button.on('pointerup', () => {
                button.clearTint();
            });
        });

        // CHAT button - open/toggle chat interface
        this.chatButton.on('pointerdown', () => {
            console.log('CHAT - Opening chat interface');
            this.handleChat();
        });

        // SETTINGS button - open game settings menu
        this.settingsGame.on('pointerdown', () => {
            console.log('SETTINGS - Opening settings menu');
            this.handleSettings();
        });

        // MENU button - open main game menu
        this.menuGame.on('pointerdown', () => {
            console.log('MENU - Opening main menu');
            this.handleMenu();
        });
    }

    handleChat() {
        // Toggle chat interface visibility
        console.log('Chat interface toggled');
        // Add chat logic here (e.g., show/hide chat panel, enable text input)
        // Could implement: chat panel slide-in, message history, text input field
    }

    handleSettings() {
        // Open settings menu
        console.log('Settings menu opened');
        // Add settings logic here (e.g., pause game, show settings overlay)
        // Could implement: sound settings, graphics options, game preferences
    }

    handleMenu() {
        // Navigate back to Start scene
        console.log('MENU - Returning to Start scene');
        this.scene.start('Start');
    }

    increaseProgress() {
        // Increase progress value
        this.progressValue = Math.min(this.progressValue + this.progressStep, this.maxProgress);
        this.updateProgressBar();
        console.log(`Progress increased to: ${this.progressValue}%`);
    }

    decreaseProgress() {
        // Decrease progress value
        this.progressValue = Math.max(this.progressValue - this.progressStep, this.minProgress);
        this.updateProgressBar();
        console.log(`Progress decreased to: ${this.progressValue}%`);
    }

    updateProgressBar() {
        // Update progress bar fill width
        const barWidth = 260;
        const newWidth = (barWidth * this.progressValue / 100);
        this.progressBarFill.width = newWidth;

        // Update progress text
        // Change color based on progress level
        if (this.progressValue <= 25) {
            this.progressBarFill.setFillStyle(0xFF4B00); // Red for low values
        } else if (this.progressValue <= 50) {
            this.progressBarFill.setFillStyle(0xFD5F1D); // Orange for medium-low values
        } else if (this.progressValue <= 75) {
            this.progressBarFill.setFillStyle(0xFC692C); // Yellow for medium-high values
        } else {
            this.progressBarFill.setFillStyle(0xFB733A); // Green for high values
        }
    }

    // Utility method to get current progress value
    getProgressValue() {
        return this.progressValue;
    }

    // Utility method to set progress value programmatically
    setProgressValue(value) {
        this.progressValue = Phaser.Math.Clamp(value, this.minProgress, this.maxProgress);
        this.updateProgressBar();
    }

    // Game-specific network message handlers can be set up here if needed
    setupGameNetworkHandlers() {
        // Setup message handlers specific to the game scene
        window.NetworkService.onMessage('game_state', (data) => {
            console.log('[GameScene] Received game state:', data);
            this.updateGameFromServer(data);
        });

        window.NetworkService.onMessage('player_action', (data) => {
            console.log('[GameScene] Player action received:', data);
            this.handlePlayerAction(data);
        });

        window.NetworkService.onMessage('card_dealt', (data) => {
            console.log('[GameScene] Cards dealt:', data);
            this.updateCards(data.cards);
        });

        // Send join game message when entering the game scene
        if (window.NetworkService.isConnected()) {
            window.NetworkService.send({
                type: 'join_game',
                playerId: window.appData?.id || 'guest',
                playerName: window.appData?.first_name || 'Guest',
                gameId: 'poker_table_1'
            });
        }
    }

    updateGameFromServer(gameData) {
        // Update game state from server data
        if (gameData.pot) {
            this.chipBankText.setText(`БАНК: ${gameData.pot}`);
        }
        
        if (gameData.players) {
            // Update player information
            gameData.players.forEach((player, index) => {
                const playerPrefix = `player${index + 1}`;
                if (this[`${playerPrefix}Bank`]) {
                    this[`${playerPrefix}Bank`].setText(player.chips);
                }
            });
        }
    }

    handlePlayerAction(actionData) {
        // Handle other players' actions
        console.log(`Player ${actionData.playerId} performed action: ${actionData.action}`);
        
        switch(actionData.action) {
            case 'fold':
                // Show fold indicator for player
                break;
            case 'call':
                // Show call animation
                break;
            case 'raise':
                // Show raise animation and update pot
                break;
        }
    }

    updateCards(cards) {
        // Update community cards from server data
        if (cards && this.communityCards) {
            cards.forEach((card, index) => {
                if (this.communityCards[index] && card) {
                    // Update card texture based on server data
                    const cardKey = `${card.value}_of_${card.suit}`;
                    this.communityCards[index].setTexture(cardKey);
                }
            });
        }
    }

    update() {

    }
}
