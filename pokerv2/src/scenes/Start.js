export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
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
        var scene = this
        setupApp(function(appData) {
                console.log("----");
                console.log(appData);
                     scene.load.image('avatarQ', appData.photo_200).start();
   scene.load.onLoadComplete.add(function(){
    scene.userAvatar = this.add.image(120, 46, 'avatarQ');
   }, this);
                // scene.userAvatar = this.add.image(120, 46, 'avatarQ');
                // scene.window.item.userAvatar.scale = 0.1;
        });

        // this.load.image('avatarQ', 'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x');
    }

    create() {
        initVkBridgeApp();
        // setupApp(function(appData) {
        //         console.log(appData);
                
        //         this.userAvatar = this.add.image(120, 46, appData.photo_200);
        //         this.userAvatar.scale = 0.1;
        // });
        this.background = this.add.image(640, 360, 'background');
        this.lobbyOverlay = this.add.image(640, 360, 'lobby_overlay');
        this.dimOverlay = this.add.image(640, 360, 'dim_overlay');
        this.topBar = this.add.image(640, 50, 'top_bar');
        this.bottomBar = this.add.image(640, 660, 'bottom_bar');
        this.underline = this.add.image(680,700, 'underline');


        this.settingsButton = this.add.image(120, 660, 'settings_button');
        this.friendsButton = this.add.image(180, 660, 'friends_button');
        this.statsButton = this.add.image(240, 660, 'stats_button');
        this.planetIcon = this.add.image(300, 660, 'planet_icon');

        this.activePlayers = this.add.text(320, 640, 'Активных участников:', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 17});
        this.activePlayersCount = this.add.text(320, 660, '12011', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 19 });

        this.chipButton = this.add.image(1180, 54, 'chip_button');
        this.chipLabel = this.add.text(1050, 30, 'Ваш баланс:', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 17 });
        this.chipCount = this.add.text(1050, 46, '20000', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 26 });

        this.avatarPlaceholder = this.add.image(120, 46, 'avatar');
        this.crown = this.add.image(138, 60, 'crown');
        this.userName = this.add.text(166, 22, 'Имя игрока', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 24});
        this.star = this.add.image(346, 62, 'star');
        this.progress = this.add.image(246, 64, 'progress');
        this.starCount = this.add.text(362, 50, '366', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 19});
        
        this.avatarPlaceholder.scale = 0.1;
        this.crown.scale = 0.34;
        this.progress.scale = 0.34;
        this.star.scale = 0.36;

                // this.userAvatar = this.add.image(120, 46, 'avatarQ');
                // this.userAvatar.scale = 0.1;
        this.chipButton.scale = 0.35;
        this.chipLabel.setTint(0xffffff);
        this.chipLabel.setAlpha(0.22);

        this.activePlayers.setTint(0xffffff);
        this.activePlayers.setAlpha(0.22);
        this.activePlayersCount.setTint(0x9FA6B3);

        this.settingsButton.setInteractive({ useHandCursor: true });
        this.friendsButton.setInteractive({ useHandCursor: true });
        this.statsButton.setInteractive({ useHandCursor: true });
        // this.planetIcon.setInteractive({ useHandCursor: true });

        this.settingsButton.scale = 0.35;
        this.friendsButton.scale = 0.35;
        this.statsButton.scale = 0.35;
        this.planetIcon.scale = 0.3;

        const controls = [
            this.settingsButton,
            this.friendsButton,
            this.statsButton
        ];

        controls.forEach((control, index) => {
        control.on('pointerover', () => {
            // this.bonusButton.setScale(0.44); // Scale up on hover
            control.setTint(0xdddddd); // Slight tint for hover
        });
        
        control.on('pointerout', () => {
            // this.bonusButton.setScale(0.4); // Reset scale
            control.clearTint(); // Remove tint
        });
        
        // Add click handler with visual feedback
        control.on('pointerdown', () => {
            // Visual click feedback
            control.setTint(0x888888);
            console.log('Bonus button clicked!');
            
            // Reset tint after short delay
            this.time.delayedCall(150, () => {
                control.clearTint();
            });
        });
        })

        this.dimOverlay.setTint(0xff0000);
        this.lobbyOverlay.scale = 0.5;
        this.topBar.setScale(0.5);
        this.bottomBar.setScale(0.5);
        this.underline.setScale(0.25);
        // Create buttons for horizontal slider
        this.createButtons();
        
        // Create and setup bonus button
        this.bonusButton = this.add.image(1040, 640, 'bonus_button');
        this.bonusButton.setScale(0.4);
        this.bonusButton.setInteractive({ useHandCursor: true });
        
        // Add hover effects to bonus button
        this.bonusButton.on('pointerover', () => {
            // this.bonusButton.setScale(0.44); // Scale up on hover
            this.bonusButton.setTint(0xdddddd); // Slight tint for hover
        });
        
        this.bonusButton.on('pointerout', () => {
            // this.bonusButton.setScale(0.4); // Reset scale
            this.bonusButton.clearTint(); // Remove tint
        });
        
        // Add click handler with visual feedback
        this.bonusButton.on('pointerdown', () => {
            // Visual click feedback
            this.bonusButton.setTint(0x888888);
            console.log('Bonus button clicked!');
            
            // Reset tint after short delay
            this.time.delayedCall(150, () => {
                this.bonusButton.clearTint();
            });
        });
    }

    createButtons() {
        const buttonScale = 0.27; // Scale down large images to ~200x300
        const buttonSpacing = 240; // Space between button centers
        const buttonY = 100; // Y position relative to container (0)

        // Button data with labels
        const buttonData = [
            { key: 'fast_game_btn', label: 'Fast Game' },
            { key: 'high_bid_btn', label: 'High Bid' },
            { key: 'train_game_btn', label: 'Train Game' },
            { key: 'random_match_btn', label: 'Random Match' },
            { key: 'friends_game_btn', label: 'Friends Game' }
        ];

        // Create container for slider
        this.buttonContainer = this.add.container(0, 250); // Position container at y=450
        this.buttonContainer.setSize(buttonData.length * buttonSpacing, 300);

        // Store buttons for later use
        this.buttons = [];

        // Create each button and add to container
        buttonData.forEach((data, index) => {
            const x = index * buttonSpacing; // Relative to container
            
            // Create button sprite
            const button = this.add.image(x, buttonY, data.key);
            if (index == 0) {
            button.setScale(0.25);
            }
            if (index == 1) {
            button.setScale(0.27);
            }
            if (index == 2) {
            button.setScale(0.29);
            }
            if (index == 3) {
            button.setScale(0.27);
            }
            if (index == 4) {
            button.setScale(0.25);
            }
            button.setInteractive({ useHandCursor: true });
            
            // Store button reference with metadata
            button.gameMode = data.label;
            this.buttons.push(button);
            
            // Add button to container
            this.buttonContainer.add(button);
            
            // Add basic hover effect
            button.on('pointerover', () => {
                if (!this.isDragging) { // Only show hover effect when not dragging
                    button.setScale(buttonScale * 1.1);
                    button.setTint(0xdddddd); // Slight tint for hover
                }
            });
            
            button.on('pointerout', () => {
                button.setScale(buttonScale);
                button.clearTint(); // Remove tint
            });
            
            // Add click handler with visual feedback
            button.on('pointerdown', (pointer, localX, localY, event) => {
                // Prevent click if we're dragging
                if (this.isDragging) {
                    event.stopPropagation();
                    return;
                }
                
                // Visual click feedback
                button.setTint(0x888888);
                console.log(`${data.label} button clicked!`);
                
                // Reset tint after short delay
                this.time.delayedCall(150, () => {
                    button.clearTint();
                });
            });
        });

        // Calculate container dimensions and center it
        const totalWidth = (buttonData.length - 1) * buttonSpacing;
        const containerStartX = (1280 - totalWidth) / 2; // Center horizontally
        
        this.buttonContainer.x = containerStartX;

        // Store container properties for sliding
        this.containerWidth = totalWidth;
        this.viewportWidth = 1280;
        this.minX = 0;
        this.maxX = Math.max(0, this.containerWidth - this.viewportWidth + 400); // Allow some padding

        // Make container interactive for dragging
        this.buttonContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.containerWidth + 400, 300), Phaser.Geom.Rectangle.Contains);
        
        console.log('Slider container created:', {
            totalWidth: this.containerWidth,
            startX: containerStartX,
            maxScroll: this.maxX
        });

        // Add drag functionality - DISABLED
        // this.setupSliderDrag();
    }

    setupSliderDrag() {
        // Drag state variables
        this.isDragging = false;
        this.dragStartX = 0;
        this.containerStartX = 0;
        this.dragVelocity = 0;
        this.lastDragTime = 0;
        this.lastDragX = 0;

        // Drag start
        this.buttonContainer.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.containerStartX = this.buttonContainer.x;
            this.dragVelocity = 0;
            this.lastDragTime = pointer.event.timeStamp;
            this.lastDragX = pointer.x;
            
            // Stop any ongoing tweens
            this.tweens.killTweensOf(this.buttonContainer);
            
            console.log('Drag started');
        });

        // Drag move
        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;

            const dragDistance = pointer.x - this.dragStartX;
            let newX = this.containerStartX + dragDistance;

            // Calculate velocity for momentum
            const currentTime = pointer.event.timeStamp;
            const timeDelta = currentTime - this.lastDragTime;
            if (timeDelta > 0) {
                this.dragVelocity = (pointer.x - this.lastDragX) / timeDelta;
            }
            this.lastDragTime = currentTime;
            this.lastDragX = pointer.x;

            // Apply boundary constraints with resistance
            if (newX > this.minX) {
                newX = this.minX + (newX - this.minX) * 0.3; // Resistance when going too far left
            } else if (newX < -this.maxX) {
                newX = -this.maxX + (newX + this.maxX) * 0.3; // Resistance when going too far right
            }

            this.buttonContainer.x = newX;
        });

        // Drag end
        this.input.on('pointerup', () => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            console.log('Drag ended, velocity:', this.dragVelocity);
            
            // Apply momentum and boundary correction
            this.applyMomentumAndBounds();
        });

        // Handle pointer leave (drag outside game area)
        this.input.on('pointerleave', () => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            this.applyMomentumAndBounds();
        });
    }

    applyMomentumAndBounds() {
        let targetX = this.buttonContainer.x;
        
        // Apply momentum if velocity is significant
        if (Math.abs(this.dragVelocity) > 0.5) {
            const momentumDistance = this.dragVelocity * 100; // Scale velocity to distance
            targetX += momentumDistance;
        }

        // Clamp to boundaries
        targetX = Phaser.Math.Clamp(targetX, -this.maxX, this.minX);

        // Smooth animation to final position
        this.tweens.add({
            targets: this.buttonContainer,
            x: targetX,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                console.log('Slider animation complete at x:', this.buttonContainer.x);
            }
        });
    }

    update() {
//         if (this.userAvatar == null) {
// this.userAvatar = this.add.image(120, 46, 'avatarQ');
//                 // this.userAvatar.scale = 0.1;
//         }
    }
    
}

function setupApp(appDataCallback) {
  vkBridge.send('VKWebAppGetLaunchParams')
  .then((data) => { 
    if (data.vk_user_id) {
      userInfo(data.vk_user_id, function(authData) {
      
      // Параметры запуска получены
      appDataCallback(authData)
});
    }
  })
  .catch((error) => {
    // Ошибка
    console.log(error);
  });
}

function userInfo(userId,authCallback) {
  vkBridge.send('VKWebAppGetUserInfo', {
  user_id: userId
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
	vkBridge.send("VKWebAppInit", {});
}