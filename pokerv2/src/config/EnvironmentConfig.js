/**
 * Environment Configuration System
 * Provides scalable environment management for different deployment scenarios
 */

class EnvironmentConfig {
    constructor() {
        this.environments = {
            development: {
                name: 'development',
                debug: true,
                features: {
                    playerSelection: true,
                    debugLogging: true,
                    mockData: true,
                    ngrokHeaders: true,
                    verboseErrors: true
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    timeout: 15000
                }
            },
            productionVK: {
                name: 'vk',
                debug: false,
                features: {
                    playerSelection: false,
                    debugLogging: false,
                    mockData: false,
                    ngrokHeaders: true,
                    verboseErrors: false
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    timeout: 15000
                }
            }
        };

        this.currentEnvironment = this.detectEnvironment();
        this.config = this.environments[this.currentEnvironment];
        
        // Initialize global configuration
        this.initializeGlobalConfig();
    }

    /**
     * Detect the current environment based on various indicators
     */
    detectEnvironment() {
        // // Check for explicit environment setting
        // if (window.GAME_ENVIRONMENT) {
        //     return window.GAME_ENVIRONMENT;
        // }

        // // Check URL parameters
        // const urlParams = new URLSearchParams(window.location.search);
        // if (urlParams.has('env')) {
        //     return urlParams.get('env');
        // }

        // // Check hostname
        // const hostname = window.location.hostname;
        // if (hostname === 'localhost' || hostname === '127.0.0.1') {
        //     return 'development';
        // }

        // if (hostname.includes('production') || hostname.includes('app')) {
        //     return 'production';
        // }

        // // Check for legacy window.isDebug setting
        // if (window.isDebug !== undefined) {
        //     return window.isDebug ? 'development' : 'production';
        // }

        // // Default to development for safety
        return 'development';
        // return 'productionVK';
    }

    /**
     * Initialize global configuration accessible throughout the app
     */
    initializeGlobalConfig() {
        // Set legacy compatibility
        window.isDebug = this.config.debug;
        
        // Set new global config object
        window.gameConfig = {
            environment: this.currentEnvironment,
            debug: this.config.debug,
            features: this.config.features,
            api: this.config.api,
            isFeatureEnabled: (featureName) => this.isFeatureEnabled(featureName),
            getApiConfig: () => this.getApiConfig(),
            getEnvironment: () => this.currentEnvironment,
            isDevelopment: () => this.currentEnvironment === 'development',
            isProductionVK: () => this.currentEnvironment === 'productionVK',
        };

        // Log environment detection
        if (this.config.debug) {
            console.log(`🎮 Game Environment: ${this.currentEnvironment}`);
            console.log(`🔧 Debug Mode: ${this.config.debug}`);
            console.log(`⚙️ Features:`, this.config.features);
        }
    }

    /**
     * Check if a specific feature is enabled
     */
    isFeatureEnabled(featureName) {
        return this.config.features[featureName] || false;
    }

    /**
     * Get API configuration
     */
    getApiConfig() {
        return this.config.api;
    }

    /**
     * Get current environment name
     */
    getEnvironment() {
        return this.currentEnvironment;
    }

    /**
     * Check if current environment is development
     */
    isDevelopment() {
        return this.currentEnvironment === 'development';
    }

    /**
     * Check if current environment is production
     */
    isProductionVK() {
        return this.currentEnvironment === 'productionVK';
    }

    /**
     * Override environment (useful for testing)
     */
    setEnvironment(environmentName) {
        if (this.environments[environmentName]) {
            this.currentEnvironment = environmentName;
            this.config = this.environments[environmentName];
            this.initializeGlobalConfig();
            console.log(`🔄 Environment changed to: ${environmentName}`);
        } else {
            console.error(`❌ Invalid environment: ${environmentName}`);
        }
    }

    /**
     * Get all available environments
     */
    getAvailableEnvironments() {
        return Object.keys(this.environments);
    }

    /**
     * Get full configuration for current environment
     */
    getConfig() {
        return this.config;
    }

    /**
     * Legacy compatibility method
     */
    isDebug() {
        return this.config.debug;
    }
}

// Export the class itself
export { EnvironmentConfig };

// Create and export singleton instance
const environmentConfig = new EnvironmentConfig();

// Export singleton instance as default
export default environmentConfig;

// Also export individual methods for convenience
export const isFeatureEnabled = (featureName) => environmentConfig.isFeatureEnabled(featureName);
export const getApiConfig = () => environmentConfig.getApiConfig();
export const getEnvironment = () => environmentConfig.getEnvironment();
export const isDevelopment = () => environmentConfig.isDevelopment();
export const isProductionVK = () => environmentConfig.isProductionVK();