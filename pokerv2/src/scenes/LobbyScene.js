export class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    preload() {
        this.load.image('avatarQ', window.appData.photo_200);
    }

    create() {
        this.background = this.add.image(640, 360, 'background');
        this.lobbyOverlay = this.add.image(640, 360, 'lobby_overlay');
        this.dimOverlay = this.add.image(640, 360, 'dim_overlay');
        this.topBar = this.add.image(640, 50, 'top_bar');
        this.bottomBar = this.add.image(640, 660, 'bottom_bar');
        this.underline = this.add.image(680, 700, 'underline');

        this.settingsButton = this.add.image(120, 660, 'settings_button');
        this.friendsButton = this.add.image(180, 660, 'friends_button');
        this.statsButton = this.add.image(240, 660, 'stats_button');
        this.planetIcon = this.add.image(300, 660, 'planet_icon');

        this.activePlayers = this.add.text(320, 640, 'Активных участников:', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 17,
        });
        this.activePlayersCount = this.add.text(320, 660, '12011', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 19,
        });

        this.chipButton = this.add.image(1180, 54, 'chip_button');
        this.chipLabel = this.add.text(1050, 30, 'Ваш баланс:', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 17,
        });
        this.chipCount = this.add.text(1050, 46, '20000', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 26,
        });

        // User avatar and profile elements
        this.userAvatar = this.add.image(120, 46, 'avatarQ');
        this.userAvatar.scale = 0.3;
        this.crown = this.add.image(138, 60, 'crown');
        this.userName = this.add.text(166, 22, window.appData.first_name, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 24,
        });
        this.star = this.add.image(346, 62, 'star');
        this.progress = this.add.image(246, 64, 'progress');
        this.starCount = this.add.text(362, 50, '366', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 19,
        });
        this.crown.scale = 0.34;
        this.progress.scale = 0.34;
        this.star.scale = 0.36;

        // UI styling
        this.chipButton.scale = 0.35;
        this.chipLabel.setTint(0xffffff);
        this.chipLabel.setAlpha(0.22);

        this.activePlayers.setTint(0xffffff);
        this.activePlayers.setAlpha(0.22);
        this.activePlayersCount.setTint(0x9fa6b3);

        // Button interactions
        this.settingsButton.setInteractive({ useHandCursor: true });
        this.friendsButton.setInteractive({ useHandCursor: true });
        this.statsButton.setInteractive({ useHandCursor: true });

        this.settingsButton.scale = 0.35;
        this.friendsButton.scale = 0.35;
        this.statsButton.scale = 0.35;
        this.planetIcon.scale = 0.3;

        const controls = [
            this.settingsButton,
            this.friendsButton,
            this.statsButton,
        ];

        controls.forEach((control, index) => {
            control.on('pointerover', () => {
                control.setTint(0xdddddd);
            });

            control.on('pointerout', () => {
                control.clearTint();
            });

            control.on('pointerdown', () => {
                control.setTint(0x888888);
                console.log('Control button clicked!');

                this.time.delayedCall(150, () => {
                    control.clearTint();
                });
            });
        });

        // Layout scaling
        this.dimOverlay.setTint(0xff0000);
        this.lobbyOverlay.scale = 0.5;
        this.topBar.setScale(0.5);
        this.bottomBar.setScale(0.5);
        this.underline.setScale(0.25);

        // Create game mode buttons
        this.createButtons();

        // Create and setup bonus button
        this.bonusButton = this.add.image(1040, 640, 'bonus_button');
        this.bonusButton.setScale(0.4);
        this.bonusButton.setInteractive({ useHandCursor: true });

        this.bonusButton.on('pointerover', () => {
            this.bonusButton.setTint(0xdddddd);
        });

        this.bonusButton.on('pointerout', () => {
            this.bonusButton.clearTint();
        });

        this.bonusButton.on('pointerdown', () => {
            this.bonusButton.setTint(0x888888);
            console.log('Bonus button clicked!');

            this.time.delayedCall(150, () => {
                this.bonusButton.clearTint();
            });
        });
    }

    createButtons() {
        const buttonScale = 0.27;
        const buttonSpacing = 240;
        const buttonY = 100;

        const buttonData = [
            { key: 'fast_game_btn', label: 'Fast Game' },
            { key: 'high_bid_btn', label: 'High Bid' },
            { key: 'train_game_btn', label: 'Train Game' },
            { key: 'random_match_btn', label: 'Random Match' },
            { key: 'friends_game_btn', label: 'Friends Game' },
        ];

        // Create container for slider
        this.buttonContainer = this.add.container(0, 250);
        this.buttonContainer.setSize(buttonData.length * buttonSpacing, 300);

        this.buttons = [];

        buttonData.forEach((data, index) => {
            const x = index * buttonSpacing;
            const button = this.add.image(x, buttonY, data.key);

            // Set individual button scales
            const scales = [0.25, 0.27, 0.29, 0.27, 0.25];
            button.setScale(scales[index]);
            button.setInteractive({ useHandCursor: true });

            button.gameMode = data.label;
            this.buttons.push(button);
            this.buttonContainer.add(button);

            button.on('pointerover', () => {
                if (!this.isDragging) {
                    button.setScale(buttonScale * 1.1);
                    button.setTint(0xdddddd);
                }
            });

            button.on('pointerout', () => {
                button.setScale(buttonScale);
                button.clearTint();
            });

            button.on('pointerdown', (pointer, localX, localY, event) => {
                if (this.isDragging) {
                    event.stopPropagation();
                    return;
                }

                button.setTint(0x888888);
                console.log(`${data.label} button clicked!`);

                if (data.key === 'friends_game_btn') {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                        this.scene.start('GameScene');
                    });
                } else {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                    });
                }
            });
        });

        // Center the container
        const totalWidth = (buttonData.length - 1) * buttonSpacing;
        const containerStartX = (1280 - totalWidth) / 2;
        this.buttonContainer.x = containerStartX;
    }

    update() {}
} 