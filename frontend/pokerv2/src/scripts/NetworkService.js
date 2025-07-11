class NetworkService {
    constructor() {
        this.ws = null;
        this.url = 'ws://i.mawazo.xyz:50202';
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.messageHandlers = new Map();
        this.connectionHandlers = [];
        this.disconnectionHandlers = [];
        this.errorHandlers = [];
        
        // Auto-connect on instantiation
        this.connect();
    }

    connect() {
        try {
            if (window.isDebug) {
                console.log(`[NetworkService] Connecting to ${this.url}...`);
            }

            this.ws = new WebSocket(this.url);

            this.ws.onopen = (event) => {
                this.connected = true;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
                
                if (window.isDebug) {
                    console.log('[NetworkService] Connected to server');
                }

                // Notify connection handlers
                this.connectionHandlers.forEach(handler => {
                    try {
                        handler(event);
                    } catch (error) {
                        console.error('[NetworkService] Error in connection handler:', error);
                    }
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    if (window.isDebug) {
                        console.warn('[NetworkService] Received non-JSON message:', event.data);
                    }
                    // Handle raw string messages
                    this.handleMessage({ type: 'raw', data: event.data });
                }
            };

            this.ws.onclose = (event) => {
                this.connected = false;
                
                if (window.isDebug) {
                    console.log('[NetworkService] Connection closed:', event.code, event.reason);
                }

                // Notify disconnection handlers
                this.disconnectionHandlers.forEach(handler => {
                    try {
                        handler(event);
                    } catch (error) {
                        console.error('[NetworkService] Error in disconnection handler:', error);
                    }
                });

                // Auto-reconnect if not a clean close
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnect();
                }
            };

            this.ws.onerror = (error) => {
                if (window.isDebug) {
                    console.error('[NetworkService] WebSocket error:', error);
                }

                // Notify error handlers
                this.errorHandlers.forEach(handler => {
                    try {
                        handler(error);
                    } catch (handlerError) {
                        console.error('[NetworkService] Error in error handler:', handlerError);
                    }
                });
            };

        } catch (error) {
            console.error('[NetworkService] Failed to create WebSocket connection:', error);
            this.reconnect();
        }
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[NetworkService] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        if (window.isDebug) {
            console.log(`[NetworkService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        }

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    handleMessage(data) {
        if (window.isDebug) {
            console.log('[NetworkService] Received message:', data);
        }

        const messageType = data.type || 'unknown';
        
        if (this.messageHandlers.has(messageType)) {
            const handlers = this.messageHandlers.get(messageType);
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[NetworkService] Error in message handler for type '${messageType}':`, error);
                }
            });
        } else if (window.isDebug) {
            console.log(`[NetworkService] No handlers registered for message type '${messageType}'`);
        }
    }

    // Send message to server
    send(data) {
        if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (window.isDebug) {
                console.warn('[NetworkService] Cannot send message: not connected');
            }
            return false;
        }

        try {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.ws.send(message);
            
            if (window.isDebug) {
                console.log('[NetworkService] Sent message:', data);
            }
            
            return true;
        } catch (error) {
            console.error('[NetworkService] Failed to send message:', error);
            return false;
        }
    }

    // Register handler for specific message types
    onMessage(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    // Remove handler for specific message type
    offMessage(type, handler) {
        if (this.messageHandlers.has(type)) {
            const handlers = this.messageHandlers.get(type);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Register connection event handlers
    onConnect(handler) {
        this.connectionHandlers.push(handler);
    }

    onDisconnect(handler) {
        this.disconnectionHandlers.push(handler);
    }

    onError(handler) {
        this.errorHandlers.push(handler);
    }

    // Manual disconnect
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Manual disconnect');
        }
    }

    // Get connection status
    isConnected() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    // Get WebSocket ready state
    getReadyState() {
        return this.ws ? this.ws.readyState : WebSocket.CLOSED;
    }
}

// Create and export singleton instance
const networkService = new NetworkService();

// Also make it globally accessible
window.NetworkService = networkService;

export default networkService; 