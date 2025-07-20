# Poker Game v2

A multiplayer poker game built with Phaser.js, featuring AI bots, real-time multiplayer, and VKontakte integration.

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
```bash
# 1. Set production environment
./scripts/set-production.sh

# 2. Start multiplayer server (optional)
./server-scripts/start-multiplayer.sh

# 3. Deploy to VKontakte platform
```

## 📁 **Project Structure**

```
pokerv2/
├── 📁 src/                    # Source code
│   ├── 📁 config/            # Configuration files
│   ├── 📁 managers/          # Game managers
│   ├── 📁 scenes/            # Phaser game scenes
│   ├── 📁 utils/             # Utility functions
│   └── main.js               # Main entry point
├── 📁 scripts/               # Automation scripts
│   ├── 🔧 Environment management
│   ├── 🧪 Testing tools
│   └── 📚 Documentation
├── 📁 server-scripts/         # Server management scripts
│   ├── 🚀 Server startup
│   ├── 🧪 Server testing
│   └── 🔧 Server debugging
├── 📁 docs/                  # Project documentation
│   ├── 📋 Comprehensive guides
│   ├── 🔧 Environment docs
│   ├── 🤖 AI bot docs
│   ├── 🎮 Game mechanics docs
│   └── 🔗 Multiplayer docs
├── 📁 tests/                 # Test files
│   ├── 🧪 Environment tests
│   ├── 🎮 Game functionality tests
│   └── 📋 Comprehensive documentation
├── 📁 assets/                # Game assets
├── 📁 dependencies/          # External libraries
├── 📁 server/                # Multiplayer server
└── 📄 This README
```

## 🛠️ **Available Scripts**

### Environment Management
```bash
# Check current environment
./scripts/check-environment.sh

# Set development mode
./scripts/set-development.sh

# Set production mode
./scripts/set-production.sh

# Toggle between modes
./scripts/toggle-environment.sh
```

### Testing & Development
```bash
# Interactive test runner
./scripts/run-tests.sh

# Start multiplayer server
./server-scripts/start-multiplayer.sh
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
- **VKontakte**: Native VK platform integration
- **VK Bridge**: Seamless VK app functionality
- **User Authentication**: VK user data integration
- **Social Features**: Friend invites and sharing

### Development Features
- **Environment Configuration**: Flexible environment management
- **Feature Flags**: Granular feature control
- **Debug Tools**: Comprehensive debugging support
- **Test Suite**: Extensive test coverage

## 🔧 **Environment Configuration**

The game supports multiple environments with feature flags:

| Environment | Debug Features | Production Features | Use Case |
|-------------|----------------|-------------------|----------|
| **Development** | ✅ All enabled | ❌ Disabled | Local development |
| **Staging** | ⚠️ Limited | ⚠️ Limited | Testing |
| **ProductionVK** | ❌ Disabled | ✅ All enabled | VK platform |

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

## 📚 **Documentation**

### 📋 **Documentation Overview**
All project documentation is organized in the `docs/` directory:

- **[📚 Documentation Index](docs/README.md)** - Complete documentation guide
- **[🔧 Environment Guide](docs/ENVIRONMENT_SCRIPTS_README.md)** - Environment management
- **[🤖 AI Bot Guide](docs/AI_BOT_README.md)** - AI bot functionality
- **[🔗 Multiplayer Guide](docs/MULTIPLAYER_README.md)** - Multiplayer setup

### 🎯 **Quick Documentation Access**

#### For New Developers
1. **[Project Overview](docs/README.md)** - Start here
2. **[Environment Setup](docs/ENVIRONMENT_SCRIPTS_README.md)** - Configuration guide
3. **[AI Bot Features](docs/AI_BOT_README.md)** - AI bot documentation
4. **[Multiplayer Setup](docs/MULTIPLAYER_README.md)** - Networking guide

#### For Feature Development
- **[Game Mechanics](docs/)** - Core game functionality docs
- **[Bug Fixes](docs/)** - Issue resolution documentation
- **[Testing Guide](docs/THREE_ALLIN_TEST.md)** - Test scenarios

#### For Troubleshooting
- **[Common Issues](docs/)** - Fix documentation for known problems
- **[Environment Issues](docs/ENVIRONMENT_SCRIPTS_README.md)** - Configuration problems
- **[Performance Issues](docs/STACK_OVERFLOW_FIX.md)** - Performance optimization

### 📊 **Documentation Categories**
- **Project Overview**: 1 document
- **Environment & Configuration**: 2 documents
- **AI Bot Features**: 4 documents
- **Game Mechanics**: 6 documents
- **Multiplayer & Networking**: 5 documents
- **Player Management**: 2 documents
- **Testing & Debugging**: 1 document

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
```bash
# Set production environment
./scripts/set-production.sh

# Start multiplayer server
./server-scripts/start-multiplayer.sh

# Deploy to VKontakte
```

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
5. **Commit changes**: Follow project conventions

### Code Organization
- **Source Code**: `src/` directory
- **Scripts**: `scripts/` directory
- **Documentation**: `docs/` directory
- **Tests**: `tests/` directory
- **Assets**: `assets/` directory

## 📊 **Project Statistics**

- **Total Scripts**: 7 organized scripts
- **Documentation Files**: 22 comprehensive docs
- **Test Files**: 71 comprehensive tests
- **Source Files**: 20+ organized modules
- **Environments**: 3 supported environments
- **Feature Flags**: 5 configurable flags

## 🎯 **Quick Reference**

| Action | Command |
|--------|---------|
| Check Environment | `./scripts/check-environment.sh` |
| Set Development | `./scripts/set-development.sh` |
| Set Production | `./scripts/set-production.sh` |
| Run Tests | `./scripts/run-tests.sh` |
| Start Server | `./server-scripts/start-multiplayer.sh` |
| Show Help | `./scripts/list-scripts.sh` |
| View Docs | `open docs/README.md` |

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Phaser.js**: Game framework
- **VK Bridge**: VKontakte integration
- **Socket.io**: Real-time multiplayer
- **Node.js**: Server runtime 