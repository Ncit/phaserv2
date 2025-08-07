# Network Troubleshooting Guide

This guide helps diagnose and fix WebSocket connection issues in the poker game.

## 🚨 Common WebSocket Errors

### TransportError
```
Error: NetworkManager: Connection error: 
R {description: Event, context: undefined, type: "TransportError"}
```

**Causes:**
- WebSocket connection blocked by firewall/proxy
- Server not running or unreachable
- Network connectivity issues
- SSL/TLS certificate problems
- Browser security restrictions

## 🔍 Diagnostic Tools

### 1. Network Diagnostics
Run comprehensive network diagnostics:

```javascript
// Run full diagnostics
debug.network.runDiagnostics()

// Quick connection test
debug.network.quickTest()
```

### 2. Debug Panel
Use Eruda debug panel:
1. Click **🔧 ERUDA** button
2. Go to **Network** tab
3. Monitor WebSocket connections
4. Check for failed requests

### 3. Console Logs
Check browser console for detailed error messages:
```javascript
// Check connection status
debug.network.getStatus()

// View network logs
debug.network.getLogs()
```

## 🛠️ Troubleshooting Steps

### Step 1: Basic Connectivity Test

```javascript
// Quick server test
debug.network.quickTest()
```

**Expected Result:**
```json
{
  "serverReachable": true,
  "responseTime": "150.25ms",
  "status": 200
}
```

**If Failed:**
- Check internet connection
- Verify server is running
- Check firewall settings

### Step 2: Server Status Check

```javascript
// Test server response
fetch('https://nikmobdev.ru', {
  method: 'HEAD',
  mode: 'cors'
}).then(response => {
  console.log('Server Status:', response.status);
}).catch(error => {
  console.error('Server Error:', error);
});
```

**Expected Result:** Status 200 OK

### Step 3: WebSocket Endpoint Test

```javascript
// Test WebSocket connection
const ws = new WebSocket('wss://nikmobdev.ru/pokerserver/socket.io/');
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

### Step 4: Network Diagnostics

```javascript
// Run comprehensive diagnostics
const diagnostics = await debug.network.runDiagnostics();
console.log('Diagnostic Summary:', diagnostics.summary);
```

## 🔧 Fixes for Common Issues

### Issue 1: WebSocket Connection Blocked

**Symptoms:**
- TransportError in console
- Connection timeout
- Network tab shows failed WebSocket requests

**Solutions:**

#### A. Check Firewall/Proxy
```bash
# Test if port 443 is reachable
telnet nikmobdev.ru 443

# Test WebSocket endpoint
curl -I https://nikmobdev.ru/pokerserver/socket.io/
```

#### B. Browser Security Settings
1. Check if HTTPS is required
2. Verify CORS settings
3. Check Content Security Policy

#### C. Network Configuration
```javascript
// Try different transport options
const socketOptions = {
    transports: ['polling', 'websocket'], // Try polling first
    timeout: 30000,
    forceNew: true
};
```

### Issue 2: SSL/TLS Certificate Problems

**Symptoms:**
- Certificate errors in console
- Mixed content warnings
- Security policy violations

**Solutions:**

#### A. Check Certificate
```bash
# Check SSL certificate
openssl s_client -connect nikmobdev.ru:443 -servername nikmobdev.ru
```

#### B. Browser Certificate Settings
1. Clear SSL state
2. Check certificate validity
3. Accept certificate if self-signed

### Issue 3: Server Not Responding

**Symptoms:**
- Connection timeout
- Server unreachable
- 404/500 errors

**Solutions:**

#### A. Server Status Check
```bash
# Check if server is running
curl -I https://nikmobdev.ru

# Check specific endpoint
curl -I https://nikmobdev.ru/pokerserver/socket.io/
```

#### B. DNS Resolution
```bash
# Check DNS resolution
nslookup nikmobdev.ru
dig nikmobdev.ru
```

### Issue 4: Browser Compatibility

**Symptoms:**
- WebSocket not supported
- Feature detection fails
- Polyfill required

**Solutions:**

#### A. Check Browser Support
```javascript
// Check WebSocket support
if (typeof WebSocket !== 'undefined') {
    console.log('WebSocket supported');
} else {
    console.log('WebSocket not supported');
}
```

#### B. Use Fallback Transport
```javascript
// Force polling transport
const socketOptions = {
    transports: ['polling'], // Only use polling
    upgrade: false
};
```

## 📱 Mobile WebView Issues

### Android WebView

**Common Issues:**
- WebSocket disabled in WebView
- Mixed content blocked
- Certificate pinning issues

**Solutions:**

#### A. WebView Configuration
```java
// Enable WebSocket in WebView
webSettings.setJavaScriptEnabled(true);
webSettings.setDomStorageEnabled(true);
webSettings.setAllowUniversalAccessFromFileURLs(true);
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
```

#### B. Network Security Config
```xml
<!-- Allow cleartext traffic for development -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">nikmobdev.ru</domain>
    </domain-config>
</network-security-config>
```

### iOS WebView

**Common Issues:**
- App Transport Security restrictions
- WebSocket limitations
- Certificate validation

**Solutions:**

#### A. App Transport Security
```xml
<!-- Allow arbitrary loads for development -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## 🔄 Connection Recovery

### Automatic Reconnection
The NetworkManager includes automatic reconnection:

```javascript
// Reconnection settings
const socketOptions = {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 5000
};
```

### Manual Reconnection
```javascript
// Force reconnection
if (window.socket) {
    window.socket.connect();
}

// Check connection status
debug.network.getStatus()
```

## 📊 Monitoring and Logging

### Real-time Monitoring
```javascript
// Monitor connection status
setInterval(() => {
    const status = debug.network.getStatus();
    console.log('Connection Status:', status);
}, 5000);
```

### Error Logging
```javascript
// Get error logs
const errors = debug.errors.getErrors();
console.log('Recent Errors:', errors);
```

### Performance Monitoring
```javascript
// Monitor connection performance
const metrics = debug.performance.getMetrics();
console.log('Performance:', metrics);
```

## 🚀 Best Practices

### 1. Connection Management
- Always check connection status before sending data
- Implement proper error handling
- Use exponential backoff for reconnection

### 2. Error Handling
```javascript
socket.on('connect_error', (error) => {
    console.error('Connection failed:', error);
    // Implement fallback or retry logic
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    // Handle disconnection gracefully
});
```

### 3. Debugging
- Enable debug mode for troubleshooting
- Use network diagnostics tools
- Monitor console logs regularly

### 4. Production Considerations
- Use HTTPS in production
- Implement proper SSL certificates
- Monitor server health
- Set up alerts for connection issues

## 📞 Getting Help

### 1. Collect Information
```javascript
// Export debug data
debug.utils.exportData()

// Run diagnostics
const diagnostics = await debug.network.runDiagnostics();
console.log('Diagnostics:', diagnostics);
```

### 2. Check Logs
- Browser console logs
- Network tab in developer tools
- Server logs (if available)

### 3. Common Debug Commands
```javascript
// Quick status check
debug.network.getStatus()

// Run diagnostics
debug.network.runDiagnostics()

// Check errors
debug.errors.getErrors()

// Export data
debug.utils.exportData()
```

### 4. Contact Support
When reporting issues, include:
- Error messages from console
- Network diagnostic results
- Browser and device information
- Steps to reproduce the issue

This comprehensive troubleshooting guide should help resolve most WebSocket connection issues. 