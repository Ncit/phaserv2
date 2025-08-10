import { LoadingScene } from './scenes/LoadingScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { FriendsGameScene } from './scenes/FriendsGameScene.js';
import { AIBotScene } from './scenes/AIBotScene.js';
import { FastGameScene } from './scenes/FastGameScene.js';

import { EnvironmentConfig, isFeatureEnabled, isMobileDebuggingEnabled } from './config/EnvironmentConfig.js';
import environmentSwitcher from './utils/EnvironmentSwitcher.js';

// Initialize environment configuration (this sets up window.gameConfig and window.isDebug)
const envConfig = new EnvironmentConfig();

// Initialize environment switcher (provides URL-based switching and console commands)
environmentSwitcher.handleUrlChange();

// Set isWinline based on URL parameter 'brand' (defaults to 'winline' if not specified)
const urlParams = new URLSearchParams(window.location.search);
const brandParam = urlParams.get('brand');
window.isWinline = brandParam !== 'betboom'; // true for 'winline' or any other value, false for 'betboom'

console.log(`🎨 Brand detected: ${window.isWinline ? 'Winline' : 'Betboom'} (from URL parameter: ${brandParam || 'winline (default)'})`);
// Load Eruda (mobile debugging tool) only in development mode
if (isMobileDebuggingEnabled()) {
    loadEruda();
}

// Function to load Eruda
function loadEruda() {
    if (window.eruda) {
        console.log('🔧 Eruda already loaded');
        return;
    }
    
    // Load Eruda from CDN
    const erudaScript = document.createElement('script');
    erudaScript.src = 'https://cdn.jsdelivr.net/npm/eruda';
    erudaScript.onload = () => {
        // Initialize Eruda only in development
        if (window.eruda) {
            window.eruda.init();
            console.log('🔧 Eruda mobile debugging tool loaded (development mode only)');
        }
    };
    document.head.appendChild(erudaScript);
}

// Function to unload Eruda
function unloadEruda() {
    if (window.eruda) {
        try {
            window.eruda.destroy();
            delete window.eruda;
            console.log('🔧 Eruda mobile debugging tool unloaded');
        } catch (error) {
            console.warn('⚠️ Error unloading Eruda:', error);
        }
    }
}

// Monitor environment changes to load/unload Eruda
if (window.gameConfig) {
    window.gameConfig.onEnvironmentChange = () => {
        const shouldLoadEruda = window.gameConfig.isMobileDebuggingEnabled();
        
        if (shouldLoadEruda && !window.eruda) {
            console.log('🔄 Environment changed to development, loading Eruda...');
            loadEruda();
        } else if (!shouldLoadEruda && window.eruda) {
            console.log('🔄 Environment changed to production, unloading Eruda...');
            unloadEruda();
        }
    };
}

// Create environment switching buttons in debug mode
if (window.isDebug) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            environmentSwitcher.createSwitchingButtons();
        });
    } else {
        environmentSwitcher.createSwitchingButtons();
    }
}

// Global variables
window.firstFlop = false;



const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
            scene: [LoadingScene, LobbyScene, FriendsGameScene, AIBotScene, FastGameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

new Phaser.Game(config);
