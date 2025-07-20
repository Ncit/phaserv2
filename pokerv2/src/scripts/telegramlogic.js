/**
 * Telegram Mini App Integration
 * Handles Telegram Web App API integration for the poker game
 */

// Global Telegram WebApp object (will be available in Telegram environment)
let TelegramWebApp = null;

/**
 * Initialize Telegram Web App
 */
function initTelegramWebApp() {
    // Check if Telegram WebApp is available
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        TelegramWebApp = window.Telegram.WebApp;
        
        // Initialize the Web App
        TelegramWebApp.ready();
        
        // Expand the Web App to full height
        TelegramWebApp.expand();
        
        console.log('✅ Telegram Web App initialized');
        return true;
    } else {
        console.warn('⚠️ Telegram Web App not available');
        return false;
    }
}

/**
 * Setup Telegram app with user data
 */
function setupTelegramApp(appDataCallback) {
    if (!TelegramWebApp) {
        console.error('❌ Telegram Web App not initialized');
        return;
    }

    try {
        // Get user data from Telegram Web App
        const user = TelegramWebApp.initDataUnsafe?.user;
        
        if (user) {
            // Format user data to match app expectations
            const appData = {
                telegram_user_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || '',
                language_code: user.language_code || 'en',
                userAvatar: user.photo_url || '',
                // Add Telegram-specific fields
                is_premium: user.is_premium || false,
                added_to_attachment_menu: user.added_to_attachment_menu || false,
                allows_write_to_pm: user.allows_write_to_pm || false
            };
            
            console.log('✅ Telegram user data received:', appData);
            appDataCallback(appData);
        } else {
            console.warn('⚠️ No user data available from Telegram');
            // Provide fallback data for development
            const fallbackData = {
                telegram_user_id: 123456789,
                first_name: 'Telegram User',
                last_name: '',
                username: 'telegram_user',
                language_code: 'en',
                userAvatar: '',
                is_premium: false,
                added_to_attachment_menu: false,
                allows_write_to_pm: false
            };
            appDataCallback(fallbackData);
        }
    } catch (error) {
        console.error('❌ Error setting up Telegram app:', error);
        // Provide fallback data on error
        const fallbackData = {
            telegram_user_id: 123456789,
            first_name: 'Telegram User',
            last_name: '',
            username: 'telegram_user',
            language_code: 'en',
            userAvatar: '',
            is_premium: false,
            added_to_attachment_menu: false,
            allows_write_to_pm: false
        };
        appDataCallback(fallbackData);
    }
}

/**
 * Get Telegram user information
 */
function getTelegramUserInfo(callback) {
    if (!TelegramWebApp) {
        console.error('❌ Telegram Web App not initialized');
        return;
    }

    try {
        const user = TelegramWebApp.initDataUnsafe?.user;
        if (user) {
            callback(user);
        } else {
            console.warn('⚠️ No user data available');
            callback(null);
        }
    } catch (error) {
        console.error('❌ Error getting Telegram user info:', error);
        callback(null);
    }
}

/**
 * Show Telegram main button
 */
function showTelegramMainButton(text, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.MainButton.setText(text);
        TelegramWebApp.MainButton.onClick(callback);
        TelegramWebApp.MainButton.show();
        console.log('✅ Telegram main button shown:', text);
    } catch (error) {
        console.error('❌ Error showing Telegram main button:', error);
    }
}

/**
 * Hide Telegram main button
 */
function hideTelegramMainButton() {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.MainButton.hide();
        console.log('✅ Telegram main button hidden');
    } catch (error) {
        console.error('❌ Error hiding Telegram main button:', error);
    }
}

/**
 * Show Telegram back button
 */
function showTelegramBackButton(callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.BackButton.onClick(callback);
        TelegramWebApp.BackButton.show();
        console.log('✅ Telegram back button shown');
    } catch (error) {
        console.error('❌ Error showing Telegram back button:', error);
    }
}

/**
 * Hide Telegram back button
 */
function hideTelegramBackButton() {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.BackButton.hide();
        console.log('✅ Telegram back button hidden');
    } catch (error) {
        console.error('❌ Error hiding Telegram back button:', error);
    }
}

/**
 * Show Telegram Haptic feedback
 */
function showTelegramHapticFeedback(style = 'light') {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
        console.error('❌ Error showing haptic feedback:', error);
    }
}

/**
 * Show Telegram notification
 */
function showTelegramNotification(message, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.showAlert(message, callback);
    } catch (error) {
        console.error('❌ Error showing Telegram notification:', error);
    }
}

/**
 * Show Telegram confirmation dialog
 */
function showTelegramConfirm(message, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.showConfirm(message, callback);
    } catch (error) {
        console.error('❌ Error showing Telegram confirmation:', error);
    }
}

/**
 * Close Telegram Web App
 */
function closeTelegramWebApp() {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.close();
        console.log('✅ Telegram Web App closed');
    } catch (error) {
        console.error('❌ Error closing Telegram Web App:', error);
    }
}

/**
 * Get Telegram theme parameters
 */
function getTelegramThemeParams() {
    if (!TelegramWebApp) {
        return null;
    }

    try {
        return TelegramWebApp.themeParams;
    } catch (error) {
        console.error('❌ Error getting Telegram theme params:', error);
        return null;
    }
}

/**
 * Check if running in Telegram
 */
function isTelegramEnvironment() {
    return typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
}

/**
 * Get Telegram platform
 */
function getTelegramPlatform() {
    if (!TelegramWebApp) {
        return 'unknown';
    }

    try {
        return TelegramWebApp.platform;
    } catch (error) {
        console.error('❌ Error getting Telegram platform:', error);
        return 'unknown';
    }
}

/**
 * Get Telegram version
 */
function getTelegramVersion() {
    if (!TelegramWebApp) {
        return 'unknown';
    }

    try {
        return TelegramWebApp.version;
    } catch (error) {
        console.error('❌ Error getting Telegram version:', error);
        return 'unknown';
    }
}

// Export functions for use in other modules
export {
    initTelegramWebApp,
    setupTelegramApp,
    getTelegramUserInfo,
    showTelegramMainButton,
    hideTelegramMainButton,
    showTelegramBackButton,
    hideTelegramBackButton,
    showTelegramHapticFeedback,
    showTelegramNotification,
    showTelegramConfirm,
    closeTelegramWebApp,
    getTelegramThemeParams,
    isTelegramEnvironment,
    getTelegramPlatform,
    getTelegramVersion
}; 