/**
 * WebView Configuration for Android VK Mini App
 * Handles WebView-specific issues and configurations
 */

class WebViewConfig {
    constructor() {
        this.isAndroidWebView = this.detectAndroidWebView();
        this.isVKPlatform = this.detectVKPlatform();
        this.isVKAndroidWebView = this.isAndroidWebView && this.isVKPlatform;
        
        if (this.isVKAndroidWebView) {
            console.log('🌐 Detected VK Android WebView - applying special configuration');
            this.applyVKAndroidWebViewConfig();
        }
    }

    /**
     * Detect if running in Android WebView
     */
    detectAndroidWebView() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = /android/.test(userAgent);
        const isWebView = /wv/.test(userAgent) || /webview/.test(userAgent);
        
        // Additional checks for WebView
        const hasWebViewFeatures = !window.chrome || window.chrome.webstore;
        const hasWebViewInterface = window.AndroidInterface || window.AndroidBridge;
        
        return isAndroid && (isWebView || hasWebViewFeatures || hasWebViewInterface);
    }

    /**
     * Detect VK platform
     */
    detectVKPlatform() {
        return !!(window.VK || window.vkBridge || 
                 document.referrer.includes('vk.com') || 
                 window.location.hostname.includes('vk.com'));
    }

    /**
     * Apply special configuration for VK Android WebView
     */
    applyVKAndroidWebViewConfig() {
        // 1. Fix WebSocket connection issues
        this.fixWebSocketConnections();
        
        // 2. Fix XHR polling issues
        this.fixXHRPolling();
        
        // 3. Handle mixed content issues
        this.handleMixedContent();
        
        // 4. Apply WebView-specific optimizations
        this.applyWebViewOptimizations();
        
        // 5. Setup error handling
        this.setupErrorHandling();
    }

    /**
     * Fix WebSocket connection issues in Android WebView
     */
    fixWebSocketConnections() {
        // Override WebSocket constructor to handle Android WebView issues
        const originalWebSocket = window.WebSocket;
        
        window.WebSocket = function(url, protocols) {
            console.log('🔧 WebViewConfig: Creating WebSocket connection to:', url);
            
            try {
                // Force secure WebSocket for Android WebView
                if (url.startsWith('ws://') && this.isVKAndroidWebView) {
                    const secureUrl = url.replace('ws://', 'wss://');
                    console.log('🔧 WebViewConfig: Upgrading to secure WebSocket:', secureUrl);
                    return new originalWebSocket(secureUrl, protocols);
                }
                
                return new originalWebSocket(url, protocols);
            } catch (error) {
                console.error('🔧 WebViewConfig: WebSocket creation failed:', error);
                throw error;
            }
        };
        
        // Copy static properties
        Object.setPrototypeOf(window.WebSocket, originalWebSocket);
        window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
        window.WebSocket.OPEN = originalWebSocket.OPEN;
        window.WebSocket.CLOSING = originalWebSocket.CLOSING;
        window.WebSocket.CLOSED = originalWebSocket.CLOSED;
    }

    /**
     * Fix XHR polling issues in VK Android WebView
     */
    fixXHRPolling() {
        // Override XMLHttpRequest to handle VK Android WebView issues
        const originalXHR = window.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            
            // Add VK-specific headers for polling requests
            const originalOpen = xhr.open;
            xhr.open = function(method, url, async, user, password) {
                console.log('🔧 WebViewConfig: XHR request to:', url);
                
                // Add VK-specific headers for Socket.IO polling
                if (url.includes('socket.io') && this.isVKAndroidWebView) {
                    console.log('🔧 WebViewConfig: Adding VK headers to XHR request');
                    
                    // Override send to add headers
                    const originalSend = xhr.send;
                    xhr.send = function(data) {
                        // Add VK-specific headers
                        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        xhr.setRequestHeader('X-VK-Platform', 'android');
                        xhr.setRequestHeader('X-VK-WebView', 'true');
                        
                        // Add CORS headers
                        xhr.setRequestHeader('Origin', window.location.origin);
                        xhr.setRequestHeader('Referer', window.location.href);
                        
                        console.log('🔧 WebViewConfig: XHR request sent with VK headers');
                        return originalSend.call(this, data);
                    };
                }
                
                return originalOpen.call(this, method, url, async, user, password);
            };
            
            return xhr;
        };
        
        // Copy static properties
        Object.setPrototypeOf(window.XMLHttpRequest, originalXHR);
        window.XMLHttpRequest.UNSENT = originalXHR.UNSENT;
        window.XMLHttpRequest.OPENED = originalXHR.OPENED;
        window.XMLHttpRequest.HEADERS_RECEIVED = originalXHR.HEADERS_RECEIVED;
        window.XMLHttpRequest.LOADING = originalXHR.LOADING;
        window.XMLHttpRequest.DONE = originalXHR.DONE;
    }

    /**
     * Handle mixed content issues
     */
    handleMixedContent() {
        // Add meta tag for mixed content
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "upgrade-insecure-requests";
        document.head.appendChild(meta);
        
        // Force HTTPS for all requests in VK Android WebView
        if (this.isVKAndroidWebView) {
            this.forceHTTPS();
        }
    }

    /**
     * Force HTTPS for all requests
     */
    forceHTTPS() {
        // Override fetch to force HTTPS
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (typeof url === 'string' && url.startsWith('http://')) {
                const secureUrl = url.replace('http://', 'https://');
                console.log('🔧 WebViewConfig: Upgrading fetch to HTTPS:', secureUrl);
                return originalFetch(secureUrl, options);
            }
            return originalFetch(url, options);
        };
    }

    /**
     * Apply WebView-specific optimizations
     */
    applyWebViewOptimizations() {
        // Disable text selection for better mobile experience
        document.body.style.webkitUserSelect = 'none';
        document.body.style.userSelect = 'none';
        
        // Prevent zoom on double tap
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Setup error handling for WebView
     */
    setupErrorHandling() {
        // Global error handler for WebView
        window.addEventListener('error', (event) => {
            console.error('🔧 WebViewConfig: Global error caught:', event.error);
            
            // Handle WebSocket errors specifically
            if (event.error && event.error.message && 
                event.error.message.includes('websocket')) {
                console.log('🔧 WebViewConfig: WebSocket error detected, attempting recovery...');
                this.handleWebSocketError(event.error);
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🔧 WebViewConfig: Unhandled promise rejection:', event.reason);
        });
    }

    /**
     * Handle WebSocket errors
     */
    handleWebSocketError(error) {
        // Log the error for debugging
        console.error('🔧 WebViewConfig: WebSocket error details:', {
            message: error.message,
            type: error.type,
            stack: error.stack
        });
        
        // Emit a custom event for the NetworkManager to handle
        const customEvent = new CustomEvent('webview-websocket-error', {
            detail: { error: error }
        });
        window.dispatchEvent(customEvent);
    }

    /**
     * Get WebView configuration info
     */
    getConfigInfo() {
        return {
            isAndroidWebView: this.isAndroidWebView,
            isVKPlatform: this.isVKPlatform,
            isVKAndroidWebView: this.isVKAndroidWebView,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor
        };
    }

    /**
     * Check if special WebView handling is needed
     */
    needsWebViewHandling() {
        return this.isVKAndroidWebView;
    }
}

// Create and export instance
const webViewConfig = new WebViewConfig();

export default webViewConfig;
export { WebViewConfig }; 