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
        this.load.image('button_placeholder', 'assets/button_placeholder.png');

        this.load.image('underline', 'assets/underline.png');
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

        // Setup button interactions
        this.setupProgressBarControls();
        this.setupQuickActionButtons();
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

    update() {

    }
}
