# Production Debugging Guide

This guide explains how to use Eruda debugging tools in production environments for the poker game.

## 🚀 Production Debugging Enabled

Eruda is now **enabled by default** in all production environments, providing powerful debugging capabilities for live applications.

## 📱 Visual Indicators

### Debug Status Indicator
When debug mode is active, you'll see debug controls in the top-right corner:

**🐛 DEBUG** - Debug status indicator (click for debug info)
- Yellow indicator (development)
- Red indicator (production)

**🔧 ERUDA** - Eruda debug panel button (click to open/close debug panel)
- Blue button (development)
- Red button (production)

Click the **🔧 ERUDA** button to toggle the Eruda debug panel.
Click the **🐛 DEBUG** indicator to view debug status information in the console.

## 🔧 Production Debug Features

### ✅ Available in Production
- **Console Logging**: View all console logs and errors
- **Network Monitoring**: Track WebSocket connections and HTTP requests
- **Game State Inspection**: View current game state and player information
- **Performance Monitoring**: Monitor FPS and performance metrics
- **Error Tracking**: Capture and analyze JavaScript errors
- **DOM Inspection**: Inspect and modify game UI elements
- **Storage Inspection**: View localStorage and sessionStorage
- **Device Information**: View device and browser details

### ⚠️ Restricted in Production
- **Force Actions**: Disabled by default (prevents cheating)
- **Error Simulation**: Disabled by default (prevents confusion)
- **Storage Clearing**: Disabled by default (protects user data)
- **Data Import**: Disabled by default (security measure)

### 🔓 Enable Restricted Features
To enable restricted features in production, add debug flags to the URL:

```
https://nikmobdev.ru/pokerserver/?debug=true
https://nikmobdev.ru/pokerserver/#debug
```

## 🎮 Using Debug Tools in Production

### 1. Open Debug Panel
- Click the **🔧 ERUDA** button in the top-right corner
- Or add `?debug=true` to the URL

### 2. Monitor Network Activity
1. Open Eruda panel
2. Go to **Network** tab
3. Monitor WebSocket connections to `wss://nikmobdev.ru/pokerserver/socket.io/`
4. View real-time game events:
   - `connect` - Connection established
   - `gameJoined` - Player joined game
   - `gameStateUpdate` - Game state changes
   - `pokerAction` - Player actions
   - `chatMessage` - Chat messages

### 3. Inspect Game State
Use the **Console** tab or **Snippets** tab:

```javascript
// Get current game state
debug.game.getState()

// Get all players
debug.game.getPlayers()

// Get current player (whose turn)
debug.game.getCurrentPlayer()

// Check network status
debug.network.getStatus()

// Get performance metrics
debug.performance.getMetrics()
```

### 4. Monitor Performance
- **Info** tab: View FPS and device information
- **Console** tab: Performance logs
- **Network** tab: Request timing

### 5. Track Errors
- **Console** tab: View all errors and warnings
- **Network** tab: Failed requests
- Error logs are automatically captured

## 🛠️ Production Debug API

### Network Debugging
```javascript
// Check connection status
debug.network.getStatus()
// Returns: {connected: true, id: "socket_id", transport: "websocket"}

// View network logs
debug.network.getLogs()
// Returns: Array of network requests and WebSocket events

// Clear network logs
debug.network.clearLogs()
```

### Game Debugging
```javascript
// Get current game state
debug.game.getState()
// Returns: {currentScene: "GameScene", gameState: {...}, players: [...]}

// Get all players
debug.game.getPlayers()
// Returns: Array of player objects

// Get current player
debug.game.getCurrentPlayer()
// Returns: Player object or null

// Force actions (only if debug flag is enabled)
debug.game.forceAction('call')     // Call
debug.game.forceAction('fold')     // Fold
debug.game.forceAction('raise', 50) // Raise by 50
```

### Performance Debugging
```javascript
// Get performance metrics
debug.performance.getMetrics()
// Returns: {fps: [...], memory: [...], timers: {...}, loadTimes: {...}}

// Start a timer
debug.performance.startTimer('my_timer')

// End timer and get duration
debug.performance.endTimer('my_timer')
// Returns: duration in milliseconds

// Get active timers
debug.performance.getTimers()
// Returns: Object with active timer durations
```

### Error Debugging
```javascript
// Get all error logs
debug.errors.getErrors()
// Returns: Array of error objects

// Clear error logs
debug.errors.clearErrors()

// Simulate error (only if debug flag is enabled)
debug.errors.simulateError()
```

### Utility Functions
```javascript
// Reload the page
debug.utils.reload()

// Clear storage (only if debug flag is enabled)
debug.utils.clearStorage()

// Export debug data as JSON file
debug.utils.exportData()

// Import debug data (only if debug flag is enabled)
debug.utils.importData(data)
```

## 🔍 Troubleshooting Production Issues

### Connection Problems
1. **Check Network Tab**: Look for failed WebSocket connections
2. **Check Console**: Look for connection errors
3. **Use Debug API**: `debug.network.getStatus()`

### Game State Issues
1. **Inspect Game State**: `debug.game.getState()`
2. **Check Players**: `debug.game.getPlayers()`
3. **Monitor Events**: Watch Network tab for game events

### Performance Issues
1. **Check FPS**: Use Info tab to monitor frame rate
2. **Monitor Memory**: Check for memory leaks
3. **Use Timers**: Profile specific operations

### Error Diagnosis
1. **Check Error Logs**: `debug.errors.getErrors()`
2. **Monitor Console**: Real-time error tracking
3. **Export Data**: Save debug data for analysis

## 📊 Production Monitoring

### Real-time Monitoring
- **Network Activity**: Monitor all WebSocket events
- **Error Tracking**: Capture all JavaScript errors
- **Performance Metrics**: Track FPS and memory usage
- **Game State**: Monitor game flow and player actions

### Data Export
```javascript
// Export all debug data
debug.utils.exportData()
// Downloads: poker-debug-[timestamp].json
```

### Log Analysis
Exported data includes:
- Network request logs
- Error logs with stack traces
- Performance metrics
- Game state snapshots
- Timestamp information

## 🔐 Security Considerations

### Production Safeguards
- **Force Actions**: Disabled by default (prevents cheating)
- **Error Simulation**: Disabled by default (prevents confusion)
- **Storage Clearing**: Disabled by default (protects user data)
- **Data Import**: Disabled by default (security measure)

### Enable Safeguards
To enable restricted features, add debug flags:
```
https://nikmobdev.ru/pokerserver/?debug=true
https://nikmobdev.ru/pokerserver/#debug
```

### Disable Debugging
To disable debugging entirely:
```
https://nikmobdev.ru/pokerserver/?debug=false
https://nikmobdev.ru/pokerserver/#nodebug
```

## 🎯 Use Cases

### User Support
1. **Remote Debugging**: Help users troubleshoot issues
2. **Error Analysis**: Capture and analyze user-reported errors
3. **Performance Issues**: Monitor real-world performance
4. **Connection Problems**: Diagnose network issues

### Development
1. **Live Testing**: Test features in production environment
2. **Performance Monitoring**: Monitor real-world performance
3. **Error Tracking**: Track production errors
4. **User Behavior**: Understand how users interact with the game

### Quality Assurance
1. **Issue Reproduction**: Reproduce reported bugs
2. **Performance Testing**: Test performance under real conditions
3. **Compatibility Testing**: Test across different devices
4. **Network Testing**: Test under various network conditions

## 📱 Mobile WebView Support

### Android WebView
- **Touch-friendly Interface**: Optimized for mobile screens
- **WebSocket Monitoring**: Track real-time connections
- **Performance Monitoring**: Monitor FPS and memory
- **Error Tracking**: Capture WebView-specific errors

### iOS WebView
- **Same Capabilities**: Full compatibility with iOS WebView
- **Native Integration**: Seamless debugging experience

## 🚀 Best Practices

### For Users
1. **Enable Debug Mode**: Add `?debug=true` to URL when reporting issues
2. **Export Debug Data**: Use `debug.utils.exportData()` to save logs
3. **Monitor Performance**: Check FPS in Info tab
4. **Report Errors**: Share error logs with support team

### For Developers
1. **Monitor Production**: Regularly check debug logs
2. **Performance Tracking**: Monitor real-world performance
3. **Error Analysis**: Analyze production errors
4. **User Support**: Use debug tools to help users

### For Support Team
1. **Remote Debugging**: Guide users through debug process
2. **Data Collection**: Collect debug data for analysis
3. **Issue Reproduction**: Use debug tools to reproduce issues
4. **Performance Analysis**: Analyze performance issues

## 📞 Support

### Getting Help
1. **Enable Debug Mode**: Add `?debug=true` to URL
2. **Collect Debug Data**: Export debug data using `debug.utils.exportData()`
3. **Share Information**: Provide debug data and error logs
4. **Contact Support**: Reach out with collected information

### Debug Data Format
Debug data is exported as JSON with:
- Timestamp information
- Network request logs
- Error logs with stack traces
- Performance metrics
- Game state information

This comprehensive production debugging setup enables powerful troubleshooting capabilities while maintaining security and preventing abuse. 