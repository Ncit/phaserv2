/**
 * DebugManager - Handles debug logging and performance monitoring
 */
export class DebugManager {
    constructor() {
        this.debugEnabled = false;
        this.timers = new Map();
        this.logs = [];
        
        // Enable debug mode based on URL parameter or localStorage
        this.checkDebugMode();
    }

    checkDebugMode() {
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') {
            this.debugEnabled = true;
            localStorage.setItem('poker_debug', 'true');
            return;
        }

        // Check localStorage
        if (localStorage.getItem('poker_debug') === 'true') {
            this.debugEnabled = true;
            return;
        }

        // Check if we're in development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost')) {
            this.debugEnabled = true;
        }
    }

    isDebugEnabled() {
        return this.debugEnabled;
    }

    enableDebug() {
        this.debugEnabled = true;
        localStorage.setItem('poker_debug', 'true');
        console.log('🎮 Poker Debug Mode: ENABLED');
    }

    disableDebug() {
        this.debugEnabled = false;
        localStorage.removeItem('poker_debug');
        console.log('🎮 Poker Debug Mode: DISABLED');
    }

    startTimer(name) {
        if (!this.debugEnabled) return;
        
        this.timers.set(name, {
            start: performance.now(),
            name: name
        });
        
        console.log(`⏱️ Timer started: ${name}`);
    }

    endTimer(name) {
        if (!this.debugEnabled) return 0;
        
        const timer = this.timers.get(name);
        if (!timer) {
            console.warn(`⚠️ Timer '${name}' not found`);
            return 0;
        }
        
        const duration = performance.now() - timer.start;
        this.timers.delete(name);
        
        console.log(`⏱️ Timer ended: ${name} - ${duration.toFixed(2)}ms`);
        return duration;
    }

    logNetworkRequest(data) {
        if (!this.debugEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'network',
            ...data
        };
        
        this.logs.push(logEntry);
        
        console.group(`🌐 Network Request: ${data.type || 'Unknown'}`);
        console.log('Data:', data);
        console.log('Timestamp:', logEntry.timestamp);
        console.groupEnd();
    }

    logError(message, error) {
        if (!this.debugEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'error',
            message: message,
            error: error
        };
        
        this.logs.push(logEntry);
        
        console.group(`❌ Error: ${message}`);
        console.error('Error details:', error);
        console.log('Timestamp:', logEntry.timestamp);
        console.groupEnd();
    }

    logInfo(message, data = null) {
        if (!this.debugEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'info',
            message: message,
            data: data
        };
        
        this.logs.push(logEntry);
        
        console.log(`ℹ️ ${message}`, data || '');
    }

    logWarning(message, data = null) {
        if (!this.debugEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'warning',
            message: message,
            data: data
        };
        
        this.logs.push(logEntry);
        
        console.warn(`⚠️ ${message}`, data || '');
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
        console.log('🗑️ Debug logs cleared');
    }

    exportLogs() {
        const logsJson = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `poker-debug-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📁 Debug logs exported');
    }

    // Add debug controls to the page
    addDebugUI() {
        if (!this.debugEnabled) return;
        
        const debugPanel = document.createElement('div');
        debugPanel.id = 'poker-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-width: 300px;
        `;
        
        debugPanel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">🎮 Poker Debug</div>
            <button onclick="debugManager.clearLogs()" style="margin-right: 5px;">Clear Logs</button>
            <button onclick="debugManager.exportLogs()" style="margin-right: 5px;">Export</button>
            <button onclick="debugManager.disableDebug(); location.reload();">Disable</button>
            <div style="margin-top: 10px; font-size: 10px;">
                Logs: ${this.logs.length} | Timers: ${this.timers.size}
            </div>
        `;
        
        document.body.appendChild(debugPanel);
    }
}

// Create and export a singleton instance
const debugManager = new DebugManager();

// Make it globally available for browser console access
if (typeof window !== 'undefined') {
    window.debugManager = debugManager;
}

export default debugManager;