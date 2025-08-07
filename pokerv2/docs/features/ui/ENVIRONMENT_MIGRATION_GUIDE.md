# Environment Configuration Migration Guide

## Overview

The poker game has been refactored to use a scalable environment configuration system that replaces the simple `window.isDebug` approach. This new system provides better organization, feature flags, and environment-specific settings.

## What Changed

### Before (Old System)
```javascript
// Simple boolean flag
window.isDebug = true; // or false

// Usage throughout codebase
if (window.isDebug) {
    // debug code
}
```

### After (New System)
```javascript
// Comprehensive environment configuration
window.gameConfig = {
    environment: 'development',
    debug: true,
    features: {
        playerSelection: true,
        debugLogging: true,
        mockData: true,

        verboseErrors: true
    },
    api: {
        baseUrl: 'http://localhost:3000',
        timeout: 5000
    }
};

// Usage with feature flags
if (window.gameConfig.isFeatureEnabled('debugLogging')) {
    // debug code
}
```

## Environment Detection

The system automatically detects the environment based on:

1. **Explicit setting**: `window.GAME_ENVIRONMENT = 'production'`
2. **URL parameter**: `?env=staging`
3. **Hostname**: 
   - `localhost` → development
   - `staging.example.com` → staging
   - `app.example.com` → production
4. **Legacy fallback**: `window.isDebug` → development/production
5. **Default**: development (for safety)

## Available Environments

### Development
- **Debug**: true
- **Features**: All debug features enabled
- **API**: Local development server
- **Use case**: Local development and testing

### Staging
- **Debug**: false
- **Features**: Debug logging enabled, mock data disabled
- **API**: Staging server
- **Use case**: Pre-production testing

### Production
- **Debug**: false
- **Features**: All debug features disabled
- **API**: Production server
- **Use case**: Live production environment

### Test
- **Debug**: true
- **API**: Local test server
- **Use case**: Automated testing

## Feature Flags

The new system uses feature flags for better control:

- `playerSelection`: Show debug player selection screen
- `debugLogging`: Enable console logging and debug information
- `mockData`: Use mock data instead of real API calls

- `verboseErrors`: Show detailed error messages

## Migration Steps

### 1. Update Environment Detection

**Old way:**
```javascript
if (window.isDebug) {
    // debug code
}
```

**New way:**
```javascript
if (window.gameConfig && window.gameConfig.isFeatureEnabled('debugLogging')) {
    // debug code
}
```

### 2. Use Environment-Specific Features

**Old way:**
```javascript
const apiUrl = window.isDebug ? 'http://localhost:3000' : 'https://api.example.com';
```

**New way:**
```javascript
const apiConfig = window.gameConfig.getApiConfig();
const apiUrl = apiConfig.baseUrl;
```

### 3. Check Environment Type

**Old way:**
```javascript
const isDev = window.isDebug;
```

**New way:**
```javascript
const isDev = window.gameConfig.isDevelopment();
const isProd = window.gameConfig.isProduction();
const isStaging = window.gameConfig.isStaging();
```

## Backward Compatibility

The new system maintains backward compatibility:

- `window.isDebug` is still set for legacy code
- Existing code will continue to work
- Gradual migration is supported

## Environment Override

You can override the environment for testing:

```javascript
// In browser console
window.gameConfig.setEnvironment('production');

// Or set before game loads
window.GAME_ENVIRONMENT = 'staging';
```

## URL-Based Environment Switching

You can switch environments via URL parameters:

- `http://localhost:3000?env=production`
- `http://localhost:3000?env=staging`
- `http://localhost:3000?env=test`

## Benefits of the New System

1. **Scalable**: Easy to add new environments and features
2. **Organized**: Clear separation of concerns
3. **Flexible**: Feature flags for granular control
4. **Maintainable**: Centralized configuration
5. **Testable**: Easy to override for testing
6. **Production-ready**: Proper environment detection

## Troubleshooting

### Environment Not Detected Correctly
```javascript
// Check current environment
console.log(window.gameConfig.getEnvironment());

// Check available environments
console.log(window.gameConfig.getAvailableEnvironments());

// Override environment
window.gameConfig.setEnvironment('development');
```

### Feature Flag Not Working
```javascript
// Check if feature is enabled
console.log(window.gameConfig.isFeatureEnabled('debugLogging'));

// Check all features
console.log(window.gameConfig.features);
```

### Legacy Code Issues
```javascript
// Ensure backward compatibility
if (window.isDebug !== undefined) {
    // Legacy code path
} else if (window.gameConfig) {
    // New code path
    window.isDebug = window.gameConfig.debug;
}
``` 