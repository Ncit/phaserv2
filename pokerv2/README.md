# Poker Game v2

A modern, multi-platform Texas Hold'em poker game built with Phaser.js, featuring AI bots, real-time multiplayer, and platform integration for VKontakte and Telegram.

## 🎯 **Project Overview**

Poker Game v2 is a comprehensive poker application with a clean, decoupled architecture:

- **🎮 Client**: Phaser.js-based game client with platform integration
- **🖥️ Server**: Node.js multiplayer server with real-time WebSocket communication
- **📱 Multi-Platform**: Support for VKontakte and Telegram Mini Apps
- **🤖 AI Bots**: Intelligent AI opponents for single-player games
- **🌐 Multiplayer**: Real-time multiplayer games with chat system

## 📁 **Project Structure**

```
pokerv2/
├── client/                  # 🎮 Client Application
│   ├── client/src/                # Source code
│   │   ├── config/         # Configuration files
│   │   ├── managers/       # Game managers
│   │   ├── scenes/         # Phaser.js scenes
│   │   ├── scripts/        # Platform integration
│   │   ├── utils/          # Utility functions
│   │   └── main.js         # Main entry point
│   ├── assets/             # Game assets (cards, UI, fonts)
│   ├── dependencies/       # External libraries
│   ├── tests/              # Client test files
│   ├── docs/               # Client documentation
│   ├── scripts/            # Client-specific scripts
│   └── index.html          # Main HTML file
├── server/                  # 🖥️ Server Application
│   ├── game/               # Game logic modules
│   ├── scripts/            # Server automation scripts
│   ├── client/src/                # Server source code
│   ├── package.json        # Node.js dependencies
│   └── server.js           # Main server entry point
├── scripts/                 # 🔧 Project Scripts
│   ├── set-development.sh  # Development environment
│   ├── set-vk.sh          # VK production environment
│   ├── set-telegram.sh    # Telegram production environment
│   ├── toggle-environment.sh # Environment switcher
│   └── check-environment.sh # Environment checker
├── docs/                    # 📚 Documentation
│   ├── README.md           # Main documentation
│   ├── TELEGRAM_README.md  # Telegram integration guide
│   └── ENVIRONMENT_SCRIPTS_README.md # Environment guide
├── CHANGELOG.md             # 📝 Complete change history
├── PROJECT_SUMMARY.md       # 📊 Project overview and statistics
└── README.md               # This file
```

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js** (v14 or higher) for server
- **Python 3** or any HTTP server for client development
- **Git** for version control

### **1. Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd pokerv2

# Install server dependencies
cd server
npm install
cd ..
```

### **2. Start Development Environment**
```bash
# Set development environment
./scripts/set-development.sh

# Start server (in one terminal)
cd server
npm start

# Start client (in another terminal)
cd client
python3 -m http.server 8000
open http://localhost:8000
```

### **3. Run Tests**
```bash
# Client tests
cd client/tests
python3 -m http.server 8001
open http://localhost:8001

# Server tests
cd server/scripts
node test-server.js
```

## 🎮 **Game Features**

### **Core Gameplay**
- **Texas Hold'em**: Standard poker rules and gameplay
- **AI Opponents**: Intelligent bot players with different strategies
- **Multiplayer**: Real-time multiplayer games with up to 6 players
- **Chat System**: In-game communication between players
- **Spectator Mode**: Watch games without participating

### **Platform Integration**
- **VKontakte**: Native VK platform integration with VK Bridge
- **Telegram**: Telegram Mini App integration with Web App API
- **Web Browser**: Development and testing environment
- **User Authentication**: Platform-specific user data integration
- **Avatar Management**: Unified avatar system across platforms

### **UI/UX Features**
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Modern Interface**: Clean, intuitive user interface
- **Smooth Animations**: Card animations and UI transitions
- **Custom Assets**: Professional card designs and UI elements

## 🔧 **Environment Management**

### **Three-Environment System**
The project supports three distinct environments:

#### **Development Environment**
```bash
./scripts/set-development.sh
```
- Debug features enabled
- Player selection interface
- Mock data for testing
- Local development server

#### **VK Production Environment**
```bash
./scripts/set-vk.sh
```
- VKontakte platform integration
- Production features enabled
- VK Bridge integration
- Optimized for VK deployment

#### **Telegram Production Environment**
```bash
./scripts/set-telegram.sh
```
- Telegram Mini App integration
- Web App API integration
- Production features enabled
- Optimized for Telegram deployment

### **Environment Switching**
```bash
# Check current environment
./scripts/check-environment.sh

# Toggle between environments
./scripts/toggle-environment.sh
```

## 📱 **Platform Deployment**

### **VKontakte Platform**
```bash
# Set VK environment
./scripts/set-vk.sh

# Start multiplayer server
cd server
npm start

# Deploy to VKontakte platform
```

### **Telegram Mini App**
```bash
# Set Telegram environment
./scripts/set-telegram.sh

# Start multiplayer server
cd server
npm start

# Deploy to Telegram Mini App platform
```

### **Web Browser**
```bash
# Set development environment
./scripts/set-development.sh

# Start development server
cd client
python3 -m http.server 8000
```

### **GitHub Pages Deployment**
```bash
# Test deployment setup
./scripts/test-deployment-setup.sh

# Deploy to GitHub Pages
./scripts/deploy-to-gh-pages-simple.sh

# Deploy with custom message
./scripts/deploy-to-gh-pages-simple.sh -m "Update game features"
```

## 🧪 **Testing**

### **Test Categories**
- **Game Mechanics**: Card handling, betting, turn management
- **AI Bot Tests**: Scene management and game logic
- **Chat Tests**: Communication system functionality
- **Connection Tests**: Network and multiplayer functionality
- **UI Tests**: User interface components
- **Platform Integration**: VK and Telegram integration tests
- **Environment Tests**: Configuration and import verification

### **Running Tests**
```bash
# Client tests
cd client/tests
python3 -m http.server 8001
open http://localhost:8001

# Server tests
cd server/scripts
node test-server.js
node test-websocket.js
node test-allin-setup.js
```

## 🛠️ **Development**

### **Client Development**
```bash
cd client
# Edit source files in client/src/
# Add assets to assets/
# Update tests in tests/
```

### **Server Development**
```bash
cd server
# Edit game logic in game/
# Update server code in client/src/
# Modify scripts in scripts/
```

### **Scripts Development**
```bash
# Edit environment scripts in scripts/
# Update documentation in docs/
```

## 📚 **Documentation**

### **📋 Complete Documentation Index**
- **[📚 Documentation Hub](docs/README.md)**: Comprehensive documentation organized by category

### **Core Documentation**
- **[Client README](client/README.md)**: Detailed client application guide
- **[Server README](server/README.md)**: Server application documentation
- **[Changelog](CHANGELOG.md)**: Complete change history

### **📁 Documentation Categories**
- **[🚀 Project Overview](docs/project/)** - Project summaries and organization
- **[🎮 Game Features](docs/features/)** - AI, multiplayer, UI, and other features
- **[🐛 Bug Fixes](docs/fixes/)** - Complete list of fixes and patches
- **[💻 Client Docs](docs/client/)** - Client-specific documentation
- **[🖥️ Server Docs](docs/server/)** - Server-specific documentation

### **API Documentation**
- **Client API**: See [Client README](client/README.md#api-reference)
- **Server API**: See [Server README](server/README.md#api-reference)

## 🔮 **Architecture Benefits**

### **Decoupled Design**
- **Independent Development**: Client and server can be developed separately
- **Clear Responsibilities**: Each component has well-defined roles
- **Easy Testing**: Components can be tested in isolation
- **Scalability**: Components can be scaled independently

### **Modular Structure**
- **Reusable Components**: Shared utilities and configurations
- **Platform Agnostic**: Core game logic works across platforms
- **Maintainable Code**: Clean separation of concerns
- **Extensible Design**: Easy to add new features and platforms

## 📊 **Project Statistics**

- **Total Scripts**: 8 organized scripts
- **Test Files**: 71+ comprehensive tests
- **Source Files**: 20+ organized modules
- **Environments**: 3 supported environments
- **Platforms**: 2 production platforms
- **Components**: 2 decoupled applications

## 🎯 **Current Status**

- **Architecture**: Clean client/server decoupling
- **Environment**: Development mode (debug features enabled)
- **Platform Support**: VKontakte and Telegram ready
- **Documentation**: Comprehensive and up-to-date
- **Testing**: Full test coverage for all features
- **Git Hooks**: Automated environment management

## 🔮 **Future Roadmap**

### **Potential Enhancements**
- **Additional Platforms**: Support for more social platforms
- **Advanced Features**: Enhanced multiplayer capabilities
- **Performance**: Optimization for mobile platforms
- **Analytics**: Platform-specific analytics integration
- **Database**: Persistent game state and user data

### **Maintenance**
- **Documentation**: Keep documentation updated with new features
- **Testing**: Maintain comprehensive test coverage
- **Scripts**: Regular script maintenance and updates
- **Platforms**: Monitor platform API changes

---

*This project represents a modern, multi-platform poker game with clean architecture, comprehensive testing, and extensive documentation.* 