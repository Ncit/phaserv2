# VK Android WebView Connection Guide

This guide addresses the specific WebSocket connection issues that occur in VK Mini App when running on Android WebView.

## 🐛 **Problem Description**

The error `NetworkManager: Connection error: R {description: Event, context: undefined, type: "TransportError"} message: "websocket error"` occurs specifically in:
- **Platform**: VK Mini App
- **Environment**: Android WebView
- **Issue**: WebSocket transport failures and mixed content problems

## 🔍 **Root Causes**

### **1. Android WebView Security Restrictions**
- WebView has stricter security policies than regular browsers
- Mixed content (HTTP/HTTPS) is blocked by default
- WebSocket connections may be restricted

### **2. VK Platform Specific Issues**
- VK Mini App runs in a sandboxed environment
- Additional security layers may interfere with WebSocket connections
- Platform-specific headers and configurations

### **3. Transport Layer Problems**
- WebSocket transport may fail due to proxy/firewall restrictions
- Polling transport may be blocked by CORS policies
- Connection timeouts due to network restrictions

## 🛠️ **Solutions Implemented**

### **1. WebView Configuration (`WebViewConfig.js`)**

The `WebViewConfig` class automatically detects VK Android WebView and applies special configurations:

```javascript
// Automatic detection
const isVKAndroidWebView = this.isAndroidWebView && this.isVKPlatform;

// Special handling for VK Android WebView
if (this.isVKAndroidWebView) {
    this.applyVKAndroidWebViewConfig();
}
```

**Features:**
- **WebSocket Override**: Forces secure WebSocket connections
- **Mixed Content Handling**: Automatically upgrades HTTP to HTTPS
- **Transport Optimization**: Prioritizes polling over WebSocket
- **Error Recovery**: Automatic fallback mechanisms

### **2. NetworkManager Enhancements**

Enhanced Socket.IO configuration for VK Android WebView:

```javascript
// WebView-optimized socket options
const socketOptions = webViewConfig.needsWebViewHandling() ? {
    transports: ['polling', 'websocket'], // Prioritize polling
    timeout: 30000, // Longer timeout
    reconnectionAttempts: 10, // More attempts
    reconnectionDelayMax: 10000, // Longer delays
    withCredentials: false, // Disable credentials
    rejectUnauthorized: false // Allow self-signed certs
} : {
    // Standard options for other platforms
    transports: ['websocket', 'polling'],
    timeout: 20000
};
```

### **3. Error Handling and Recovery**

Special error handling for VK Android WebView:

```javascript
// VK WebView specific error handler
handleVKWebViewError(error) {
    console.log('🔧 NetworkManager: VK WebView error handler activated');
    
    // Try to recover by switching to polling transport
    if (this.socket && this.socket.io) {
        this.socket.io.engine.transport.name = 'polling';
    }
    
    // Emit custom event for debugging
    this.eventManager.emit('vk-webview-error', {
        error: error,
        timestamp: Date.now(),
        config: webViewConfig.getConfigInfo()
    });
}
```

## 🧪 **Testing and Debugging**

### **1. VK Android WebView Test Page**

Use the dedicated test page: `test-vk-android-webview.html`

**Features:**
- WebView detection and configuration display
- Connection testing (Socket.IO, polling, WebSocket)
- Network diagnostics
- Error simulation
- Debug logging

### **2. Testing Steps**

1. **Open Test Page**: Load `test-vk-android-webview.html` in VK Mini App
2. **Check WebView Detection**: Verify VK Android WebView is detected
3. **Test Connection**: Run Socket.IO connection test
4. **Test Transports**: Test polling and WebSocket separately
5. **Run Diagnostics**: Execute network diagnostics
6. **Check Logs**: Review debug log for detailed information

### **3. Debug Commands**

```javascript
// Check WebView configuration
console.log(webViewConfig.getConfigInfo());

// Test connection manually
const networkManager = new NetworkManager();
await networkManager.connect();

// Run network diagnostics
debugManager.network.runDiagnostics();
```

## 🔧 **Manual Configuration**

### **1. Force Polling Transport**

If WebSocket continues to fail, force polling transport:

```javascript
// In NetworkManager.js
const socketOptions = {
    transports: ['polling'], // Force polling only
    timeout: 30000,
    path: '/pokerserver/socket.io'
};
```

### **2. Increase Timeouts**

For slow network connections:

```javascript
const socketOptions = {
    timeout: 60000, // 60 seconds
    reconnectionDelay: 2000,
    reconnectionDelayMax: 20000
};
```

### **3. Disable WebSocket Upgrade**

Prevent WebSocket upgrade attempts:

```javascript
const socketOptions = {
    transports: ['polling'],
    upgrade: false,
    rememberUpgrade: false
};
```

## 📱 **VK Mini App Specific Settings**

### **1. Android WebView Configuration**

The VK Mini App should configure WebView with these settings:

```java
WebSettings webSettings = webView.getSettings();
webSettings.setAllowUniversalAccessFromFileURLs(true);
webSettings.setAllowFileAccessFromFileURLs(true);
webSettings.setDomStorageEnabled(true);
webSettings.setJavaScriptEnabled(true);
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

### **2. Content Security Policy**

Add appropriate CSP headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests; connect-src 'self' wss://nikmobdev.ru https://nikmobdev.ru;">
```

### **3. Network Security Configuration**

For Android API 24+, add network security config:

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">nikmobdev.ru</domain>
    </domain-config>
</network-security-config>
```

## 🚨 **Common Issues and Solutions**

### **Issue 1: "xhr poll error"**
**Solution**: Force polling transport and increase timeout

### **Issue 2: "websocket error"**
**Solution**: Disable WebSocket, use polling only

### **Issue 3: Mixed content errors**
**Solution**: Force HTTPS for all requests

### **Issue 4: Connection timeout**
**Solution**: Increase timeout values and reconnection attempts

### **Issue 5: CORS errors**
**Solution**: Ensure server allows VK domain in CORS headers

## 📊 **Monitoring and Logging**

### **1. Enable Debug Logging**

```javascript
// Enable debug mode for VK environment
window.isDebug = true;
```

### **2. Monitor Connection Events**

```javascript
networkManager.on('vk-webview-error', (data) => {
    console.error('VK WebView Error:', data);
});
```

### **3. Export Debug Logs**

Use the test page to export detailed logs for analysis.

## 🔄 **Fallback Strategies**

### **1. Transport Fallback**
1. Try WebSocket first
2. Fall back to polling if WebSocket fails
3. Retry with different configurations

### **2. Server Fallback**
1. Try primary server
2. Fall back to backup server if available
3. Use local development server for testing

### **3. Configuration Fallback**
1. Use WebView-optimized settings
2. Fall back to standard settings if issues persist
3. Use minimal configuration as last resort

## 📞 **Getting Help**

### **1. Debug Information to Collect**
- WebView configuration info
- Network diagnostics results
- Error logs and stack traces
- User agent and platform information
- Connection test results

### **2. Testing Checklist**
- [ ] VK Android WebView detected correctly
- [ ] WebView configuration applied
- [ ] Socket.IO connection successful
- [ ] Polling transport working
- [ ] Error handling functional
- [ ] Debug logging enabled

### **3. Contact Information**
- Use the test page to generate debug reports
- Export logs for analysis
- Check server logs for connection attempts
- Verify VK Mini App configuration

## 📝 **Notes**

- The WebView configuration is automatically applied when VK Android WebView is detected
- All changes are backward compatible with other platforms
- Debug logging provides detailed information for troubleshooting
- The test page helps isolate and reproduce issues
- Regular testing in VK Mini App environment is recommended 