/**
 * Telegram Mini App Integration
 * Handles Telegram Web App API integration for the poker game
 */

// Global Telegram WebApp object (will be available in Telegram environment)
let TelegramWebApp = null;

/**
 * Force landscape orientation for Telegram Mini App
 */
function forceTelegramLandscape() {
    if (!TelegramWebApp) {
        console.log('📱 Telegram WebApp not available for landscape control');
        return false;
    }

    try {
        console.log('🔄 Forcing landscape orientation for Telegram Mini App...');

        // 1. Set viewport settings for landscape
        if (typeof TelegramWebApp.setViewportSettings === 'function') {
            TelegramWebApp.setViewportSettings({
                resize_keyboard: true,
                can_minimize: true
            });
            console.log('✅ Viewport settings applied for landscape');
        }

        // 2. Expand WebApp to full height
        if (typeof TelegramWebApp.expand === 'function') {
            TelegramWebApp.expand();
            console.log('✅ WebApp expanded for landscape mode');
        }

        // 3. Apply Telegram-specific landscape CSS
        applyTelegramLandscapeCSS();

        // 4. Set CSS custom properties for Telegram viewport
        document.documentElement.style.setProperty('--tg-viewport-height', '100vh');
        document.documentElement.style.setProperty('--tg-viewport-width', '100vw');

        console.log('✅ Telegram landscape orientation applied successfully');
        return true;
    } catch (error) {
        console.error('❌ Error forcing Telegram landscape:', error);
        return false;
    }
}

/**
 * Apply Telegram-specific landscape CSS
 */
function applyTelegramLandscapeCSS() {
    // Remove existing landscape CSS if present
    const existingStyle = document.getElementById('telegram-landscape-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Create new landscape CSS
    const landscapeCSS = `
        /* Telegram Mini App Landscape Styles */
        body {
            min-height: 100vh !important;
            min-width: 100vw !important;
            overflow: hidden !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
        }

        #game-container {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            position: relative !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        canvas {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            display: block !important;
        }

        /* Force landscape orientation */
        @media screen and (orientation: portrait) {
            body {
                transform: rotate(90deg) !important;
                transform-origin: left top !important;
                width: 100vh !important;
                height: 100vw !important;
                position: absolute !important;
                top: 100% !important;
                left: 0 !important;
            }
            
            #game-container {
                width: 100vh !important;
                height: 100vw !important;
            }
        }

        @media screen and (orientation: landscape) {
            body {
                transform: none !important;
                width: 100vw !important;
                height: 100vh !important;
            }
            
            #game-container {
                width: 100vw !important;
                height: 100vh !important;
            }
        }

        /* Telegram-specific viewport handling */
        @supports (height: 100dvh) {
            body {
                height: 100dvh !important;
            }
            
            #game-container {
                height: 100dvh !important;
            }
        }

        /* Prevent zooming and scrolling */
        html {
            touch-action: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }

        /* Hide scrollbars */
        ::-webkit-scrollbar {
            display: none !important;
        }

        * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
        }
    `;

    // Inject the CSS
    const style = document.createElement('style');
    style.id = 'telegram-landscape-style';
    style.textContent = landscapeCSS;
    document.head.appendChild(style);

    console.log('✅ Telegram landscape CSS applied');
}

/**
 * Initialize Telegram Web App
 */
function initTelegramWebApp() {
    try {
        // Check if Telegram WebApp is available
        if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
            TelegramWebApp = window.Telegram.WebApp;
            
            console.log('📱 Telegram WebApp object found:', TelegramWebApp);
            
            // Initialize the Web App with error handling
            try {
                if (typeof TelegramWebApp.ready === 'function') {
                    TelegramWebApp.ready();
                    console.log('✅ Telegram WebApp ready() called');
                } else {
                    console.warn('⚠️ TelegramWebApp.ready() not available');
                }
            } catch (readyError) {
                console.warn('⚠️ Error calling TelegramWebApp.ready():', readyError);
            }
            
            // Force landscape orientation for Telegram Mini App
            forceTelegramLandscape();
            
            // Expand the Web App to full height with error handling
            try {
                if (typeof TelegramWebApp.expand === 'function') {
                    TelegramWebApp.expand();
                    console.log('✅ Telegram WebApp expand() called');
                } else {
                    console.warn('⚠️ TelegramWebApp.expand() not available');
                }
            } catch (expandError) {
                console.warn('⚠️ Error calling TelegramWebApp.expand():', expandError);
            }
            
            console.log('✅ Telegram Web App initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Telegram Web App not available');
            console.log('📱 window.Telegram:', typeof window.Telegram);
            console.log('📱 window.Telegram.WebApp:', typeof window.Telegram?.WebApp);
            return false;
        }
    } catch (error) {
        console.error('❌ Error initializing Telegram Web App:', error);
        return false;
    }
}

/**
 * Setup Telegram app with user data
 */
function setupTelegramApp(appDataCallback) {
    try {
        if (!TelegramWebApp) {
            console.error('❌ Telegram Web App not initialized');
            throw new Error('Telegram Web App not initialized');
        }
        console.log('📱 Setting up Telegram app...');
        console.log('📱 TelegramWebApp:', TelegramWebApp);
        console.log('📱 TelegramWebApp.initDataUnsafe:', TelegramWebApp.initDataUnsafe);

        // Get user data from Telegram Web App
        const user = TelegramWebApp.initDataUnsafe?.user;
        
        if (user) {
            console.log('📱 Telegram user data found:', user);
            
            // Format user data to match app expectations
            const appData = {
                telegram_user_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || '',
                language_code: user.language_code || 'en',
                userAvatar: user.photo_url || 'https://avatar.iran.liara.run/public',
                // Add Telegram-specific fields
                is_premium: user.is_premium || false,
                added_to_attachment_menu: user.added_to_attachment_menu || false,
                allows_write_to_pm: user.allows_write_to_pm || false
            };
            
            console.log('✅ Telegram user data formatted:', appData);
            appDataCallback(appData);
        } else {
            console.warn('⚠️ No user data available from Telegram');
            console.log('📱 TelegramWebApp.initDataUnsafe:', TelegramWebApp.initDataUnsafe);
            
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
            console.log('📱 Using fallback data:', fallbackData);
            appDataCallback(fallbackData);
        }
    } catch (error) {
        console.error('❌ Error setting up Telegram app:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            TelegramWebApp: TelegramWebApp
        });
        
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
        console.log('📱 Using error fallback data:', fallbackData);
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