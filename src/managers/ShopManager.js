import { 
    isVKPlatform, 
    isVKPaymentSupported, 
    openVKPayment, 
    getUserChips, 
    isUserVIP, 
    getAvailableItems, 
    formatPrice, 
    formatChips 
} from '../scripts/vklogic.js';

export class ShopManager {
    constructor(scene) {
        this.scene = scene;
        this.isDebug = window.isDebug || false;
        this.shopContainer = null;
        this.itemsContainer = null;
        this.isVisible = false;
        
        // Shop configuration matching game style
        this.config = {
            width: 1000,
            height: 700,
            itemSpacing: 30,
            itemsPerRow: 2,
            itemWidth: 450,
            itemHeight: 280
        };
    }

    // Show the shop
    showShop() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.createShopUI();
        
        if (this.isDebug) {
            console.log('ShopManager: Shop opened');
        }
    }

    // Hide the shop
    hideShop() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.destroyShopUI();
        
        if (this.isDebug) {
            console.log('ShopManager: Shop closed');
        }
    }

    // Toggle shop visibility
    toggleShop() {
        if (this.isVisible) {
            this.hideShop();
        } else {
            this.showShop();
        }
    }

    // Create shop UI
    createShopUI() {
        // Create main container
        this.shopContainer = this.scene.add.container(640, 360);
        
        // Create background overlay (matching game style)
        const overlay = this.scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8);
        overlay.setInteractive();
        overlay.on('pointerdown', () => this.hideShop());
        this.shopContainer.add(overlay);
        
        // Create shop background (matching game style)
        const shopBg = this.scene.add.rectangle(0, 0, this.config.width, this.config.height, 0x1a1a1a, 0.95);
        shopBg.setStrokeStyle(3, 0x3498db);
        this.shopContainer.add(shopBg);
        
        // Create title with game font style
        const title = this.scene.add.text(0, -this.config.height / 2 + 40, 'SHOP', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '36px',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);
        this.shopContainer.add(title);
        
        // Create close button (matching game style)
        const closeButton = this.scene.add.text(this.config.width / 2 - 40, -this.config.height / 2 + 40, '✕', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        closeButton.setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => this.hideShop());
        closeButton.on('pointerover', () => closeButton.setTint(0xff0000));
        closeButton.on('pointerout', () => closeButton.clearTint());
        this.shopContainer.add(closeButton);
        
        // Create items container
        this.itemsContainer = this.scene.add.container(0, 0);
        this.shopContainer.add(this.itemsContainer);
        
        // Create shop items
        this.createShopItems();
        
        // Create user info
        this.createUserInfo();
        
        // Add to scene
        this.scene.add.existing(this.shopContainer);
        
        // Add ESC key handler
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.hideShop();
        });
    }

    // Create shop items
    createShopItems() {
        const items = getAvailableItems();
        const startX = -this.config.width / 2 + 60;
        const startY = -this.config.height / 2 + 120;
        
        items.forEach((item, index) => {
            const row = Math.floor(index / this.config.itemsPerRow);
            const col = index % this.config.itemsPerRow;
            
            const x = startX + col * (this.config.itemWidth + this.config.itemSpacing);
            const y = startY + row * (this.config.itemHeight + this.config.itemSpacing);
            
            this.createShopItem(item, x, y);
        });
    }

    // Create individual shop item
    createShopItem(item, x, y) {
        const itemContainer = this.scene.add.container(x, y);
        
        // Item background (matching game style)
        const itemBg = this.scene.add.rectangle(0, 0, this.config.itemWidth, this.config.itemHeight, 0x2c3e50, 0.9);
        itemBg.setStrokeStyle(2, 0x3498db);
        itemContainer.add(itemBg);
        
        // Item name (matching game font style)
        const nameText = this.scene.add.text(0, -100, item.name, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '24px',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 2
        });
        nameText.setOrigin(0.5);
        itemContainer.add(nameText);
        
        // Item description (matching game font style)
        const descText = this.scene.add.text(0, -60, item.description, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '16px',
            fill: '#bdc3c7',
            stroke: '#000000',
            strokeThickness: 1,
            wordWrap: { width: this.config.itemWidth - 40 }
        });
        descText.setOrigin(0.5);
        itemContainer.add(descText);
        
        // Chips amount (matching game style)
        if (item.chips > 0) {
            const chipsText = this.scene.add.text(0, -20, `${formatChips(item.chips)} Chips`, {
                fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                fontSize: '20px',
                fill: '#f1c40f',
                stroke: '#000000',
                strokeThickness: 2
            });
            chipsText.setOrigin(0.5);
            itemContainer.add(chipsText);
        }
        
        // Bonus chips (matching game style)
        if (item.bonus > 0) {
            const bonusText = this.scene.add.text(0, 10, `+${formatChips(item.bonus)} Bonus!`, {
                fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                fontSize: '18px',
                fill: '#e74c3c',
                stroke: '#000000',
                strokeThickness: 2
            });
            bonusText.setOrigin(0.5);
            itemContainer.add(bonusText);
        }
        
        // VIP indicator (matching game style)
        if (item.vipFeatures) {
            const vipText = this.scene.add.text(0, 10, 'VIP Features', {
                fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                fontSize: '18px',
                fill: '#9b59b6',
                stroke: '#000000',
                strokeThickness: 2
            });
            vipText.setOrigin(0.5);
            itemContainer.add(vipText);
        }
        
        // Price (matching game style)
        const priceText = this.scene.add.text(0, 50, formatPrice(item.price), {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '24px',
            fill: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 2
        });
        priceText.setOrigin(0.5);
        itemContainer.add(priceText);
        
        // Buy button (matching game button style)
        const buyButton = this.scene.add.rectangle(0, 100, 160, 50, 0x27ae60);
        buyButton.setStrokeStyle(2, 0x2ecc71);
        const buyText = this.scene.add.text(0, 100, 'BUY', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        buyText.setOrigin(0.5);
        
        buyButton.setInteractive({ useHandCursor: true });
        buyButton.on('pointerdown', () => this.handlePurchase(item));
        buyButton.on('pointerover', () => {
            buyButton.setFillStyle(0x2ecc71);
            buyText.setTint(0xffff00);
        });
        buyButton.on('pointerout', () => {
            buyButton.setFillStyle(0x27ae60);
            buyText.clearTint();
        });
        
        itemContainer.add(buyButton);
        itemContainer.add(buyText);
        
        // Add to items container
        this.itemsContainer.add(itemContainer);
    }

    // Create user info section (matching game style)
    createUserInfo() {
        const userContainer = this.scene.add.container(0, this.config.height / 2 - 60);
        
        // Current chips (matching game style)
        const currentChips = getUserChips();
        const chipsText = this.scene.add.text(-300, 0, `Your Chips: ${formatChips(currentChips)}`, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 2
        });
        chipsText.setOrigin(0.5);
        userContainer.add(chipsText);
        
        // VIP status (matching game style)
        const isVIP = isUserVIP();
        const vipText = this.scene.add.text(0, 0, isVIP ? 'VIP Status: Active' : 'VIP Status: Inactive', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: isVIP ? '#9b59b6' : '#95a5a6',
            stroke: '#000000',
            strokeThickness: 2
        });
        vipText.setOrigin(0.5);
        userContainer.add(vipText);
        
        // Platform info (matching game style)
        const platformText = this.scene.add.text(300, 0, isVKPlatform() ? 'VK Platform' : 'Web Platform', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 2
        });
        platformText.setOrigin(0.5);
        userContainer.add(platformText);
        
        this.shopContainer.add(userContainer);
    }

    // Handle purchase
    handlePurchase(item) {
        if (this.isDebug) {
            console.log('ShopManager: Purchase requested for', item.name);
        }
        
        // Check if VK platform is available
        if (!isVKPlatform()) {
            this.showMessage('VK platform is required for purchases', 'error');
            return;
        }
        
        // Check if VK payment is supported
        if (!isVKPaymentSupported()) {
            this.showMessage('VK payment is not supported on this platform', 'error');
            return;
        }
        
        // Show confirmation dialog
        this.showConfirmationDialog(item);
    }

    // Show confirmation dialog (matching game style)
    showConfirmationDialog(item) {
        // Create confirmation overlay
        const confirmOverlay = this.scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.9);
        confirmOverlay.setInteractive();
        
        const confirmContainer = this.scene.add.container(640, 360);
        
        // Confirmation background (matching game style)
        const confirmBg = this.scene.add.rectangle(0, 0, 500, 350, 0x2c3e50, 0.95);
        confirmBg.setStrokeStyle(3, 0x3498db);
        confirmContainer.add(confirmBg);
        
        // Confirmation text (matching game font style)
        const confirmText = this.scene.add.text(0, -80, `Purchase ${item.name}?`, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        confirmText.setOrigin(0.5);
        confirmContainer.add(confirmText);
        
        const priceText = this.scene.add.text(0, -40, `Price: ${formatPrice(item.price)}`, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '20px',
            fill: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 2
        });
        priceText.setOrigin(0.5);
        confirmContainer.add(priceText);
        
        // Confirm button (matching game button style)
        const confirmButton = this.scene.add.rectangle(-100, 60, 140, 50, 0x27ae60);
        confirmButton.setStrokeStyle(2, 0x2ecc71);
        const confirmButtonText = this.scene.add.text(-100, 60, 'Confirm', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        confirmButtonText.setOrigin(0.5);
        
        confirmButton.setInteractive({ useHandCursor: true });
        confirmButton.on('pointerdown', () => {
            this.processPurchase(item);
            confirmOverlay.destroy();
            confirmContainer.destroy();
        });
        confirmButton.on('pointerover', () => {
            confirmButton.setFillStyle(0x2ecc71);
            confirmButtonText.setTint(0xffff00);
        });
        confirmButton.on('pointerout', () => {
            confirmButton.setFillStyle(0x27ae60);
            confirmButtonText.clearTint();
        });
        
        confirmContainer.add(confirmButton);
        confirmContainer.add(confirmButtonText);
        
        // Cancel button (matching game button style)
        const cancelButton = this.scene.add.rectangle(100, 60, 140, 50, 0xe74c3c);
        cancelButton.setStrokeStyle(2, 0xc0392b);
        const cancelButtonText = this.scene.add.text(100, 60, 'Cancel', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        cancelButtonText.setOrigin(0.5);
        
        cancelButton.setInteractive({ useHandCursor: true });
        cancelButton.on('pointerdown', () => {
            confirmOverlay.destroy();
            confirmContainer.destroy();
        });
        cancelButton.on('pointerover', () => {
            cancelButton.setFillStyle(0xc0392b);
            cancelButtonText.setTint(0xffff00);
        });
        cancelButton.on('pointerout', () => {
            cancelButton.setFillStyle(0xe74c3c);
            cancelButtonText.clearTint();
        });
        
        confirmContainer.add(cancelButton);
        confirmContainer.add(cancelButtonText);
        
        this.scene.add.existing(confirmOverlay);
        this.scene.add.existing(confirmContainer);
    }

    // Process the purchase
    processPurchase(item) {
        if (this.isDebug) {
            console.log('ShopManager: Processing purchase for', item.name);
        }
        
        // Show loading message
        this.showMessage('Processing payment...', 'info');
        
        // Open VK payment form
        openVKPayment(item.id, (result) => {
            if (result.success) {
                this.showMessage(`Purchase successful! You received ${formatChips(result.chips + result.bonus)} chips!`, 'success');
                
                // Update user info display
                this.updateUserInfo();
                
                // Trigger purchase event
                this.scene.events.emit('purchaseCompleted', result);
            } else {
                this.showMessage(`Purchase failed: ${result.error}`, 'error');
            }
        });
    }

    // Show message (matching game style)
    showMessage(message, type = 'info') {
        const colors = {
            success: 0x27ae60,
            error: 0xe74c3c,
            info: 0x3498db,
            warning: 0xf39c12
        };
        
        const messageBg = this.scene.add.rectangle(640, 100, 700, 70, colors[type], 0.9);
        messageBg.setStrokeStyle(2, 0xffffff);
        const messageText = this.scene.add.text(640, 100, message, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        messageText.setOrigin(0.5);
        
        // Auto-remove after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            messageBg.destroy();
            messageText.destroy();
        });
    }

    // Update user info display
    updateUserInfo() {
        // This would update the user info section if needed
        // For now, we'll just log the update
        if (this.isDebug) {
            console.log('ShopManager: User info updated');
        }
    }

    // Destroy shop UI
    destroyShopUI() {
        if (this.shopContainer) {
            this.shopContainer.destroy();
            this.shopContainer = null;
            this.itemsContainer = null;
        }
    }

    // Get shop statistics
    getStats() {
        return {
            isVisible: this.isVisible,
            isVKPlatform: isVKPlatform(),
            isVKPaymentSupported: isVKPaymentSupported(),
            userChips: getUserChips(),
            isUserVIP: isUserVIP(),
            availableItems: getAvailableItems().length
        };
    }
} 