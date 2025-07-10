export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('currentUserAvatar', window.appData.photo_200);
    }

    create() {
        // initVkBridgeApp();

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
           this.userAvatar = this.add.image(120, 46, 'currentUserAvatar');
           this.userAvatar.scale = 0.3;
            this.crown = this.add.image(138, 60, 'crown');
            console.log("---");
            console.log(window.appData);
        this.userName = this.add.text(166, 22, window.appData.first_name, { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 24});
        this.star = this.add.image(346, 62, 'star');
        this.progress = this.add.image(246, 64, 'progress');
        this.starCount = this.add.text(362, 50, '366', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: 19});
        this.crown.scale = 0.34;
        this.progress.scale = 0.34;
        this.star.scale = 0.36;
       
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
        // HINT: подключение к игре
        this.joinGameMode();
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
                
                // Check if this is the Train Game button
                if (data.key === 'train_game_btn') {
                    // Send network message and navigate to GameScene
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                        console.log('Starting GameScene...');
                        this.scene.start('GameScene');
                    });
                } else {
                    // For other game modes, send join request but don't navigate yet
                    
                    // Reset tint after short delay for other buttons
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                    });
                }
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

        // HINT: 
        // Initialize NetworkService when Start scene loads
        this.initializeNetworkService();
    }

    initializeNetworkService() {
        // Initialize NetworkService for the entire application
        
        // Setup connection event handlers
        window.NetworkService.onConnect(() => {
            console.log('[Start] Connected to game server!');
            
            // Send initial connection request
            window.NetworkService.send({
                type: 'connect',
                playerId: window.appData?.id || 'guest',
                playerName: window.appData?.first_name || 'Guest',
                avatar: window.appData?.photo_200 || null,
                timestamp: Date.now()
            });

        });

        window.NetworkService.onDisconnect((event) => {
            console.log('[Start] Disconnected from game server');
            // Show disconnection indicator or fallback to offline mode
            this.handleDisconnection();
        });

        window.NetworkService.onError((error) => {
            console.error('[Start] Network error:', error);
            // Handle network errors gracefully
            this.handleNetworkError(error);
        });
        // HINT: 
        window.NetworkService.onMessage('player_balance', (data) => {
            console.log('[Start] Player balance update:', data);
            if (data.balance && this.chipCount) {
                this.chipCount.setText(data.balance.toString());
            }
        });
        // HINT: 
        // Send ping to keep connection alive
        this.networkPingTimer = this.time.addEvent({
            delay: 30000, // 30 seconds
            callback: () => {
                if (window.NetworkService.isConnected()) {
                    window.NetworkService.send({ type: 'ping' });
                }
            },
            loop: true
        });
        // HINT:
        // Request initial lobby data
        this.time.delayedCall(1000, () => {
            if (window.NetworkService.isConnected()) {
                window.NetworkService.send({
                    type: 'get_lobby_info',
                    playerId: window.appData?.id || 'guest'
                });
            }
        });
    }

    handleDisconnection() {
        // Handle disconnection from server
        console.log('[Start] Handling disconnection...');
        // Could show a reconnecting message or switch to offline mode
        // For now, just log it
    }

    handleNetworkError(error) {
        // Handle network errors
        console.error('[Start] Handling network error:', error);
        // Could show an error message to the user
    }

    // HINT:
    // Send join game request when entering a game mode
    joinGameMode() {
        if (window.NetworkService.isConnected()) {
            window.NetworkService.send({
                type: 'join_game',
                playerId: window.appData?.id || 'guest',
                playerName: window.appData?.first_name || 'Guest',
                avatar: window.appData?.photo_200 || null,
                timestamp: Date.now()
            });
        }
    }

    // Override destroy to cleanup network resources
    destroy() {
        if (this.networkPingTimer) {
            this.networkPingTimer.destroy();
        }
        super.destroy();
    }

    update() {

    }
}
