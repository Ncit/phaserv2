export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
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
        this.load.image('train_game_btn', 'assets/train_game.png');

        // Load bonus button asset
        this.load.image('bonus_button', 'assets/bonus_button.png');

        setupApp(function (appData) {
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

        // If assets are already loaded (e.g., on restart), start timer immediately
        if (this.load.isReady()) {
            this.startTimer();
        }
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
        const appData = {
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