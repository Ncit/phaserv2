# Poker Game v2

A modern multiplayer poker game built with Phaser.js, featuring AI bots, real-time multiplayer, and multi-platform integration (VKontakte & Telegram Mini Apps).

## 🚀 **Quick Start**

### Prerequisites
- Node.js (for multiplayer server)
- Python 3 (for development server)
- Modern web browser

### Development Setup
```bash
# 1. Set development environment
./scripts/set-development.sh

# 2. Start development server
python3 -m http.server 8000

# 3. Open game in browser
open http://localhost:8000
```

### Production Setup

#### VKontakte Platform
```bash
# 1. Set VK production environment
./scripts/set-vk.sh

# 2. Start multiplayer server (optional)
./scripts/start-multiplayer.sh

# 3. Deploy to VKontakte platform
```

#### Telegram Mini App
```bash
# 1. Set Telegram production environment
./scripts/set-telegram.sh

# 2. Start multiplayer server (optional)
./scripts/start-multiplayer.sh

# 3. Deploy to Telegram Mini App platform
```

## 📁 **Project Structure**

```
pokerv2/
├── 📁 client/src/                    # Source code
│   ├── 📁 config/            # Configuration files
│   ├── 📁 managers/          # Game managers
│   ├── 📁 scenes/            # Phaser game scenes
│   ├── 📁 scripts/           # Platform integration scripts
│   ├── 📁 utils/             # Utility functions
│   └── main.js               # Main entry point
├── 📁 scripts/               # Automation scripts
│   ├── 🔧 Environment management
│   ├── 🧪 Testing tools
│   ├── 🚀 Server scripts
│   └── 📚 Documentation
├── 📁 server-scripts/        # Server automation scripts
│   ├── start-multiplayer.sh  # Multiplayer server startup
│   ├── test-server.js        # Server testing
│   └── README.md             # Server documentation
├── 📁 tests/                 # Test files
│   ├── 🧪 Environment tests
│   ├── 🎮 Game functionality tests
│   ├── 📱 Platform integration tests
│   └── 📋 Comprehensive documentation
├── 📁 assets/                # Game assets
├── 📁 dependencies/          # External libraries
├── 📁 server/                # Multiplayer server
└── 📄 Documentation files
```

## 🛠️ **Available Scripts**

### Environment Management
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

### Testing & Development
```bash
# Interactive test runner
./scripts/run-tests.sh

# Start multiplayer server
./scripts/start-multiplayer.sh
```

### Help & Documentation
```bash
# Show all available scripts
./scripts/list-scripts.sh
```

## 🎮 **Game Features**

### Core Gameplay
- **Texas Hold'em Poker**: Standard poker rules
- **Multiplayer Support**: Real-time multiplayer games
- **AI Bots**: Intelligent computer opponents
- **Chat System**: In-game communication
- **Spectator Mode**: Watch games without playing

### Platform Integration
- **VKontakte**: Native VK platform integration with VK Bridge
- **Telegram**: Telegram Mini App integration with Web App API
- **User Authentication**: Platform-specific user data integration
- **Avatar Management**: Unified `userAvatar` field across platforms
- **Social Features**: Friend invites and sharing

### Development Features
- **Environment Configuration**: Flexible environment management
- **Feature Flags**: Granular feature control
- **Debug Tools**: Comprehensive debugging support
- **Test Suite**: Extensive test coverage

## 🔧 **Environment Configuration**

The game supports three environments with feature flags:

| Environment | Debug Features | Production Features | Platform | Use Case |
|-------------|----------------|-------------------|----------|----------|
| **Development** | ✅ All enabled | ❌ Disabled | Web Browser | Local development |
| **ProductionVK** | ❌ Disabled | ✅ All enabled | VKontakte | VK platform deployment |
| **ProductionTelegram** | ❌ Disabled | ✅ All enabled | Telegram | Telegram Mini App deployment |

### Feature Flags
- `playerSelection`: Debug player selection UI
- `debugLogging`: Console logging and debugging
- `mockData`: Mock data for testing
- `ngrokHeaders`: Ngrok tunnel headers
- `verboseErrors`: Detailed error messages

## 🧪 **Testing**

### Running Tests
```bash
# Interactive test runner
./scripts/run-tests.sh

# Direct test access
open http://localhost:8000/tests/test-environment-config.html
```

### Test Categories
- **Environment Tests**: Configuration and import verification
- **AI Bot Tests**: Scene management and game logic
- **Game Mechanics Tests**: Card handling, betting, turn management
- **Chat Tests**: Communication system
- **Connection Tests**: Network and multiplayer
- **UI Tests**: User interface components
- **Platform Integration Tests**: VK and Telegram integration
- **Avatar Management Tests**: `userAvatar` field functionality

## 🚀 **Deployment**

### Development
```bash
# Set development environment
./scripts/set-development.sh

# Start development server
python3 -m http.server 8000

# Run tests
./scripts/run-tests.sh
```

### Production

#### VKontakte Platform
```bash
# Set VK production environment
./scripts/set-vk.sh

# Start multiplayer server
./scripts/start-multiplayer.sh

# Deploy to VKontakte
```

#### Telegram Mini App
```bash
# Set Telegram production environment
./scripts/set-telegram.sh

# Start multiplayer server
./scripts/start-multiplayer.sh

# Deploy to Telegram Mini App
```

## 📚 **Documentation**

- **[Scripts Documentation](scripts/README.md)**: Complete script reference
- **[Telegram Integration](TELEGRAM_README.md)**: Telegram Mini App integration guide
- **[Environment Scripts](ENVIRONMENT_SCRIPTS_README.md)**: Environment management guide
- **[Server Documentation](server/README.md)**: Multiplayer server guide
- **[Server Scripts](server-scripts/README.md)**: Server automation scripts
- **[Changelog](CHANGELOG.md)**: Complete project change history

## 🔍 **Troubleshooting**

### Common Issues

#### Environment Problems
```bash
# Check environment status
./scripts/check-environment.sh

# Reset to development
./scripts/set-development.sh
```

#### Test Issues
```bash
# Start development server
python3 -m http.server 8000

# Run test runner
./scripts/run-tests.sh
```

#### Server Issues
```bash
# Check Node.js
node --version

# Install dependencies
cd server && npm install

# Start server
./server-scripts/start-multiplayer.sh
```

### Debug Commands
```bash
# Check all script permissions
chmod +x scripts/*.sh

# Verify script syntax
bash -n scripts/*.sh

# Test environment configuration
./scripts/check-environment.sh
```

## 🤝 **Contributing**

### Development Workflow
1. **Set development environment**: `./scripts/set-development.sh`
2. **Make changes**: Edit source files
3. **Run tests**: `./scripts/run-tests.sh`
4. **Test functionality**: Use development server
5. **Test platform integration**: Use platform-specific tests
6. **Commit changes**: Follow project conventions

### Recent Major Changes
- **Avatar Management**: Refactored from `photo_200` to `userAvatar` for consistency
- **Script Organization**: Renamed `set-production.sh` to `set-vk.sh` for clarity
- **Server Scripts**: Moved to dedicated `server-scripts/` directory
- **Telegram Integration**: Added full Telegram Mini App support
- **Environment Management**: Enhanced with three-environment system

### Code Organization
- **Source Code**: `client/src/` directory with platform integration scripts
- **Scripts**: `scripts/` directory for environment management
- **Server Scripts**: `server-scripts/` directory for server automation
- **Tests**: `tests/` directory with platform integration tests
- **Assets**: `assets/` directory with game resources
- **Documentation**: README files in each directory

## 📊 **Project Statistics**

- **Total Scripts**: 8 organized scripts (including server scripts)
- **Test Files**: 71+ comprehensive tests including platform integration
- **Source Files**: 20+ organized modules with platform integration
- **Environments**: 3 supported environments (Development, VK, Telegram)
- **Feature Flags**: 5 configurable flags
- **Platforms**: 2 production platforms (VKontakte, Telegram)
- **Avatar Management**: Unified `userAvatar` field across platforms

## 🎯 **Quick Reference**

| Action | Command |
|--------|---------|
| Check Environment | `./scripts/check-environment.sh` |
| Set Development | `./scripts/set-development.sh` |
| Set VK Production | `./scripts/set-vk.sh` |
| Set Telegram Production | `./scripts/set-telegram.sh` |
| Toggle Environments | `./scripts/toggle-environment.sh` |
| Run Tests | `./scripts/run-tests.sh` |
| Start Server | `./server-scripts/start-multiplayer.sh` |
| Show Help | `./scripts/list-scripts.sh` |

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Phaser.js**: Game framework
- **VK Bridge**: VKontakte integration
- **Telegram Web App API**: Telegram Mini App integration
- **Socket.io**: Real-time multiplayer
- **Node.js**: Server runtime 