// Production Configuration Override
window.PRODUCTION_CONFIG = {
    serverUrl: 'http://176.108.242.121:3000',
    environment: 'production',
    debug: false,
    features: {
        debugLogging: false,
        playerSelection: false,
        mockData: false,
        developmentTools: false
    }
};

// Override environment detection for production
window.isDebug = false;
window.gameConfig = {
    environment: 'production',
    debug: false,
    features: window.PRODUCTION_CONFIG.features
};
