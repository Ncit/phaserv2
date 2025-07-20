# Ngrok Headers Implementation

This document explains how ngrok headers are implemented in the poker game to bypass ngrok's browser warning.

## Overview

The application automatically adds the `ngrok-skip-browser-warning: 69420` header to all network requests to bypass ngrok's browser warning page when accessing the application through an ngrok tunnel.

## Implementation Details

### 1. NgrokUtils.js
Located at `client/src/utils/NgrokUtils.js`, this utility file provides:

- **`fetchWithNgrokHeaders(url, options)`** - Makes fetch requests with ngrok headers
- **`getNgrokHeaders()`** - Returns the ngrok headers object
- **`addNgrokHeaders(headers)`** - Adds ngrok headers to existing headers
- **`createSocketOptionsWithNgrokHeaders(options)`** - Creates Socket.IO options with ngrok headers
- **`enableGlobalNgrokHeaders()`** - Overrides global fetch to automatically include ngrok headers
- **`disableGlobalNgrokHeaders()`** - Restores original fetch function

### 2. NetworkManager.js
Updated to use ngrok headers for Socket.IO connections:

```javascript
import { createSocketOptionsWithNgrokHeaders } from '../utils/NgrokUtils.js';

// Socket.IO connection with ngrok headers
const socketOptions = createSocketOptionsWithNgrokHeaders({
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: this.maxReconnectAttempts,
    reconnectionDelay: this.reconnectDelay
});

this.socket = io(this.serverUrl, socketOptions);
```

### 3. Global Fetch Override
In `client/src/main.js`, global ngrok headers are enabled for all fetch requests:

```javascript
import { enableGlobalNgrokHeaders } from './utils/NgrokUtils.js';

// Enable ngrok headers for all network requests
enableGlobalNgrokHeaders();
```

## Usage Examples

### Socket.IO Connection
```javascript
import { createSocketOptionsWithNgrokHeaders } from './utils/NgrokUtils.js';

const socketOptions = createSocketOptionsWithNgrokHeaders({
    transports: ['websocket', 'polling']
});

const socket = io('https://your-ngrok-url.ngrok.io', socketOptions);
```

### Fetch Request
```javascript
import { fetchWithNgrokHeaders } from './utils/NgrokUtils.js';

// Manual fetch with headers
const response = await fetchWithNgrokHeaders('https://your-ngrok-url.ngrok.io/api/game');

// Or use global override (automatic)
const response = await fetch('https://your-ngrok-url.ngrok.io/api/game');
```

### Manual Headers
```javascript
import { getNgrokHeaders } from './utils/NgrokUtils.js';

const headers = getNgrokHeaders();
// Returns: { 'ngrok-skip-browser-warning': '69420' }
```

## Testing

Use the test file `test-ngrok-headers.html` to verify that ngrok headers are working:

1. Start your server: `cd pokerv2/server && npm start`
2. Open `test-ngrok-headers.html` in your browser
3. Click the test buttons to verify:
   - Socket.IO connections with headers
   - Fetch requests with headers
   - Global header override status

## How It Works

### 1. Socket.IO Headers
When creating a Socket.IO connection, the `extraHeaders` option is used to add the ngrok header:

```javascript
{
    extraHeaders: {
        'ngrok-skip-browser-warning': '69420'
    }
}
```

### 2. Fetch Headers
For fetch requests, the header is added to the request headers:

```javascript
{
    headers: {
        'ngrok-skip-browser-warning': '69420',
        // ... other headers
    }
}
```

### 3. Global Override
The global fetch function is overridden to automatically include ngrok headers in all fetch requests:

```javascript
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    const fetchOptions = {
        ...options,
        headers: {
            'ngrok-skip-browser-warning': '69420',
            ...options.headers
        }
    };
    return originalFetch(url, fetchOptions);
};
```

## Benefits

1. **Automatic**: No need to manually add headers to each request
2. **Comprehensive**: Covers both Socket.IO and fetch requests
3. **Flexible**: Can be enabled/disabled as needed
4. **Testable**: Includes test utilities to verify functionality

## Troubleshooting

### Headers Not Working
1. Check that `enableGlobalNgrokHeaders()` is called in `main.js`
2. Verify the test file shows headers are enabled
3. Check browser network tab to see if headers are being sent

### Socket.IO Connection Issues
1. Ensure `createSocketOptionsWithNgrokHeaders()` is used
2. Check that the ngrok URL is correct
3. Verify the server is running and accessible

### Fetch Request Issues
1. Check if global override is enabled
2. Use `fetchWithNgrokHeaders()` for manual control
3. Verify the request URL is correct

## Security Note

The ngrok header bypasses ngrok's browser warning, which is intended for development and testing. In production, you should use proper domain names and SSL certificates instead of ngrok tunnels.

## Files Modified

- `client/src/utils/NgrokUtils.js` - New utility file
- `client/src/managers/NetworkManager.js` - Updated to use ngrok headers
- `client/src/main.js` - Added global header enablement
- `test-ngrok-headers.html` - Test file for verification 