# Poker Game v2 - Project Summary

## 🎯 **Project Overview**

Poker Game v2 is a modern multiplayer poker game built with Phaser.js, featuring AI bots, real-time multiplayer, and multi-platform integration. The game supports both VKontakte and Telegram Mini App platforms with a unified codebase.

## 🚀 **Current Version: 2.1.0**

### **Key Features**
- **Texas Hold'em Poker**: Standard poker rules with AI opponents
- **Multiplayer Support**: Real-time multiplayer games with Socket.io
- **Multi-Platform**: VKontakte and Telegram Mini App integration
- **Environment Management**: Three-environment system with feature flags
- **Comprehensive Testing**: 71+ test files covering all functionality

## 📁 **Project Structure**

```
pokerv2/
├── 📁 src/                    # Source code
│   ├── 📁 config/            # Configuration files
│   ├── 📁 managers/          # Game managers
│   ├── 📁 scenes/            # Phaser game scenes
│   ├── 📁 scripts/           # Platform integration (VK, Telegram)
│   ├── 📁 utils/             # Utility functions
│   └── main.js               # Main entry point
├── 📁 scripts/               # Environment management scripts
│   ├── set-development.sh    # Development environment
│   ├── set-vk.sh             # VK production environment
│   ├── set-telegram.sh       # Telegram production environment
│   ├── toggle-environment.sh # Cycle through environments
│   ├── check-environment.sh  # Environment status
│   ├── run-tests.sh          # Interactive test runner
│   └── list-scripts.sh       # Script documentation
├── 📁 server-scripts/        # Server automation scripts
│   ├── start-multiplayer.sh  # Multiplayer server startup
│   ├── test-server.js        # Server testing
│   └── README.md             # Server documentation
├── 📁 tests/                 # Test files (71+ tests)
├── 📁 assets/                # Game assets
├── 📁 dependencies/          # External libraries
├── 📁 server/                # Multiplayer server
└── 📄 Documentation files
```

## 🔧 **Environment System**

### **Three Environments**
| Environment | Platform | Debug Features | Production Features |
|-------------|----------|----------------|-------------------|
| **Development** | Web Browser | ✅ All enabled | ❌ Disabled |
| **ProductionVK** | VKontakte | ❌ Disabled | ✅ All enabled |
| **ProductionTelegram** | Telegram | ❌ Disabled | ✅ All enabled |

### **Feature Flags**
- `playerSelection`: Debug player selection UI
- `debugLogging`: Console logging and debugging
- `mockData`: Mock data for testing
- `ngrokHeaders`: Ngrok tunnel headers
- `verboseErrors`: Detailed error messages

## 🎮 **Game Features**

### **Core Gameplay**
- **Texas Hold'em Poker**: Standard poker rules
- **AI Bots**: Intelligent computer opponents
- **Multiplayer**: Real-time multiplayer games
- **Chat System**: In-game communication
- **Spectator Mode**: Watch games without playing

### **Platform Integration**
- **VKontakte**: Native VK platform integration with VK Bridge
- **Telegram**: Telegram Mini App integration with Web App API
- **User Authentication**: Platform-specific user data integration
- **Avatar Management**: Unified `userAvatar` field across platforms
- **Social Features**: Friend invites and sharing

## 📱 **Platform Support**

### **VKontakte Platform**
- **Integration**: VK Bridge for seamless app functionality
- **User Data**: VK user information and authentication
- **Deployment**: Production-ready VK app deployment
- **Script**: `./scripts/set-vk.sh`

### **Telegram Mini App**
- **Integration**: Telegram Web App API
- **User Data**: Telegram user information and authentication
- **Deployment**: Production-ready Telegram Mini App
- **Script**: `./scripts/set-telegram.sh`

### **Development Environment**
- **Platform**: Web browser for local development
- **Features**: Debug tools, player selection, mock data
- **Script**: `./scripts/set-development.sh`

## 🛠️ **Available Scripts**

### **Environment Management**
```bash
# Check current environment
./scripts/check-environment.sh

# Set development mode
./scripts/set-development.sh

# Set VK production mode
./scripts/set-vk.sh

# Set Telegram production mode
./scripts/set-telegram.sh

# Toggle between all environments
./scripts/toggle-environment.sh
```

### **Testing & Development**
```bash
# Interactive test runner
./scripts/run-tests.sh

# Start multiplayer server
./server-scripts/start-multiplayer.sh

# Show all available scripts
./scripts/list-scripts.sh
```

## 🧪 **Testing**

### **Test Categories**
- **Environment Tests**: Configuration and import verification
- **AI Bot Tests**: Scene management and game logic
- **Game Mechanics Tests**: Card handling, betting, turn management
- **Chat Tests**: Communication system
- **Connection Tests**: Network and multiplayer
- **UI Tests**: User interface components
- **Platform Integration Tests**: VK and Telegram integration
- **Avatar Management Tests**: `userAvatar` field functionality

### **Test Coverage**
- **Total Tests**: 71+ comprehensive test files
- **Platform Tests**: VK and Telegram integration tests
- **Avatar Tests**: Cross-platform avatar consistency
- **Environment Tests**: All three environment configurations

## 📚 **Documentation**

### **Core Documentation**
- **[Main README](docs/README.md)**: Complete project overview
- **[Scripts Documentation](scripts/README.md)**: Script reference
- **[Telegram Integration](docs/TELEGRAM_README.md)**: Telegram guide
- **[Changelog](CHANGELOG.md)**: Complete change history

### **Platform Documentation**
- **[Environment Scripts](docs/ENVIRONMENT_SCRIPTS_README.md)**: Environment guide
- **[Server Documentation](server/README.md)**: Multiplayer server guide
- **[Server Scripts](server-scripts/README.md)**: Server automation

## 🔄 **Recent Major Changes (v2.1.0)**

### **Avatar Management Refactoring**
- **BREAKING CHANGE**: Refactored from `photo_200` to `userAvatar` field
- **Improvement**: Unified avatar field naming across all platforms
- **Files Updated**: All game scenes, platform integration scripts, and test files

### **Script Organization**
- **Renamed**: `set-production.sh` → `set-vk.sh` for clarity
- **Moved**: Server scripts to dedicated `server-scripts/` directory
- **Updated**: All documentation and references

### **Telegram Mini App Integration**
- **New Feature**: Full Telegram Mini App support
- **Added**: `set-telegram.sh` script for Telegram environment
- **Added**: `telegramlogic.js` for Telegram Web App API integration
- **Added**: Comprehensive Telegram integration documentation

### **Three-Environment System**
- **Development**: Debug features, player selection, mock data
- **ProductionVK**: VK platform integration, production features
- **ProductionTelegram**: Telegram Mini App integration, production features

## 🚀 **Quick Start**

### **Development**
```bash
# 1. Set development environment
./scripts/set-development.sh

# 2. Start development server
python3 -m http.server 8000

# 3. Open game in browser
open http://localhost:8000
```

### **Production Deployment**

#### **VKontakte Platform**
```bash
# 1. Set VK production environment
./scripts/set-vk.sh

# 2. Start multiplayer server (optional)
./server-scripts/start-multiplayer.sh

# 3. Deploy to VKontakte platform
```

#### **Telegram Mini App**
```bash
# 1. Set Telegram production environment
./scripts/set-telegram.sh

# 2. Start multiplayer server (optional)
./server-scripts/start-multiplayer.sh

# 3. Deploy to Telegram Mini App platform
```

## 📊 **Project Statistics**

- **Total Scripts**: 8 organized scripts (including server scripts)
- **Test Files**: 71+ comprehensive tests including platform integration
- **Source Files**: 20+ organized modules with platform integration
- **Environments**: 3 supported environments (Development, VK, Telegram)
- **Feature Flags**: 5 configurable flags
- **Platforms**: 2 production platforms (VKontakte, Telegram)
- **Avatar Management**: Unified `userAvatar` field across platforms

## 🎯 **Current Status**

- **Environment**: Development mode (debug features enabled)
- **Avatar System**: Unified `userAvatar` field across all platforms
- **Script Organization**: Clean, organized script structure
- **Documentation**: Comprehensive and up-to-date
- **Testing**: Full test coverage for all features
- **Platform Support**: VKontakte and Telegram Mini App ready
- **Git Hooks**: Automated environment management for deployment

## 🔧 **Git Hooks**

### **Pre-push Hook**
- **Purpose**: Automatic environment management for gh-pages deployment
- **Trigger**: Push to `gh-pages` branch
- **Action**: Sets environment to VK production automatically
- **Safety**: Creates backups and provides restoration on failure
- **Benefits**: Ensures production-ready deployment without manual intervention

## 🔮 **Future Roadmap**

### **Potential Enhancements**
- **Additional Platforms**: Support for more social platforms
- **Advanced Features**: Enhanced multiplayer capabilities
- **Performance**: Optimization for mobile platforms
- **Analytics**: Platform-specific analytics integration

### **Maintenance**
- **Documentation**: Keep documentation updated with new features
- **Testing**: Maintain comprehensive test coverage
- **Scripts**: Regular script maintenance and updates
- **Platforms**: Monitor platform API changes

---

*This project represents a modern, multi-platform poker game with comprehensive testing, documentation, and deployment automation.* 