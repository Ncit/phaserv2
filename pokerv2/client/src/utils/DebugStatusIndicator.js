/**
 * Debug Status Indicator
 * Shows a small indicator when debug mode is enabled in production
 */
export class DebugStatusIndicator {
    constructor() {
        this.element = null;
        this.isVisible = false;
        this.init();
    }
    
    init() {
        // Create debug indicator element
        this.element = document.createElement('div');
        this.element.id = 'debug-status-indicator';
        this.element.innerHTML = `
            <div class="debug-indicator">
                <span class="debug-icon">🐛</span>
                <span class="debug-text">DEBUG</span>
            </div>
            <button class="eruda-button" id="eruda-toggle-button">
                <span class="eruda-icon">🔧</span>
                <span>ERUDA</span>
            </button>
        `;
        
        // Add styles
        this.addStyles();
        
        // Add to page
        document.body.appendChild(this.element);
        
        // Check if debug is enabled
        this.checkDebugStatus();
        
        // Listen for debug status changes
        this.setupEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #debug-status-indicator {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                pointer-events: none;
                transition: opacity 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 5px;
            }
            
            .debug-indicator {
                background: rgba(255, 193, 7, 0.9);
                color: #000;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                border: 1px solid rgba(255, 193, 7, 0.3);
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .debug-icon {
                font-size: 12px;
            }
            
            .debug-text {
                font-family: monospace;
                letter-spacing: 0.5px;
            }
            
            .eruda-button {
                background: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: bold;
                border: none;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
                pointer-events: auto;
                display: flex;
                align-items: center;
                gap: 4px;
                font-family: monospace;
            }
            
            .eruda-button:hover {
                background: rgba(0, 123, 255, 1);
                transform: translateY(-1px);
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            }
            
            .eruda-button:active {
                transform: translateY(0);
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            
            .eruda-icon {
                font-size: 12px;
            }
            
            #debug-status-indicator.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            #debug-status-indicator.hidden .debug-indicator,
            #debug-status-indicator.hidden .eruda-button {
                pointer-events: none;
            }
            
            /* Production specific styling */
            .production-debug .debug-indicator {
                background: rgba(220, 53, 69, 0.9);
                color: white;
                border: 1px solid rgba(220, 53, 69, 0.3);
            }
            
            .production-debug .debug-indicator:hover {
                background: rgba(220, 53, 69, 1);
                transform: translateY(-1px);
            }
            
            .production-debug .eruda-button {
                background: rgba(220, 53, 69, 0.9);
                border: 1px solid rgba(220, 53, 69, 0.3);
            }
            
            .production-debug .eruda-button:hover {
                background: rgba(220, 53, 69, 1);
            }
        `;
        document.head.appendChild(style);
    }
    
    async checkDebugStatus() {
        // Check if debug is enabled
        let isDebugEnabled = false;
        
        // Check for debug manager
        if (window.debugManager) {
            isDebugEnabled = window.debugManager.isDebugEnabled();
        } else {
            // Fallback check
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            isDebugEnabled = (
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                urlParams.get('debug') === 'true' ||
                hashParams.get('debug') === 'true' ||
                window.location.hash.includes('#debug') ||
                window.isDebug === true
            );
        }
        
        // Check if we're in production
        const isProduction = !(
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'
        );
        
        if (isDebugEnabled) {
            this.show();
            
            // Add production class if in production
            if (isProduction) {
                this.element.classList.add('production-debug');
            }
        } else {
            this.hide();
        }
    }
    
    setupEventListeners() {
        // Check debug status periodically
        setInterval(() => {
            this.checkDebugStatus();
        }, 5000);
        
        // Add click handler to toggle Eruda
        const erudaButton = this.element.querySelector('#eruda-toggle-button');
        if (erudaButton) {
            erudaButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof eruda !== 'undefined') {
                    eruda.toggle();
                }
            });
        }
        
        // Add click handler to debug indicator (for status info)
        const debugIndicator = this.element.querySelector('.debug-indicator');
        if (debugIndicator) {
            debugIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDebugInfo();
            });
        }
        
        // Listen for debug status changes
        window.addEventListener('debugStatusChanged', () => {
            this.checkDebugStatus();
        });
    }
    
    show() {
        if (!this.isVisible) {
            this.element.classList.remove('hidden');
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.element.classList.add('hidden');
            this.isVisible = false;
        }
    }
    
    // Show debug information
    showDebugInfo() {
        const info = {
            debugEnabled: this.isVisible,
            environment: window.location.hostname,
            isProduction: !(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'),
            erudaAvailable: typeof eruda !== 'undefined',
            debugManagerAvailable: typeof window.debugManager !== 'undefined',
            timestamp: new Date().toISOString()
        };
        
        console.log('🐛 Debug Status:', info);
        
        // Show a brief notification
        this.showNotification('Debug info logged to console', 2000);
    }
    
    // Show notification
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Public API
    updateStatus(isEnabled, isProduction = false) {
        if (isEnabled) {
            this.show();
            if (isProduction) {
                this.element.classList.add('production-debug');
            } else {
                this.element.classList.remove('production-debug');
            }
        } else {
            this.hide();
        }
    }
    
    // Cleanup
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Auto-initialize debug status indicator
const debugStatusIndicator = new DebugStatusIndicator();
export default debugStatusIndicator; 