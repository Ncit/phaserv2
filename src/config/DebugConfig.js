/**
 * Debug Configuration for Poker Game
 * Manages Eruda debugging settings across different environments
 */
export class DebugConfig {
    constructor() {
        this.config = {
            // Enable debug in all environments by default
            enabled: true,
            
            // Production domains where debug is allowed
            productionDomains: [
                'nikmobdev.ru',
                'github.io',
                'vercel.app',
                'netlify.app',
                'firebaseapp.com',
                'herokuapp.com'
            ],
            
            // Development domains
            developmentDomains: [
                'localhost',
                '127.0.0.1',
                '0.0.0.0'
            ],
            
            // Debug features configuration
            features: {
                network: true,      // Network monitoring
                console: true,      // Console logging
                errors: true,       // Error tracking
                performance: true,  // Performance monitoring
                game: true,         // Game state debugging
                elements: true,     // DOM inspection
                resources: true,    // Storage inspection
                info: true,         // Device info
                snippets: true      // Code snippets
            },
            
            // Performance settings
            performance: {
                fpsMonitoring: true,
                memoryMonitoring: true,
                networkLogging: true,
                errorLogging: true,
                maxLogEntries: 100
            },
            
            // Security settings for production
            security: {
                allowForceActions: false,  // Disable force actions in production
                allowErrorSimulation: false, // Disable error simulation in production
                allowStorageClearing: false, // Disable storage clearing in production
                allowDataExport: true,     // Allow debug data export
                allowDataImport: false     // Disable debug data import in production
            }
        };
        
        this.init();
    }
    
    init() {
        // Override config based on environment
        this.detectEnvironment();
        this.applyEnvironmentSettings();
    }
    
    detectEnvironment() {
        const hostname = window.location.hostname;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Check if we're in development
        this.isDevelopment = this.config.developmentDomains.some(domain => 
            hostname.includes(domain)
        );
        
        // Check if we're in production
        this.isProduction = this.config.productionDomains.some(domain => 
            hostname.includes(domain)
        );
        
        // Check debug flags
        this.hasDebugFlag = (
            urlParams.get('debug') === 'true' ||
            hashParams.get('debug') === 'true' ||
            window.location.hash.includes('#debug') ||
            window.isDebug === true
        );
        
        // Check if debug should be disabled
        this.shouldDisable = (
            urlParams.get('debug') === 'false' ||
            hashParams.get('debug') === 'false' ||
            window.location.hash.includes('#nodebug') ||
            window.isDebug === false
        );
    }
    
    applyEnvironmentSettings() {
        if (this.shouldDisable) {
            this.config.enabled = false;
            return;
        }
        
        if (this.isDevelopment) {
            // Development settings - full debug capabilities
            this.config.security.allowForceActions = true;
            this.config.security.allowErrorSimulation = true;
            this.config.security.allowStorageClearing = true;
            this.config.security.allowDataImport = true;
            this.config.performance.maxLogEntries = 200;
        } else if (this.isProduction) {
            // Production settings - limited debug capabilities
            this.config.security.allowForceActions = false;
            this.config.security.allowErrorSimulation = false;
            this.config.security.allowStorageClearing = false;
            this.config.security.allowDataImport = false;
            this.config.performance.maxLogEntries = 50;
        }
        
        // Override with debug flags
        if (this.hasDebugFlag) {
            this.config.enabled = true;
            // Enable all features when debug flag is present
            Object.keys(this.config.features).forEach(key => {
                this.config.features[key] = true;
            });
            // Enable all security features when debug flag is present
            Object.keys(this.config.security).forEach(key => {
                this.config.security[key] = true;
            });
        }
    }
    
    // Public API methods
    isEnabled() {
        return this.config.enabled;
    }
    
    isFeatureEnabled(feature) {
        return this.config.enabled && this.config.features[feature];
    }
    
    isSecurityAllowed(action) {
        return this.config.security[action];
    }
    
    getPerformanceConfig() {
        return this.config.performance;
    }
    
    getEnvironment() {
        return {
            isDevelopment: this.isDevelopment,
            isProduction: this.isProduction,
            hasDebugFlag: this.hasDebugFlag,
            shouldDisable: this.shouldDisable
        };
    }
    
    // Configuration management
    enable() {
        this.config.enabled = true;
    }
    
    disable() {
        this.config.enabled = false;
    }
    
    enableFeature(feature) {
        if (this.config.features.hasOwnProperty(feature)) {
            this.config.features[feature] = true;
        }
    }
    
    disableFeature(feature) {
        if (this.config.features.hasOwnProperty(feature)) {
            this.config.features[feature] = false;
        }
    }
    
    allowSecurityAction(action) {
        if (this.config.security.hasOwnProperty(action)) {
            this.config.security[action] = true;
        }
    }
    
    denySecurityAction(action) {
        if (this.config.security.hasOwnProperty(action)) {
            this.config.security[action] = false;
        }
    }
    
    // Utility methods
    getConfig() {
        return {
            ...this.config,
            environment: this.getEnvironment()
        };
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.applyEnvironmentSettings();
    }
}

// Create and export singleton instance
const debugConfig = new DebugConfig();
export default debugConfig; 