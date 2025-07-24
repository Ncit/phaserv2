function initVkBridgeApp() {
    vkBridge.send('VKWebAppInit', {});
}

function friendsInvite() {
    // Check if VK Bridge is available
    if (typeof vkBridge === 'undefined') {
        console.warn('VK Bridge not available - friends invitation not supported');
        return Promise.reject(new Error('VK Bridge not available'));
    }

    console.log('Opening VK friends dialog...');
    
    return vkBridge
        .send('VKWebAppGetFriends')
        .then((data) => {
            if (data && data.users) {
                console.log('VK Friends data received:', data.users);
                
                // Show success message to user
                if (window.gameConfig && window.gameConfig.isFeatureEnabled('debugLogging')) {
                    console.log('Friends invitation dialog opened successfully');
                }
                
                return data;
            } else {
                console.warn('No friends data received from VK');
                return null;
            }
        })
        .catch((error) => {
            console.error('Error opening VK friends dialog:', error);
            
            // Handle specific VK errors
            if (error.error_type) {
                switch (error.error_type) {
                    case 'access_denied':
                        console.warn('User denied access to friends list');
                        break;
                    case 'method_disabled':
                        console.warn('Friends method is disabled for this app');
                        break;
                    default:
                        console.warn('VK error:', error.error_type, error.error_data);
                }
            }
            
            throw error;
        });
}

function setupApp(appDataCallback) {
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

// VK Purchase System
const VK_PURCHASE_ITEMS = {
    CHIPS_100: {
        id: 'chips_100',
        name: '100 Chips',
        description: 'Get 100 chips for your games',
        price: 10,
        chips: 100,
        vkProductId: 'chips_100'
    },
    CHIPS_500: {
        id: 'chips_500',
        name: '500 Chips',
        description: 'Get 500 chips for your games',
        price: 45,
        chips: 500,
        vkProductId: 'chips_500',
        bonus: 50 // 10% bonus
    },
    CHIPS_1000: {
        id: 'chips_1000',
        name: '1000 Chips',
        description: 'Get 1000 chips for your games',
        price: 80,
        chips: 1000,
        vkProductId: 'chips_1000',
        bonus: 150 // 15% bonus
    },
    CHIPS_2000: {
        id: 'chips_2000',
        name: '2000 Chips',
        description: 'Get 2000 chips for your games',
        price: 150,
        chips: 2000,
        vkProductId: 'chips_2000',
        bonus: 400 // 20% bonus
    },
    VIP_PASS: {
        id: 'vip_pass',
        name: 'VIP Pass',
        description: 'Unlock VIP features and exclusive tables',
        price: 200,
        chips: 0,
        vkProductId: 'vip_pass',
        vipFeatures: true
    }
};

// Check if VK Bridge is available
function isVKPlatform() {
    return typeof vkBridge !== 'undefined' && vkBridge.isWebView();
}

// Check if VK payment is supported
function isVKPaymentSupported() {
    return isVKPlatform() && vkBridge.supports('VKWebAppOpenPayForm');
}

// Open VK payment form
function openVKPayment(itemId, callback) {
    if (!isVKPlatform()) {
        console.warn('VK Bridge not available');
        callback({ success: false, error: 'VK Bridge not available' });
        return;
    }

    const item = VK_PURCHASE_ITEMS[itemId];
    if (!item) {
        console.error('Invalid item ID:', itemId);
        callback({ success: false, error: 'Invalid item' });
        return;
    }

    const paymentData = {
        app_id: 123456, // Replace with your VK app ID
        user_id: window.appData?.vk_user_id || 0,
        receiver_id: 123456, // Replace with your VK app ID
        amount: item.price,
        description: item.description,
        currency: 'RUB',
        test: true, // Set to false for production
        merchant_data: JSON.stringify({
            item_id: item.id,
            chips: item.chips,
            bonus: item.bonus || 0,
            vipFeatures: item.vipFeatures || false
        })
    };

    console.log('Opening VK payment form:', paymentData);

    vkBridge
        .send('VKWebAppOpenPayForm', paymentData)
        .then((data) => {
            console.log('Payment successful:', data);
            
            // Parse merchant data
            const merchantData = JSON.parse(data.merchant_data || '{}');
            
            // Process the purchase
            const purchaseResult = {
                success: true,
                item: item,
                chips: merchantData.chips || item.chips,
                bonus: merchantData.bonus || 0,
                vipFeatures: merchantData.vipFeatures || false,
                transactionId: data.transaction_id,
                amount: data.amount
            };

            // Save purchase to local storage
            savePurchase(purchaseResult);
            
            callback(purchaseResult);
        })
        .catch((error) => {
            console.error('Payment failed:', error);
            callback({ 
                success: false, 
                error: error.error_type || 'Payment failed',
                details: error
            });
        });
}

// Save purchase to local storage
function savePurchase(purchaseResult) {
    try {
        const purchases = JSON.parse(localStorage.getItem('vk_purchases') || '[]');
        purchases.push({
            ...purchaseResult,
            timestamp: Date.now(),
            userId: window.appData?.vk_user_id || 0
        });
        localStorage.setItem('vk_purchases', JSON.stringify(purchases));

        // Update user chips
        const currentChips = parseInt(localStorage.getItem('user_chips') || '0');
        const newChips = currentChips + purchaseResult.chips + purchaseResult.bonus;
        localStorage.setItem('user_chips', newChips.toString());

        // Update VIP status
        if (purchaseResult.vipFeatures) {
            localStorage.setItem('user_vip', 'true');
        }

        console.log('Purchase saved:', purchaseResult);
    } catch (error) {
        console.error('Error saving purchase:', error);
    }
}

// Get user's current chips
function getUserChips() {
    return parseInt(localStorage.getItem('user_chips') || '0');
}

// Get user's VIP status
function isUserVIP() {
    return localStorage.getItem('user_vip') === 'true';
}

// Get purchase history
function getPurchaseHistory() {
    try {
        return JSON.parse(localStorage.getItem('vk_purchases') || '[]');
    } catch (error) {
        console.error('Error getting purchase history:', error);
        return [];
    }
}

// Check if user can afford an item
function canAffordChips(chips) {
    return getUserChips() >= chips;
}

// Deduct chips from user account
function deductChips(amount) {
    const currentChips = getUserChips();
    if (currentChips >= amount) {
        localStorage.setItem('user_chips', (currentChips - amount).toString());
        return true;
    }
    return false;
}

// Add chips to user account (for testing or rewards)
function addChips(amount) {
    const currentChips = getUserChips();
    localStorage.setItem('user_chips', (currentChips + amount).toString());
}

// Get available purchase items
function getAvailableItems() {
    return Object.values(VK_PURCHASE_ITEMS);
}

// Format price for display
function formatPrice(price) {
    return `${price} ₽`;
}

// Format chips for display
function formatChips(chips) {
    return chips.toLocaleString();
}

// Export functions for use in other modules
export {
    initVkBridgeApp,
    friendsInvite,
    setupApp,
    userInfo,
    isVKPlatform,
    isVKPaymentSupported,
    openVKPayment,
    getUserChips,
    isUserVIP,
    getPurchaseHistory,
    canAffordChips,
    deductChips,
    addChips,
    getAvailableItems,
    formatPrice,
    formatChips,
    VK_PURCHASE_ITEMS
};
