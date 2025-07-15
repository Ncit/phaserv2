export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
        this.debugPlayers = [
            {
                id: 1,
                name: 'Никита',
                photo: 'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 123
            },
            {
                id: 2,
                name: 'Анна',
                photo: 'https://gravatar.com/avatar/3ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 456
            },
            {
                id: 3,
                name: 'Михаил',
                photo: 'https://gravatar.com/avatar/4ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 789
            }
        ];
        this.selectedPlayer = null;
    }

    preload() {
        initVkBridgeApp();
        // Load splash screen assets
        this.load.image('splash_background', 'assets/space.png');

        this.load.image('background', 'assets/lobby_background.png');
        this.load.image('lobby_overlay', 'assets/lobby_overlay.png');
        this.load.image('dim_overlay', 'assets/dim_overlay.png');
        this.load.image('top_bar', 'assets/top_bar_logo.png');
        this.load.image('bottom_bar', 'assets/bottom_bar.png');
        this.load.image('planet_icon', 'assets/planet_icon.png');
        this.load.image('settings_button', 'assets/settings_button.png');
        this.load.image('stats_button', 'assets/stats_button.png');
        this.load.image('friends_button', 'assets/friends_button.png');
        this.load.image('chip_button', 'assets/chip_button.png');
        this.load.image('underline', 'assets/underline.png');
        this.load.image('avatar', 'assets/avatar.png');
        this.load.image('crown', 'assets/crown.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('progress', 'assets/progress.png');

        // Load button assets for horizontal slider
        this.load.image('fast_game_btn', 'assets/fast_game.png');
        this.load.image('friends_game_btn', 'assets/friends_game.png');
        this.load.image('high_bid_btn', 'assets/high_bid.png');
        this.load.image('random_match_btn', 'assets/random_match.png');
        this.load.image('ai_bot_btn', 'assets/train_game.png');

        // Load bonus button asset
        this.load.image('bonus_button', 'assets/bonus_button.png');

        // Load debug player selection assets
        this.load.image('player_select_bg', 'assets/player_name_placeholder.png');

        setupApp((appData) => {
            window.appData = appData;
        });
    }

    create() {
        // Create splash screen background
        this.background = this.add.image(640, 360, 'splash_background');

        // Add game title
        this.titleText = this.add
            .text(640, 100, 'Poker Game', {
                fontFamily: 'Arial',
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Check if we're in debug mode and show player selection
        if (window.isDebug) {
            this.createDebugPlayerSelection();
        } else {
            // If assets are already loaded (e.g., on restart), start timer immediately
            if (this.load.isReady()) {
                this.startTimer();
            }
        }
    }

    createDebugPlayerSelection() {
        // Add debug mode indicator
        this.debugText = this.add
            .text(640, 150, 'DEBUG MODE - Select Player', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Create player selection buttons
        this.createPlayerButtons();

        // Add continue button (initially disabled)
        this.continueButton = this.add
            .text(640, 600, 'Continue to Game', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#888888',
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.selectedPlayer) {
                    this.proceedToGame();
                }
            });
    }

    createPlayerButtons() {
        const buttonSpacing = 200;
        const startX = 640 - (buttonSpacing * (this.debugPlayers.length - 1)) / 2;
        const buttonY = 350;

        this.debugPlayers.forEach((player, index) => {
            const buttonX = startX + (index * buttonSpacing);
            
            // Create button background
            const buttonBg = this.add.image(buttonX, buttonY, 'player_select_bg');
            buttonBg.setScale(0.3);
            buttonBg.setInteractive({ useHandCursor: true });
            
            // Create player avatar
            const avatar = this.add.image(buttonX, buttonY - 40, 'avatar');
            avatar.setScale(0.2);
            
            // Load player avatar from URL
            const avatarKey = `debug_avatar_${player.id}`;
            this.load.image(avatarKey, player.photo);
            this.load.once('complete', () => {
                if (this.textures.exists(avatarKey)) {
                    avatar.setTexture(avatarKey);
                }
            });
            this.load.start();
            
            // Create player name text
            const nameText = this.add
                .text(buttonX, buttonY + 20, player.name, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
            
            // Create player ID text
            const idText = this.add
                .text(buttonX, buttonY + 40, `ID: ${player.vk_user_id}`, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    fill: '#CCCCCC',
                    stroke: '#000000',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);

            // Store button elements
            const buttonElements = {
                bg: buttonBg,
                avatar: avatar,
                nameText: nameText,
                idText: idText,
                player: player
            };

            // Add click handler
            buttonBg.on('pointerdown', () => {
                this.selectPlayer(buttonElements);
            });

            // Store reference to button elements
            if (!this.playerButtons) this.playerButtons = [];
            this.playerButtons.push(buttonElements);
        });
    }

    selectPlayer(selectedButtonElements) {
        // Reset all buttons
        this.playerButtons.forEach(buttonElements => {
            buttonElements.bg.setTint(0xffffff);
            buttonElements.nameText.setFill('#ffffff');
            buttonElements.avatar.setScale(0.2);
        });

        // Highlight selected button
        selectedButtonElements.bg.setTint(0x00ff00);
        selectedButtonElements.nameText.setFill('#00ff00');
        selectedButtonElements.avatar.setScale(0.25); // Slightly larger to show selection

        // Store selected player
        this.selectedPlayer = selectedButtonElements.player;

        // Enable continue button
        this.continueButton.setFill('#00ff00');
        this.continueButton.setText('Continue to Game ✓');

        console.log('Debug: Selected player:', this.selectedPlayer);
    }

    proceedToGame() {
        // Set the selected player as appData
        window.appData = {
            vk_user_id: this.selectedPlayer.vk_user_id,
            photo_200: this.selectedPlayer.photo,
            first_name: this.selectedPlayer.name,
        };

        console.log('Debug: Proceeding to game with player:', window.appData);

        // Transition to lobby
        this.scene.start('LobbyScene');
    }

    startTimer() {
        // Hide loading elements
        if (this.loadingBar) this.loadingBar.setVisible(false);
        if (this.percentText) this.percentText.setVisible(false);
        if (this.loadingText) this.loadingText.setVisible(false);

        // Show "Press any key" or countdown
        this.instructionText = this.add
            .text(640, 500, 'Starting in 2 seconds...', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
            })
            .setOrigin(0.5);

        // Create countdown timer
        let countdown = 2;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 1,
            callback: () => {
                countdown--;
                this.instructionText.setText(
                    `Starting in ${countdown} seconds...`
                );

                if (countdown === 0) {
                    this.instructionText.setText('Starting game...');
                }
            },
        });

        // Transition to LobbyScene after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.start('LobbyScene');
        });

        // Allow manual skip by clicking/touching
        // this.input.once('pointerdown', () => {
        //     if (this.countdownTimer) {
        //         this.countdownTimer.destroy();
        //     }
        //     this.scene.start('LobbyScene');
        // });
    }
}

function setupApp(appDataCallback) {
    if (window.isDebug) {
        // In debug mode, we'll set appData when player is selected
        // For now, set a default player
        const appData = {
            vk_user_id: 123,
            photo_200:
                'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
            first_name: 'Никита',
        };
        //
        appDataCallback(appData);
        return;
    }

    vkBridge
        .send('VKWebAppGetLaunchParams')
        .then((data) => {
            if (data.vk_user_id) {
                userInfo(data.vk_user_id, function (authData) {
                    appDataCallback(authData);
                });
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}

function userInfo(userId, authCallback) {
    vkBridge
        .send('VKWebAppGetUserInfo', {
            user_id: userId,
        })
        .then((data) => {
            if (data.id) {
                // Данные пользователя получены
                authCallback(data);
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}
function initVkBridgeApp() {
    vkBridge.send('VKWebAppInit', {});
} 