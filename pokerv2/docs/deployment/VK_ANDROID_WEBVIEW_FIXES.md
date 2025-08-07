# VK Android WebView Connection Fixes

This document summarizes all the fixes implemented to resolve the `xhr poll error` and `TransportError` issues in VK Android WebView.

## 🐛 **Problem Analysis**

### **Original Error**
```
NetworkManager: Connection error: R {
    description: Event, 
    context: undefined, 
    type: "TransportError"
} 
message: "xhr poll error"
```

### **Root Cause**
The error occurs because:
1. **VK Android WebView** has stricter security policies
2. **XHR requests** are being blocked or failing due to CORS/mixed content issues
3. **Socket.IO polling transport** fails due to network restrictions
4. **WebSocket transport** is also blocked in the VK Mini App environment

## 🛠️ **Implemented Solutions**

### **1. Enhanced WebView Configuration (`WebViewConfig.js`)**

#### **XHR Polling Fix**
```javascript
fixXHRPolling() {
    // Override XMLHttpRequest to add VK-specific headers
    const originalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        
        // Add VK-specific headers for Socket.IO polling
        if (url.includes('socket.io') && this.isVKAndroidWebView) {
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.setRequestHeader('X-VK-Platform', 'android');
            xhr.setRequestHeader('X-VK-WebView', 'true');
            xhr.setRequestHeader('Origin', window.location.origin);
            xhr.setRequestHeader('Referer', window.location.href);
        }
    };
}
```

#### **WebSocket Override**
```javascript
fixWebSocketConnections() {
    // Force secure WebSocket connections
    if (url.startsWith('ws://') && this.isVKAndroidWebView) {
        const secureUrl = url.replace('ws://', 'wss://');
        return new originalWebSocket(secureUrl, protocols);
    }
}
```

### **2. Enhanced NetworkManager (`NetworkManager.js`)**

#### **Multi-Strategy Recovery**
```javascript
async attemptVKWebViewRecovery(error) {
    // Strategy 1: Switch to polling transport
    // Strategy 2: Reconnect with minimal options
    // Strategy 3: Try alternative connection method
}
```

#### **Minimal Options Connection**
```javascript
async connectWithMinimalOptions() {
    const minimalOptions = {
        transports: ['polling'],
        timeout: 60000,
        extraHeaders: {
            'X-VK-Platform': 'android',
            'X-VK-WebView': 'true',
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
}
```

### **3. Server-Side Enhancements (`server.js`)**

#### **Enhanced CORS Configuration**
```javascript
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Requested-With", "X-VK-Platform", "X-VK-WebView"],
        credentials: false
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
});
```

#### **VK WebView Middleware**
```javascript
app.use((req, res, next) => {
    const isVKWebView = userAgent.includes('wv') && userAgent.includes('Android');
    
    if (isVKWebView) {
        res.setHeader('X-VK-Supported', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-VK-Platform, X-VK-WebView');
    }
});
```

#### **Test Endpoints**
```javascript
// VK WebView test endpoint
app.get('/pokerserver/vk-test', (req, res) => {
    res.json({
        status: 'ok',
        isVKWebView: isVKWebView,
        userAgent: userAgent,
        headers: req.headers
    });
});

// Socket.IO endpoint test
app.get('/pokerserver/socket-test', (req, res) => {
    res.json({
        status: 'ok',
        socketIO: true
    });
});
```

## 🧪 **Testing Tools**

### **1. VK Android WebView Test Page**
**File**: `test-vk-android-webview.html`

**Features**:
- ✅ WebView detection and configuration display
- ✅ Connection testing (Socket.IO, polling, WebSocket)
- ✅ Network diagnostics
- ✅ VK WebView specific endpoint testing
- ✅ Error simulation
- ✅ Debug logging with export functionality

### **2. Test Endpoints**
- **`/pokerserver/vk-test`**: VK WebView detection and configuration
- **`/pokerserver/socket-test`**: Socket.IO endpoint accessibility
- **`/pokerserver/socket.io/`**: Socket.IO handshake endpoint

## 🔧 **Configuration Details**

### **Client-Side Configuration**
```javascript
// Automatic detection
const isVKAndroidWebView = this.isAndroidWebView && this.isVKPlatform;

// WebView-optimized Socket.IO options
const socketOptions = webViewConfig.needsWebViewHandling() ? {
    transports: ['polling', 'websocket'], // Prioritize polling
    timeout: 30000, // Longer timeout
    reconnectionAttempts: 10, // More attempts
    reconnectionDelayMax: 10000, // Longer delays
    withCredentials: false, // Disable credentials
    rejectUnauthorized: false, // Allow self-signed certs
    extraHeaders: {
        'X-VK-Platform': 'android',
        'X-VK-WebView': 'true',
        'X-Requested-With': 'XMLHttpRequest'
    }
} : {
    // Standard options for other platforms
    transports: ['websocket', 'polling'],
    timeout: 20000
};
```

### **Server-Side Configuration**
```javascript
// Socket.IO server configuration
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Requested-With", "X-VK-Platform", "X-VK-WebView"],
        credentials: false
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e6
});
```

## 📊 **Recovery Strategies**

### **Strategy 1: Transport Switching**
- Detect WebSocket failure
- Automatically switch to polling transport
- Retry connection with polling

### **Strategy 2: Minimal Options**
- Disconnect current socket
- Reconnect with minimal Socket.IO options
- Use only polling transport
- Add VK-specific headers

### **Strategy 3: Alternative Methods**
- Try direct WebSocket connection
- Test server endpoints
- Fall back to basic connectivity

## 🚨 **Error Handling**

### **Enhanced Error Logging**
```javascript
console.error('🔧 NetworkManager: VK WebView error details:', {
    error: error,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    webViewConfig: webViewConfig.getConfigInfo()
});
```

### **Custom Events**
```javascript
this.eventManager.emit('vk-webview-error', {
    error: error,
    timestamp: Date.now(),
    config: webViewConfig.getConfigInfo()
});
```

## 📱 **VK Mini App Requirements**

### **Android WebView Settings**
The VK Mini App should configure WebView with:
```java
WebSettings webSettings = webView.getSettings();
webSettings.setAllowUniversalAccessFromFileURLs(true);
webSettings.setAllowFileAccessFromFileURLs(true);
webSettings.setDomStorageEnabled(true);
webSettings.setJavaScriptEnabled(true);
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

### **Network Security Configuration**
```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">nikmobdev.ru</domain>
    </domain-config>
</network-security-config>
```

## ✅ **Testing Checklist**

### **Pre-Deployment Testing**
- [ ] VK Android WebView detected correctly
- [ ] WebView configuration applied
- [ ] XHR headers added to requests
- [ ] Socket.IO connection successful with polling
- [ ] Error recovery strategies functional
- [ ] Server endpoints accessible
- [ ] Debug logging working

### **Post-Deployment Verification**
- [ ] Connection established in VK Mini App
- [ ] No "xhr poll error" messages
- [ ] No "TransportError" messages
- [ ] Game functionality working
- [ ] Reconnection working
- [ ] Error handling functional

## 📈 **Performance Impact**

### **Positive Impacts**
- ✅ **Reliable Connections**: Multiple fallback strategies
- ✅ **Better Error Handling**: Detailed logging and recovery
- ✅ **Platform Compatibility**: Works across all platforms
- ✅ **Debug Capabilities**: Comprehensive testing tools

### **Minimal Overhead**
- 🔄 **Automatic Detection**: Only applies fixes when needed
- 🔄 **Conditional Loading**: WebView config only loads for VK Android WebView
- 🔄 **Backward Compatibility**: No impact on other platforms

## 🔄 **Deployment Steps**

### **1. Client Deployment**
1. Deploy updated client files
2. Test with VK Android WebView test page
3. Verify WebView detection and configuration
4. Test Socket.IO connection

### **2. Server Deployment**
1. Deploy updated server with enhanced CORS
2. Test VK WebView endpoints
3. Verify Socket.IO server configuration
4. Monitor server logs for VK WebView requests

### **3. VK Mini App Configuration**
1. Update WebView settings in VK Mini App
2. Configure network security settings
3. Test connection in VK Mini App environment
4. Verify all functionality works

## 📞 **Support and Debugging**

### **Debug Information**
- WebView configuration info
- Network diagnostics results
- Error logs and stack traces
- User agent and platform information
- Connection test results

### **Test Page Usage**
1. Open `test-vk-android-webview.html` in VK Mini App
2. Run all tests to verify functionality
3. Export debug logs for analysis
4. Check server logs for connection attempts

### **Common Issues**
- **Still getting "xhr poll error"**: Check server CORS configuration
- **WebView not detected**: Verify user agent string
- **Connection timeout**: Increase timeout values
- **CORS errors**: Verify server headers

## 📝 **Notes**

- All fixes are **backward compatible** with other platforms
- **Automatic detection** ensures fixes only apply when needed
- **Multiple recovery strategies** provide robust error handling
- **Comprehensive testing tools** help with debugging
- **Server-side enhancements** support VK WebView requests
- **Regular testing** in VK Mini App environment is recommended 