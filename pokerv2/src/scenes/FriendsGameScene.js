import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';
import { ProgressBarManager } from '../managers/ProgressBarManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';

export class FriendsGameScene extends Phaser.Scene {
    constructor() {
        super('FriendsGameScene');
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
        this.progressBarManager = new ProgressBarManager(this);
        
        // Initialize UI Manager for Game Scene (pass the progressBarManager instance)
        this.uiManager = new UIManager(this);
        this.uiManager.setProgressBarManager(this.progressBarManager);
        this.uiManager.initializeFriendsGameScene();

        // Create background elements (preserved exactly)
        this.background = this.add.image(640, 360, 'game_bg');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        
        // Create game interface buttons using ButtonManager (preserved functionality)
        this.menuGame = this.buttonManager.createButton('menuGame', 85, 60);
        this.settingsGame = this.buttonManager.createButton('settingsGame', 150, 60);
        this.chatButton = this.buttonManager.createButton('chat', 150, 640);

        // Create poker action buttons using ButtonManager (preserved functionality)
        this.foldButton = this.buttonManager.createButton('fold', 310, 640);
        this.callButton = this.buttonManager.createButton('call', 510, 640);
        this.raiseButton = this.buttonManager.createButton('raise', 710, 640);
        
        // Create progress control buttons using ButtonManager (preserved functionality)
        this.minusButton = this.buttonManager.createButton('minus', 850, 640);
        this.plusButton = this.buttonManager.createButton('plus', 1180, 640);
        
        // Create quick action buttons using ButtonManager (preserved functionality)
        this.minButton = this.buttonManager.createButton('min', 910, 624);
        this.halfButton = this.buttonManager.createButton('half', 980, 624);
        this.bankButton = this.buttonManager.createButton('bank', 1050, 624);
        this.maxButton = this.buttonManager.createButton('max', 1120, 624);

        this.underline = this.add.image(640, 700, 'underline');

        // Apply scaling (preserved exactly)
        this.underline.setDisplaySize(400, 10);
        this.gamingTable.scale = 0.4;

        // Add text labels above the quick action buttons (preserved exactly)
        this.createButtonLabels();
        this.createPokerActionLabels();

        // Button interactions are handled automatically by ButtonManager during creation

        // Create chip bank display (preserved exactly)
        this.chipBank = this.add.image(600, 280, 'chip_button');
        this.chipBankText = this.add
            .text(670, 280, 'БАНК: 1000', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.chipBank.scale = 0.2;

        // Create card container using CardManager (preserved functionality)
        this.cardManager.createCardContainer();

        // Create hand rank display (preserved exactly)
        this.handRank = this.add
            .text(640, 430, 'FULL HOUSE', {
                fontFamily: 'Arial',
                fontSize: '22px',
                fill: '#FF4B00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Add all players using PlayerManager (preserved functionality)
        const playerData = [
            {
                name: 'Иванченко',
                bank: '500',
                position: { x: 200, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x',
            },
            {
                name: 'Петрова',
                bank: '750',
                position: { x: 200, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x',
            },
            {
                name: window.appData.first_name,
                bank: '1200',
                position: { x: 590, y: 520 },
                avatarUrl: window.appData.photo_200,
            },
            {
                name: 'Козлова',
                bank: '930',
                position: { x: 900, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x',
            },
            {
                name: 'Волков',
                bank: '680',
                position: { x: 900, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/8?s=400&d=robohash&r=x',
            },
        ];

        // Create each player using custom positions and avatar loading
        playerData.forEach((player, index) => {
            this.createCustomPlayer(index + 1, player);
        });
    }

    createButtonLabels() {
        // Add text labels on quick action buttons (preserved exactly)
        this.minButtonText = this.add
            .text(910, 624, 'МИН.', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.halfButtonText = this.add
            .text(980, 624, '1/2', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.bankButtonText = this.add
            .text(1050, 624, 'БАНК', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.maxButtonText = this.add
            .text(1120, 624, 'МАКС.', {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    createPokerActionLabels() {
        // Add text labels on poker action buttons (preserved exactly)
        this.foldButtonText = this.add
            .text(310, 628, 'СБРОСИТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Add fold X image
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

        this.callButtonValueText = this.add
            .text(510, 648, '300', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonText = this.add
            .text(710, 628, 'ПОДНЯТЬ ДО', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonValueText = this.add
            .text(710, 648, '600', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    // Delegate to managers for functionality while preserving exact behavior
    handleFold() {
        this.buttonManager.handleFold();
    }

    handleCall() {
        this.buttonManager.handleCall();
    }

    handleRaise(amount) {
        this.buttonManager.handleRaise(amount);
    }

    handleChat() {
        this.buttonManager.handleChat();
    }

    handleSettings() {
        this.buttonManager.handleSettings();
    }

    handleMenu() {
        this.buttonManager.handleMenu();
    }

    increaseProgress() {
        this.progressBarManager.increaseProgress('main');
    }

    decreaseProgress() {
        this.progressBarManager.decreaseProgress('main');
    }

    updateProgressBar() {
        this.progressBarManager.updateProgressBar('main');
    }

    getProgressValue() {
        return this.progressBarManager.getProgress('main');
    }

    setProgressValue(value) {
        this.progressBarManager.setProgress('main', value);
    }

    // Create a player with custom position and dynamic avatar loading (preserved from original)
    createCustomPlayer(playerNumber, playerData) {
        const { name, bank, position, avatarUrl } = playerData;

        // Create unique property names for each player
        const playerPrefix = `player${playerNumber}`;

        // Name placeholder background - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}NamePlaceholder`] = this.add.image(
                position.x,
                position.y,
                'player_name_placeholder'
            );
            this[`${playerPrefix}NamePlaceholder`].scale = 0.36;
        }

        // Avatar circle background
        this[`${playerPrefix}AvatarCircle`] = this.add.image(
            position.x + 90,
            position.y,
            'avatarCircle'
        );
        this[`${playerPrefix}AvatarCircle`].scale = 0.3;

        // Load and create avatar dynamically
        const avatarKey = `avatar${playerNumber}`;
        this.load.image(avatarKey, avatarUrl);
        this.load.start();

        this.load.once('complete', () => {
            if (window.isDebug) {
                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90,
                    position.y - 26,
                    avatarKey
                );
                this[`${playerPrefix}Avatar`].scale = 0.3;
            } else {
                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90,
                    position.y,
                    avatarKey
                );
                this[`${playerPrefix}Avatar`].scale = 0.3;
            }

            // First card (slightly rotated left)
            this[`${playerPrefix}FirstCard`] = this.add.image(
                position.x + 124,
                position.y + 30,
                'back_card'
            );
            this[`${playerPrefix}FirstCard`].scale = 0.36;
            this[`${playerPrefix}FirstCard`].rotation = -0.24;

            // Second card (slightly rotated right)
            this[`${playerPrefix}SecondCard`] = this.add.image(
                position.x + 144,
                position.y + 30,
                'back_card'
            );
            this[`${playerPrefix}SecondCard`].scale = 0.36;
            this[`${playerPrefix}SecondCard`].rotation = 0.24;
        });

        // Player name text - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}Name`] = this.add
                .text(position.x - 20, position.y - 10, name, {
                    fontFamily: 'Arial',
                    fontSize: '22px',
                    fill: '#FF6A13',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
        }

        // Player bank text
        this[`${playerPrefix}Bank`] = this.add
            .text(position.x - 10, position.y + 16, bank, {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    update() {}
}
