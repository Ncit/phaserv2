import { AnalyticsConfig } from '../config/AnalyticsConfig.js';

export class AnalyticsManager {
    constructor() {
        this.isInitialized = false;
        this.metrikaId = AnalyticsConfig.yandexMetrika.metrikaId;
        this.isDebug = window.isDebug || false;
        this.isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('ngrok');
        
        // Initialize Yandex Metrika
        this.initYandexMetrika();
    }

    /**
     * Initialize Yandex Metrika
     */
    initYandexMetrika() {
        try {
            if (!this.metrikaId || this.metrikaId === 'YOUR_METRIKA_ID') {
                console.warn('AnalyticsManager: Yandex Metrika ID not configured. Please set your Metrika ID in AnalyticsConfig.js');
                return;
            }

            // Skip initialization on localhost to avoid CORS issues
            if (this.isLocalhost) {
                console.warn('AnalyticsManager: Running on localhost - Yandex Metrika disabled to avoid CORS issues');
                console.log('AnalyticsManager: Events will be logged to console in debug mode');
                this.isInitialized = true; // Mark as initialized for local development
                return;
            }

            // Create Yandex Metrika script
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = `
                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
                
                ym(${this.metrikaId}, "init", ${JSON.stringify(AnalyticsConfig.yandexMetrika.options)});
            `;
            
            document.head.appendChild(script);
            
            // Create noscript fallback
            const noscript = document.createElement('noscript');
            const img = document.createElement('img');
            img.src = `https://mc.yandex.ru/watch/${this.metrikaId}`;
            img.style = 'position:absolute; left:-9999px;';
            img.alt = '';
            noscript.appendChild(img);
            document.head.appendChild(noscript);
            
            this.isInitialized = true;
            
            if (this.isDebug) {
                console.log('AnalyticsManager: Yandex Metrika initialized successfully');
            }
            
        } catch (error) {
            console.error('AnalyticsManager: Failed to initialize Yandex Metrika:', error);
        }
    }

    /**
     * Track a custom event
     * @param {string} eventName - Name of the event
     * @param {Object} parameters - Event parameters
     */
    trackEvent(eventName, parameters = {}) {
        // Always log in debug mode
        if (this.isDebug) {
            console.log(`AnalyticsManager: Event tracked: ${eventName}`, parameters);
        }

        // Skip actual tracking on localhost
        if (this.isLocalhost) {
            return;
        }

        if (!this.isInitialized || !window.ym) {
            if (this.isDebug) {
                console.log(`AnalyticsManager: Event not tracked (not initialized): ${eventName}`, parameters);
            }
            return;
        }

        try {
            window.ym(this.metrikaId, 'reachGoal', eventName, parameters);
        } catch (error) {
            console.error('AnalyticsManager: Failed to track event:', error);
        }
    }

    /**
     * Track page view
     * @param {string} pageName - Name of the page/scene
     */
    trackPageView(pageName) {
        // Always log in debug mode
        if (this.isDebug) {
            console.log(`AnalyticsManager: Page view tracked: ${pageName}`);
        }

        // Skip actual tracking on localhost
        if (this.isLocalhost) {
            return;
        }

        if (!this.isInitialized || !window.ym) {
            if (this.isDebug) {
                console.log(`AnalyticsManager: Page view not tracked (not initialized): ${pageName}`);
            }
            return;
        }

        try {
            window.ym(this.metrikaId, 'hit', pageName);
        } catch (error) {
            console.error('AnalyticsManager: Failed to track page view:', error);
        }
    }

    /**
     * Track game events
     */
    trackGameStart(gameType) {
        this.trackEvent(AnalyticsConfig.events.gameStart, { game_type: gameType });
    }

    trackGameEnd(gameType, duration, playersCount) {
        this.trackEvent(AnalyticsConfig.events.gameEnd, { 
            game_type: gameType, 
            duration: duration,
            players_count: playersCount 
        });
    }

    trackPlayerAction(action, gameType, amount = 0) {
        this.trackEvent(AnalyticsConfig.events.playerAction, { 
            action: action, 
            game_type: gameType,
            amount: amount 
        });
    }

    trackHandWin(gameType, potSize, handRank) {
        this.trackEvent(AnalyticsConfig.events.handWin, { 
            game_type: gameType, 
            pot_size: potSize,
            hand_rank: handRank 
        });
    }

    trackHandLoss(gameType, potSize) {
        this.trackEvent(AnalyticsConfig.events.handLoss, { 
            game_type: gameType, 
            pot_size: potSize 
        });
    }

    trackPurchase(itemName, itemPrice, currency = 'chips') {
        this.trackEvent(AnalyticsConfig.events.purchase, { 
            item_name: itemName, 
            item_price: itemPrice,
            currency: currency 
        });
    }

    trackButtonClick(buttonName, sceneName) {
        this.trackEvent(AnalyticsConfig.events.buttonClick, { 
            button_name: buttonName, 
            scene_name: sceneName 
        });
    }

    trackSceneChange(fromScene, toScene) {
        this.trackEvent(AnalyticsConfig.events.sceneChange, { 
            from_scene: fromScene, 
            to_scene: toScene 
        });
    }

    trackError(errorType, errorMessage) {
        this.trackEvent(AnalyticsConfig.events.error, { 
            error_type: errorType, 
            error_message: errorMessage 
        });
    }

    trackUserEngagement(action, details = {}) {
        this.trackEvent(AnalyticsConfig.events.userEngagement, { 
            action: action, 
            ...details 
        });
    }

    /**
     * Get analytics status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            metrikaId: this.metrikaId,
            isDebug: this.isDebug,
            isLocalhost: this.isLocalhost,
            environment: this.isLocalhost ? 'development' : 'production'
        };
    }
} 