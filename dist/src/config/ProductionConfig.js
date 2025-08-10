/**
 * Production Configuration
 * Configuration for production deployment on remote server
 */

export const ProductionConfig = {
    // Server configuration
    server: {
        host: '176.108.242.121',
        port: 3000,
        protocol: 'http',
        url: 'http://176.108.242.121:3000'
    },
    
    // Client configuration
    client: {
        domain: 'nikmobdev.ru',
        path: 'winlinepoker',
        fullUrl: 'https://nikmobdev.ru/winlinepoker'
    },
    
    // Game configuration
    game: {
        maxPlayers: 6,
        startingChips: 1000,
        smallBlind: 10,
        bigBlind: 20,
        timeouts: {
            action: 30000,
            connection: 10000
        }
    },
    
    // Network configuration
    network: {
        reconnectAttempts: 5,
        reconnectDelay: 2000,
        connectionTimeout: 20000,
        heartbeatInterval: 30000
    },
    
    // Feature flags
    features: {
        debugMode: false,
        verboseLogging: false,
        playerSelection: false,
        mockData: false,
        developmentTools: false
    },
    
    // Security
    security: {
        corsEnabled: true,
        allowedOrigins: ['*'],
        rateLimiting: true,
        maxRequestsPerMinute: 100
    }
};

export default ProductionConfig; 