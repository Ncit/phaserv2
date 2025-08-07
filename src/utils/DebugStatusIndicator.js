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
            }
            
            .debug-icon {
                font-size: 12px;
            }
            
            .debug-text {
                font-family: monospace;
                letter-spacing: 0.5px;
            }
            
            #debug-status-indicator.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            #debug-status-indicator:hover {
                background: rgba(255, 193, 7, 1);
                cursor: pointer;
                pointer-events: auto;
            }
            
            /* Production specific styling */
            .production-debug .debug-indicator {
                background: rgba(220, 53, 69, 0.9);
                color: white;
                border: 1px solid rgba(220, 53, 69, 0.3);
            }
            
            .production-debug .debug-indicator:hover {
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
        this.element.addEventListener('click', () => {
            if (typeof eruda !== 'undefined') {
                eruda.toggle();
            }
        });
        
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