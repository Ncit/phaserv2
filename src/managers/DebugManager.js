/**
 * Debug Manager for Poker Game
 * Integrates with Eruda for mobile web debugging
 */
export class DebugManager {
    constructor() {
        // Import debug config
        this.debugConfig = null;
        this.loadDebugConfig();
        
        this.eruda = null;
        this.debugData = {
            network: {},
            game: {},
            performance: {},
            errors: []
        };
        
        this.init();
    }

    async loadDebugConfig() {
        try {
            const { default: DebugConfig } = await import('../config/DebugConfig.js');
            this.debugConfig = DebugConfig;
        } catch (error) {
            console.warn('DebugManager: Failed to load DebugConfig, using fallback');
            this.debugConfig = {
                isEnabled: () => true,
                isFeatureEnabled: () => true,
                isSecurityAllowed: () => true
            };
        }
    }

    shouldEnableDebug() {
        // Use debug config if available, otherwise fallback to basic check
        if (this.debugConfig) {
            return this.debugConfig.isEnabled();
        }
        
        // Fallback logic
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === 'nikmobdev.ru' ||
            window.location.hostname.includes('github.io') ||
            window.location.hostname.includes('vercel.app') ||
            window.location.hostname.includes('netlify.app') ||
            urlParams.get('debug') === 'true' ||
            hashParams.get('debug') === 'true' ||
            window.location.hash.includes('#debug') ||
            window.isDebug === true ||
            // Enable for all production environments
            true
        );
    }

    async init() {
        // Wait for debug config to load
        if (!this.debugConfig) {
            await this.loadDebugConfig();
        }
        
        this.isEnabled = this.shouldEnableDebug();
        
        if (!this.isEnabled) {
            console.log('DebugManager: Debug mode disabled');
            return;
        }

        try {
            // Initialize Eruda if available
            if (typeof eruda !== 'undefined') {
                this.eruda = eruda;
                this.setupEruda();
                console.log('DebugManager: Eruda initialized');
            } else {
                console.warn('DebugManager: Eruda not available, using console fallback');
            }

            // Setup global debug object
            this.setupGlobalDebug();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup error tracking
            this.setupErrorTracking();
            
            // Setup network monitoring
            this.setupNetworkMonitoring();
            
            console.log('DebugManager: Initialized successfully');
            
        } catch (error) {
            console.error('DebugManager: Initialization failed:', error);
        }
    }

    setupEruda() {
        if (!this.eruda) return;

        // Add custom panel for poker game debugging
        const pokerPanel = this.eruda.get('poker');
        
        // Network panel
        const networkPanel = this.eruda.get('network');
        
        // Performance panel
        const performancePanel = this.eruda.get('performance');
        
        // Game state panel
        const gameStatePanel = this.eruda.get('gameState');
        
        // Error panel
        const errorPanel = this.eruda.get('errors');
    }

    setupGlobalDebug() {
        // Make debug manager globally accessible
        window.debugManager = this;
        
                    // Add debug methods to global scope
            window.debug = {
                // Network debugging
                network: {
                    getStatus: () => this.getNetworkStatus(),
                    getLogs: () => this.getNetworkLogs(),
                    clearLogs: () => this.clearNetworkLogs(),
                    runDiagnostics: () => this.runNetworkDiagnostics(),
                    quickTest: () => this.quickNetworkTest()
                },
            
            // Game debugging
            game: {
                getState: () => this.getGameState(),
                getPlayers: () => this.getPlayers(),
                getCurrentPlayer: () => this.getCurrentPlayer(),
                forceAction: (action, amount) => this.forceGameAction(action, amount)
            },
            
            // Performance debugging
            performance: {
                getMetrics: () => this.getPerformanceMetrics(),
                startTimer: (name) => this.startTimer(name),
                endTimer: (name) => this.endTimer(name),
                getTimers: () => this.getTimers()
            },
            
            // Error debugging
            errors: {
                getErrors: () => this.getErrors(),
                clearErrors: () => this.clearErrors(),
                simulateError: () => this.simulateError()
            },
            
            // Utility methods
            utils: {
                reload: () => window.location.reload(),
                clearStorage: () => this.clearStorage(),
                exportData: () => this.exportDebugData(),
                importData: (data) => this.importDebugData(data)
            }
        };
    }

    setupPerformanceMonitoring() {
        this.timers = new Map();
        this.metrics = {
            fps: [],
            memory: [],
            loadTimes: {}
        };

        // Monitor FPS
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.metrics.fps.push({ time: currentTime, fps });
                
                // Keep only last 60 FPS measurements
                if (this.metrics.fps.length > 60) {
                    this.metrics.fps.shift();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        if (this.isEnabled) {
            requestAnimationFrame(measureFPS);
        }
    }

    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // Socket.IO error tracking
        if (window.socket) {
            window.socket.on('connect_error', (error) => {
                this.logError('Socket.IO Connection Error', error);
            });
            
            window.socket.on('error', (error) => {
                this.logError('Socket.IO Error', error);
            });
        }
    }

    setupNetworkMonitoring() {
        this.networkLogs = [];
        
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                
                this.logNetworkRequest({
                    type: 'fetch',
                    url,
                    method: args[1]?.method || 'GET',
                    status: response.status,
                    duration: endTime - startTime,
                    timestamp: Date.now()
                });
                
                return response;
            } catch (error) {
                const endTime = performance.now();
                
                this.logNetworkRequest({
                    type: 'fetch',
                    url,
                    method: args[1]?.method || 'GET',
                    status: 'error',
                    error: error.message,
                    duration: endTime - startTime,
                    timestamp: Date.now()
                });
                
                throw error;
            }
        };

        // Monitor WebSocket events
        if (window.socket) {
            const originalEmit = window.socket.emit;
            window.socket.emit = (...args) => {
                this.logNetworkRequest({
                    type: 'websocket',
                    event: args[0],
                    data: args[1],
                    direction: 'outgoing',
                    timestamp: Date.now()
                });
                
                return originalEmit.apply(window.socket, args);
            };
        }
    }

    // Network debugging methods
    logNetworkRequest(request) {
        this.networkLogs.push(request);
        
        // Keep only last 100 network logs
        if (this.networkLogs.length > 100) {
            this.networkLogs.shift();
        }
        
        // Update Eruda network panel
        if (this.eruda) {
            const networkPanel = this.eruda.get('network');
            if (networkPanel) {
                networkPanel.set(this.networkLogs);
            }
        }
    }

    // Network diagnostics methods
    async runNetworkDiagnostics() {
        try {
            const { default: networkDiagnostics } = await import('../utils/NetworkDiagnostics.js');
            return await networkDiagnostics.runDiagnostics();
        } catch (error) {
            console.error('Debug: Failed to run network diagnostics:', error);
            return null;
        }
    }

    async quickNetworkTest() {
        try {
            const { default: networkDiagnostics } = await import('../utils/NetworkDiagnostics.js');
            return await networkDiagnostics.quickTest();
        } catch (error) {
            console.error('Debug: Failed to run quick network test:', error);
            return null;
        }
    }

    getNetworkStatus() {
        if (!window.socket) return { connected: false };
        
        return {
            connected: window.socket.connected,
            id: window.socket.id,
            transport: window.socket.io.engine.transport.name,
            url: window.socket.io.uri
        };
    }

    getNetworkLogs() {
        return this.networkLogs;
    }

    clearNetworkLogs() {
        this.networkLogs = [];
        if (this.eruda) {
            const networkPanel = this.eruda.get('network');
            if (networkPanel) {
                networkPanel.set([]);
            }
        }
    }

    // Game debugging methods
    getGameState() {
        if (window.game && window.game.scene) {
            const currentScene = window.game.scene.scenes[window.game.scene.key];
            return {
                currentScene: currentScene ? currentScene.scene.key : null,
                gameState: window.gameState || null,
                players: window.players || []
            };
        }
        return null;
    }

    getPlayers() {
        return window.players || [];
    }

    getCurrentPlayer() {
        if (window.players) {
            return window.players.find(p => p.isCurrentPlayer);
        }
        return null;
    }

    forceGameAction(action, amount = 0) {
        // Check if force actions are allowed
        if (this.debugConfig && !this.debugConfig.isSecurityAllowed('allowForceActions')) {
            console.warn('Debug: Force actions are disabled in this environment');
            return;
        }
        
        if (window.socket && window.socket.connected) {
            console.log(`Debug: Forcing game action: ${action} ${amount}`);
            window.socket.emit('pokerAction', { action, amount });
        } else {
            console.error('Debug: Cannot force action - not connected to server');
        }
    }

    // Performance debugging methods
    startTimer(name) {
        this.timers.set(name, performance.now());
    }

    endTimer(name) {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.timers.delete(name);
            console.log(`Debug Timer [${name}]: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return null;
    }

    getTimers() {
        const activeTimers = {};
        for (const [name, startTime] of this.timers) {
            activeTimers[name] = performance.now() - startTime;
        }
        return activeTimers;
    }

    getPerformanceMetrics() {
        return {
            fps: this.metrics.fps,
            memory: this.metrics.memory,
            timers: this.getTimers(),
            loadTimes: this.metrics.loadTimes
        };
    }

    // Error debugging methods
    logError(type, error) {
        const errorEntry = {
            type,
            error,
            timestamp: Date.now(),
            stack: error?.stack || new Error().stack
        };
        
        this.debugData.errors.push(errorEntry);
        
        // Keep only last 50 errors
        if (this.debugData.errors.length > 50) {
            this.debugData.errors.shift();
        }
        
        // Update Eruda error panel
        if (this.eruda) {
            const errorPanel = this.eruda.get('errors');
            if (errorPanel) {
                errorPanel.set(this.debugData.errors);
            }
        }
        
        console.error(`Debug Error [${type}]:`, error);
    }

    getErrors() {
        return this.debugData.errors;
    }

    clearErrors() {
        this.debugData.errors = [];
        if (this.eruda) {
            const errorPanel = this.eruda.get('errors');
            if (errorPanel) {
                errorPanel.set([]);
            }
        }
    }

    simulateError() {
        // Check if error simulation is allowed
        if (this.debugConfig && !this.debugConfig.isSecurityAllowed('allowErrorSimulation')) {
            console.warn('Debug: Error simulation is disabled in this environment');
            return;
        }
        
        this.logError('Simulated Error', new Error('This is a simulated error for testing'));
    }

    // Utility methods
    clearStorage() {
        // Check if storage clearing is allowed
        if (this.debugConfig && !this.debugConfig.isSecurityAllowed('allowStorageClearing')) {
            console.warn('Debug: Storage clearing is disabled in this environment');
            return;
        }
        
        localStorage.clear();
        sessionStorage.clear();
        console.log('Debug: Storage cleared');
    }

    exportDebugData() {
        const data = {
            network: this.networkLogs,
            errors: this.debugData.errors,
            performance: this.metrics,
            gameState: this.getGameState(),
            timestamp: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `poker-debug-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importDebugData(data) {
        // Check if data import is allowed
        if (this.debugConfig && !this.debugConfig.isSecurityAllowed('allowDataImport')) {
            console.warn('Debug: Data import is disabled in this environment');
            return;
        }
        
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            
            if (parsed.network) this.networkLogs = parsed.network;
            if (parsed.errors) this.debugData.errors = parsed.errors;
            if (parsed.performance) this.metrics = parsed.performance;
            
            console.log('Debug: Data imported successfully');
        } catch (error) {
            console.error('Debug: Failed to import data:', error);
        }
    }

    // Public API
    enable() {
        this.isEnabled = true;
        this.init();
    }

    disable() {
        this.isEnabled = false;
        if (this.eruda) {
            this.eruda.destroy();
        }
    }

    isDebugEnabled() {
        return this.isEnabled;
    }

    // Cleanup
    cleanup() {
        this.disable();
        this.networkLogs = [];
        this.debugData.errors = [];
        this.timers.clear();
    }
}

// Auto-initialize debug manager
const debugManager = new DebugManager();
export default debugManager; 