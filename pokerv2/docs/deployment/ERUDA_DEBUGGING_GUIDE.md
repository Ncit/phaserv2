# Eruda Debugging Integration Guide

This guide explains how to use Eruda for debugging the poker game, especially in mobile WebView environments.

## What is Eruda?

Eruda is a mobile web debugging tool that provides a comprehensive debugging interface for mobile web applications. It's particularly useful for debugging WebView applications and provides tools similar to browser developer tools.

## Features

### 🔧 Core Debugging Tools
- **Console**: View console logs, errors, and warnings
- **Network**: Monitor HTTP requests and WebSocket connections
- **Elements**: Inspect and modify DOM elements
- **Resources**: View localStorage, sessionStorage, and cookies
- **Info**: Display device and browser information
- **Snippets**: Run JavaScript code snippets

### 🎮 Poker Game Specific Features
- **Network Monitoring**: Track WebSocket connections and game events
- **Game State Inspection**: View current game state and player information
- **Performance Monitoring**: Track FPS and performance metrics
- **Error Tracking**: Capture and analyze JavaScript errors
- **Debug API**: Programmatic access to debugging functions

## Installation

### Automatic Installation
Eruda is automatically loaded in the main game:

```html
<!-- Eruda Debug Tool -->
<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

### Manual Installation
To enable Eruda manually, add to your HTML:

```html
<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

## Usage

### Basic Usage

1. **Open Eruda Panel**
   - Tap the Eruda icon in the bottom-right corner of the screen
   - The debugging panel will slide up from the bottom

2. **Navigate Between Tabs**
   - **Console**: View logs and errors
   - **Network**: Monitor network activity
   - **Elements**: Inspect DOM
   - **Resources**: View storage
   - **Info**: Device information
   - **Snippets**: Run code

### Network Debugging

#### Monitor WebSocket Connections
1. Open Eruda panel
2. Go to **Network** tab
3. Look for WebSocket connections to `wss://nikmobdev.ru/pokerserver/socket.io/`
4. Click on connections to see event details

#### Game Event Monitoring
The Network tab will show:
- `connect` - WebSocket connection established
- `disconnect` - WebSocket connection lost
- `gameJoined` - Player joined game
- `gameStateUpdate` - Game state changes
- `pokerAction` - Player actions (call, fold, raise)
- `chatMessage` - Chat messages

### Console Debugging

#### View Game Logs
1. Open Eruda panel
2. Go to **Console** tab
3. View real-time logs from the game

#### Common Log Messages
```
NetworkManager: Connecting to server...
NetworkManager: Connected to server
NetworkManager: Game joined: {gameId: "123", playerId: "456"}
NetworkManager: Game state update: {gameState: {...}}
```

### Game State Inspection

#### Using Debug API
Open the browser console and use the global `debug` object:

```javascript
// Get current game state
debug.game.getState()

// Get player list
debug.game.getPlayers()

// Get current player
debug.game.getCurrentPlayer()

// Force a game action (for testing)
debug.game.forceAction('call')
debug.game.forceAction('fold')
debug.game.forceAction('raise', 100)
```

#### Using Eruda Snippets
1. Open Eruda panel
2. Go to **Snippets** tab
3. Run debug commands:

```javascript
// Check network status
debug.network.getStatus()

// Get performance metrics
debug.performance.getMetrics()

// Get error logs
debug.errors.getErrors()
```

## Debug API Reference

### Network Debugging

```javascript
// Get WebSocket connection status
debug.network.getStatus()
// Returns: {connected: true, id: "socket_id", transport: "websocket"}

// Get network request logs
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

// Get current player (whose turn it is)
debug.game.getCurrentPlayer()
// Returns: Player object or null

// Force a game action (for testing)
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

// End a timer and get duration
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

// Simulate an error (for testing)
debug.errors.simulateError()
```

### Utility Functions

```javascript
// Reload the page
debug.utils.reload()

// Clear localStorage and sessionStorage
debug.utils.clearStorage()

// Export debug data as JSON file
debug.utils.exportData()

// Import debug data
debug.utils.importData(data)
```

## Debug Test Page

A comprehensive test page is available at `test-debug.html` that demonstrates all debugging features:

1. **Network Testing**: Test connections, simulate errors
2. **Game Testing**: Force actions, inspect game state
3. **Performance Testing**: Monitor FPS and timers
4. **Error Testing**: Simulate and track errors
5. **Utility Functions**: Export data, clear storage

### Accessing the Test Page
```
http://localhost:8080/test-debug.html
```

## Debug Manager Configuration

### Auto-Enable Conditions
Debug mode is automatically enabled when:

- Running on `localhost` or `127.0.0.1`
- Running on production domains (`nikmobdev.ru`, `github.io`, `vercel.app`, `netlify.app`)
- URL contains `?debug=true`
- URL contains `#debug`
- `window.isDebug` is set to `true`
- **All production environments** (enabled by default)

### Manual Enable/Disable

```javascript
// Enable debug mode
debugManager.enable()

// Disable debug mode
debugManager.disable()

// Check if debug is enabled
debugManager.isDebugEnabled()
```

## Mobile WebView Integration

### Android WebView
Eruda works seamlessly in Android WebView with the following benefits:

- **Touch-friendly interface**: Optimized for mobile screens
- **WebSocket monitoring**: Track real-time game connections
- **Performance monitoring**: Monitor FPS and memory usage
- **Error tracking**: Capture JavaScript errors in WebView

### iOS WebView
Eruda is also compatible with iOS WebView and provides the same debugging capabilities.

## Troubleshooting

### Eruda Not Loading
1. Check if the CDN is accessible
2. Verify the script is loaded before other scripts
3. Check console for loading errors

### Network Tab Empty
1. Ensure WebSocket connections are active
2. Check if network monitoring is enabled
3. Verify the game is connected to the server

### Debug API Not Available
1. Check if debug mode is enabled
2. Verify the DebugManager is loaded
3. Check console for initialization errors

### Performance Issues
1. Disable debug mode in production
2. Clear debug logs periodically
3. Monitor memory usage in the Info tab

## Production Considerations

### Production Debugging Enabled
Eruda is now enabled for production environments by default, providing debugging capabilities in live applications.

### Benefits of Production Debugging
- **Real-time Issue Diagnosis**: Debug issues as they occur in production
- **User Support**: Help users troubleshoot problems directly
- **Performance Monitoring**: Monitor real-world performance metrics
- **Error Tracking**: Capture and analyze production errors
- **WebView Debugging**: Debug mobile WebView applications in production

### Disable if Needed
If you need to disable Eruda in production:

```javascript
// Disable debug mode
debugManager.disable()

// Or remove Eruda script entirely
// Remove these lines from index.html:
// <script src="//cdn.jsdelivr.net/npm/eruda"></script>
// <script>eruda.init();</script>
```

### Conditional Loading (Alternative)
If you prefer conditional loading:

```javascript
// Only enable for specific environments
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'nikmobdev.ru') {
    // Load Eruda for development and specific production domains
    const script = document.createElement('script');
    script.src = '//cdn.jsdelivr.net/npm/eruda';
    script.onload = () => eruda.init();
    document.head.appendChild(script);
}
```

## Best Practices

### Debugging Workflow
1. **Start with Console**: Check for errors and logs
2. **Monitor Network**: Verify WebSocket connections
3. **Inspect Elements**: Check UI state and DOM
4. **Use Snippets**: Run custom debug commands
5. **Export Data**: Save debug data for analysis

### Performance Monitoring
1. Monitor FPS in the Info tab
2. Track memory usage
3. Use timers for performance profiling
4. Clear logs periodically

### Error Tracking
1. Check error logs regularly
2. Simulate errors for testing
3. Export error data for analysis
4. Monitor WebSocket connection errors

## Examples

### Debugging a Connection Issue
```javascript
// Check connection status
debug.network.getStatus()

// View connection logs
debug.network.getLogs()

// Check for errors
debug.errors.getErrors()
```

### Debugging Game State
```javascript
// Get current game state
const state = debug.game.getState()
console.log('Current scene:', state.currentScene)
console.log('Players:', state.players)

// Check if it's my turn
const currentPlayer = debug.game.getCurrentPlayer()
console.log('Current player:', currentPlayer)
```

### Performance Profiling
```javascript
// Start profiling
debug.performance.startTimer('game_loop')

// ... game logic ...

// End profiling
const duration = debug.performance.endTimer('game_loop')
console.log('Game loop took:', duration, 'ms')
```

This comprehensive debugging setup provides powerful tools for developing and troubleshooting the poker game, especially in mobile WebView environments. 