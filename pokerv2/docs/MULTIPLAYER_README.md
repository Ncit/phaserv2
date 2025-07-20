# Multiplayer Poker Implementation

This document describes the multiplayer poker implementation that has been added to the existing poker game.

## Overview

The multiplayer implementation consists of:
- **Node.js Server**: Handles game logic, player management, and real-time communication
- **Client-Side Network Manager**: Manages WebSocket connections and game state synchronization
- **Refactored FastGameScene**: Updated to work with multiplayer instead of AI bots

## Architecture

### Server Components

```
server/
├── server.js              # Main server with Socket.IO setup
├── game/
│   ├── GameManager.js     # Manages multiple concurrent games
│   ├── PlayerManager.js   # Handles player connections and data
│   ├── PokerGame.js       # Individual game logic and state
│   └── HandEvaluator.js   # Server-side hand evaluation
└── package.json           # Server dependencies
```

### Client Components

```
src/
├── managers/
│   └── NetworkManager.js  # WebSocket communication and event handling
└── scenes/
    └── FastGameScene.js   # Refactored for multiplayer
```

## Key Features

### Real-Time Multiplayer
- WebSocket communication using Socket.IO
- Automatic game creation and player matching
- Real-time game state synchronization
- Player join/leave handling

### Game Logic
- Full Texas Hold'em poker implementation
- Server-side hand evaluation and winner determination
- Automatic betting round management
- Action timers with auto-fold functionality

### Player Management
- Support for 2-6 players per game
- Multiple concurrent games
- Player disconnection handling
- Automatic game cleanup

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Quick Start

1. **Run the startup script** (recommended):
   ```bash
   cd pokerv2
   ./start-multiplayer.sh
   ```

2. **Manual setup**:
   ```bash
   # Install server dependencies
   cd pokerv2/server
   npm install
   
   # Start the server
   npm run dev
   
   # Open the game in your browser
   # Navigate to the pokerv2 directory and open index.html
   ```

### Server Configuration

The server runs on `http://localhost:3000` by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## How to Play

1. **Start the server** using the setup instructions above
2. **Open the game** in your browser (navigate to the pokerv2 directory)
3. **Click "Fast Game"** to join a multiplayer game
4. **Wait for other players** to join (minimum 2 players required)
5. **Play poker** with real players instead of AI bots!

## Game Flow

1. **Connection**: Player connects to server via WebSocket
2. **Join Game**: Player automatically joins an available game
3. **Game Start**: Game begins when 2+ players join
4. **Betting Rounds**: Players take turns making poker actions
5. **Showdown**: Remaining players reveal cards and determine winner
6. **New Hand**: Game continues with new hands

## Technical Details

### WebSocket Events

#### Client → Server
- `joinGame` - Join a game with player data
- `pokerAction` - Send poker action (fold, call, raise, etc.)
- `startNewHand` - Request new hand

#### Server → Client
- `gameJoined` - Confirmation of game join
- `gameStateUpdate` - Updated game state
- `playerJoined` - New player notification
- `playerLeft` - Player departure notification
- `error` - Error messages

### Game State Management

The server maintains the authoritative game state:
- Player positions and chips
- Community cards
- Current betting round
- Action timers
- Hand evaluation results

The client receives state updates and renders the UI accordingly.

### Player Actions

- **Fold**: Give up the current hand
- **Check**: Pass without betting (when no bet to call)
- **Call**: Match the current bet
- **Raise**: Increase the current bet
- **All-In**: Bet all remaining chips

## Differences from AI Version

### Removed Features
- AI player logic and decision making
- Local game state management
- Single-player game flow

### Added Features
- Real-time multiplayer support
- Network communication layer
- Player connection management
- Server-side game logic
- Action validation and synchronization

## Troubleshooting

### Common Issues

1. **"Connection failed"**
   - Make sure the server is running on port 3000
   - Check if Node.js and npm are installed
   - Verify no firewall is blocking the connection

2. **"Game not starting"**
   - Ensure at least 2 players have joined
   - Check server logs for errors
   - Refresh the browser page

3. **"Actions not working"**
   - Verify it's your turn
   - Check if you have enough chips
   - Ensure you're not folded or all-in

4. **"Players not joining"**
   - Check if multiple browser tabs/windows are open
   - Verify the server URL in NetworkManager.js
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting `window.isDebug = true` in the browser console:

```javascript
window.isDebug = true;
```

This will show detailed network and game state logs.

## Development

### Adding New Features

1. **Chat System**: Add chat events to server.js and NetworkManager.js
2. **Tournament Mode**: Extend GameManager.js with tournament logic
3. **Spectator Mode**: Allow non-playing observers
4. **Custom Rules**: Modify PokerGame.js for different poker variants

### Testing

1. **Local Testing**: Open multiple browser tabs to simulate multiple players
2. **Network Testing**: Test with players on different machines
3. **Stress Testing**: Test with maximum players and concurrent games

## Performance Considerations

- Server handles up to 10 concurrent games
- Each game supports 2-6 players
- Action timeout is 30 seconds per player
- Automatic cleanup of empty games and disconnected players

## Security Notes

- Server validates all player actions
- No client-side game logic to prevent cheating
- Player data is not persisted (resets on server restart)
- Consider adding authentication for production use

## Future Enhancements

- Player authentication and profiles
- Persistent player data and statistics
- Tournament mode with brackets
- Chat system with moderation
- Spectator mode for observers
- Mobile app support
- Database integration for player persistence 