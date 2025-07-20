# Poker Game v2 - Server

The server-side application for the Poker Game v2 project, providing real-time multiplayer functionality.

## 🎯 **Overview**

The server handles:
- **Real-time Multiplayer**: WebSocket-based game sessions
- **Game Logic**: Server-side game state management
- **Player Management**: Connection handling and player states
- **Room Management**: Game room creation and management
- **Hand Evaluation**: Server-side poker hand calculations

## 📁 **Project Structure**

```
server/
├── src/                    # Server source code
├── game/                   # Game logic modules
│   ├── GameManager.js      # Main game management
│   ├── HandEvaluator.js    # Poker hand evaluation
│   ├── PlayerManager.js    # Player state management
│   ├── PokerGame.js        # Core poker game logic
│   └── SingleRoomGame.js   # Single room game handling
├── scripts/                # Server automation scripts
│   ├── start-multiplayer.sh
│   ├── test-server.js
│   ├── test-websocket.js
│   └── test-allin-setup.js
├── node_modules/           # Node.js dependencies
├── package.json            # Node.js package configuration
├── package-lock.json       # Dependency lock file
└── server.js               # Main server entry point
```

## 🚀 **Quick Start**

### **Installation**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### **Development Server**
```bash
# Start development server
npm start

# Or run directly
node server.js
```

### **Production Server**
```bash
# Start production server
npm run start:prod

# With environment variables
NODE_ENV=production node server.js
```

## 🎮 **Server Features**

### **Real-time Multiplayer**
- **WebSocket Connections**: Real-time bidirectional communication
- **Room Management**: Create and join game rooms
- **Player Synchronization**: Keep all players in sync
- **Connection Handling**: Graceful connection management

### **Game Logic**
- **Server-side Validation**: Prevent cheating and ensure fair play
- **Hand Evaluation**: Accurate poker hand calculations
- **Turn Management**: Enforce proper turn order
- **Betting Logic**: Handle all betting scenarios

### **Player Management**
- **Connection Tracking**: Monitor player connections
- **State Management**: Track player game states
- **Reconnection Support**: Handle player disconnections
- **Spectator Mode**: Support for non-playing observers

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Server configuration
PORT=3000                    # Server port
NODE_ENV=development         # Environment mode
MAX_PLAYERS=6               # Maximum players per room
GAME_TIMEOUT=30000          # Game timeout in milliseconds
```

### **WebSocket Events**
- **join**: Player joins a room
- **leave**: Player leaves a room
- **action**: Player game action (bet, fold, etc.)
- **chat**: Chat message
- **ready**: Player ready state

## 🧪 **Testing**

### **Server Tests**
```bash
# Run server tests
cd scripts
node test-server.js

# Test WebSocket connections
node test-websocket.js

# Test all-in scenarios
node test-allin-setup.js
```

### **Dependency Management**
```bash
# Interactive dependency update tool
./scripts/update-dependencies.sh

# Quick commands
./scripts/update-dependencies.sh status    # Check current status
./scripts/update-dependencies.sh safe      # Safe update
./scripts/update-dependencies.sh latest    # Update to latest versions
./scripts/update-dependencies.sh clean     # Clean install
./scripts/update-dependencies.sh security  # Fix security issues
./scripts/update-dependencies.sh all       # All-in-one update
```

### **Integration Tests**
```bash
# Start server for testing
./scripts/start-multiplayer.sh

# Run client tests against server
cd ../client/tests
python3 -m http.server 8001
```

## 📊 **API Reference**

### **WebSocket Events**

#### **Client to Server**
```javascript
// Join a room
{
  type: 'join',
  roomId: 'room123',
  player: {
    id: 'player1',
    name: 'Player 1',
    avatar: 'avatar_url'
  }
}

// Player action
{
  type: 'action',
  action: 'call',
  amount: 100
}
```

#### **Server to Client**
```javascript
// Game state update
{
  type: 'gameState',
  players: [...],
  currentPlayer: 'player1',
  pot: 500,
  communityCards: [...]
}
```

## 🛠️ **Development**

### **Code Organization**
- **Modular Architecture**: Clean separation of concerns
- **Event-driven**: WebSocket event handling
- **State Management**: Centralized game state
- **Error Handling**: Comprehensive error management

### **Dependencies**
- **Node.js**: Server runtime
- **WebSocket**: Real-time communication
- **Custom Game Logic**: Poker-specific implementations

### **Performance**
- **Connection Pooling**: Efficient WebSocket management
- **Memory Management**: Optimized for multiple concurrent games
- **Error Recovery**: Graceful handling of failures

## 📚 **Documentation**

- **[Main README](../README.md)**: Complete project overview
- **[Client Documentation](../client/README.md)**: Client-side application
- **[Game Documentation](../docs/README.md)**: Detailed game features
- **[Changelog](../CHANGELOG.md)**: Complete change history

## 🔮 **Future Enhancements**

- **Database Integration**: Persistent game state
- **Authentication**: User authentication and authorization
- **Analytics**: Game statistics and analytics
- **Scaling**: Load balancing and horizontal scaling
- **Security**: Enhanced security measures

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### **WebSocket Connection Issues**
- Check firewall settings
- Verify client WebSocket URL
- Check server logs for errors

#### **Memory Issues**
- Monitor server memory usage
- Restart server if needed
- Check for memory leaks in game logic

---

*This server provides robust, real-time multiplayer functionality for the Poker Game v2 project.* 