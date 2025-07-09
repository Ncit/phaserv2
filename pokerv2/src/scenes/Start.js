export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/lobby_background.png');
        this.load.image('lobby_overlay', 'assets/lobby_overlay.png');
        this.load.image('top_bar', 'assets/top_bar_logo.png');
        // this.load.image('winline_logo', 'assets/winline_logo.png');

        // Load button assets for horizontal slider
        this.load.image('fast_game_btn', 'assets/fast_game.png');
        this.load.image('friends_game_btn', 'assets/friends_game.png');
        this.load.image('high_bid_btn', 'assets/high_bid.png');
        this.load.image('random_match_btn', 'assets/random_match.png');
        this.load.image('train_game_btn', 'assets/train_game.png');
        this.load.script('vklogic','./src/scripts/vklogic.js');
    }

    create() {
        initVkBridgeApp();
        this.background = this.add.image(640, 360, 'background');
        this.lobbyOverlay = this.add.image(640, 360, 'lobby_overlay');
        this.topBar = this.add.image(640, 50, 'top_bar');
        // this.winline_logo = this.add.image(640, 30, 'winline_logo');
        this.lobbyOverlay.scale = 0.5;
        this.topBar.setScale(0.5);
        // this.winline_logo.setScale(0.15);
        // Create buttons for horizontal slider
        this.createButtons();
    }

    createButtons() {
        const buttonScale = 0.27; // Scale down large images to ~200x300
        const buttonSpacing = 250; // Space between button centers
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
        this.buttonContainer = this.add.container(0, 450); // Position container at y=450
        this.buttonContainer.setSize(buttonData.length * buttonSpacing, 300);

        // Store buttons for later use
        this.buttons = [];

        // Create each button and add to container
        buttonData.forEach((data, index) => {
            const x = index * buttonSpacing; // Relative to container
            
            // Create button sprite
            const button = this.add.image(x, buttonY, data.key);
            button.setScale(buttonScale);
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

    }
    
}
