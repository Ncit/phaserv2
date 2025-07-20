# Scripts Directory

This directory contains all shell scripts for the poker game project. Scripts are organized by functionality and provide automation for common development tasks.

## 🚀 **Quick Start**

```bash
# From project root, run any script
./scripts/check-environment.sh
./scripts/run-tests.sh
./scripts/set-development.sh
```

## 📋 **Script Categories**

### 🔧 **Environment Management**
Scripts for managing environment configuration and feature flags.

#### `check-environment.sh`
**Purpose**: Display current environment status and feature flags
**Usage**: `./scripts/check-environment.sh`
**Features**:
- Shows current environment (development/staging/productionVK)
- Lists all feature flags and their status
- Displays environment detection method
- Shows global configuration object

#### `set-development.sh`
**Purpose**: Set environment to development mode
**Usage**: `./scripts/set-development.sh`
**Features**:
- Modifies `detectEnvironment()` function to return 'development'
- Enables debug features and logging
- Disables production-specific features
- Provides confirmation of changes

#### `set-vk.sh`
**Purpose**: Set environment to VK production mode
**Usage**: `./scripts/set-vk.sh`
**Features**:
- Modifies `detectEnvironment()` function to return 'productionVK'
- Disables debug features
- Enables VK-specific production features
- Provides confirmation of changes

#### `toggle-environment.sh`
**Purpose**: Toggle between development, VK production, and Telegram production modes
**Usage**: `./scripts/toggle-environment.sh`
**Features**:
- Cycles through all three environments (development → VK → Telegram → development)
- Maintains environment state between toggles
- Shows before/after environment status
- Provides confirmation of changes

### 🧪 **Testing & Development**
Scripts for running tests and development tasks.

#### `run-tests.sh`
**Purpose**: Interactive test runner for all game tests
**Usage**: `./scripts/run-tests.sh`
**Features**:
- Categorized test selection (Environment, AI Bot, Game Mechanics, etc.)
- Automatic server detection and startup
- Browser opening for selected tests
- Comprehensive test list with descriptions
- Cross-platform compatibility (macOS/Linux)

#### `set-telegram.sh`
**Purpose**: Set environment to Telegram production mode
**Usage**: `./scripts/set-telegram.sh`
**Features**:
- Modifies `detectEnvironment()` function to return 'productionTelegram'
- Disables debug features
- Enables Telegram-specific production features
- Provides confirmation of changes

#### `start-multiplayer.sh` (Moved to server-scripts/)
**Purpose**: Start the multiplayer game server
**Usage**: `./server-scripts/start-multiplayer.sh`
**Features**:
- Starts Node.js server for multiplayer functionality
- Handles server dependencies
- Provides server status information
- Background server execution

### 📚 **Documentation & Help**
Scripts for project documentation and help.

#### `list-scripts.sh`
**Purpose**: Display help information for all available scripts
**Usage**: `./scripts/list-scripts.sh`
**Features**:
- Lists all scripts with descriptions
- Shows usage examples
- Provides quick command reference
- Categorized script organization

## 🎯 **Script Functions**

### Environment Configuration
```bash
# Check current environment
./scripts/check-environment.sh

# Set to development mode
./scripts/set-development.sh

# Set to VK production mode
./scripts/set-vk.sh

# Set to Telegram production mode
./scripts/set-telegram.sh

# Toggle between modes
./scripts/toggle-environment.sh
```

### Testing
```bash
# Run interactive test runner
./scripts/run-tests.sh

# Start multiplayer server
./server-scripts/start-multiplayer.sh
```

### Help & Documentation
```bash
# Show all scripts and usage
./scripts/list-scripts.sh
```

## 🔧 **Environment Feature Flags**

The environment scripts manage these feature flags:

| Flag | Development | ProductionVK | ProductionTelegram | Description |
|------|-------------|--------------|-------------------|-------------|
| `playerSelection` | ✅ | ❌ | ❌ | Debug player selection UI |
| `debugLogging` | ✅ | ❌ | ❌ | Console logging and debugging |
| `mockData` | ✅ | ❌ | ❌ | Mock data for testing |
| `ngrokHeaders` | ✅ | ✅ | ✅ | Ngrok tunnel headers |
| `verboseErrors` | ✅ | ❌ | ❌ | Detailed error messages |

## 📁 **File Structure**

```
scripts/
├── README.md                    # This documentation
├── check-environment.sh         # Environment status checker
├── set-development.sh           # Set development environment
├── set-vk.sh                    # Set VK production environment
├── set-telegram.sh              # Set Telegram production environment
├── toggle-environment.sh        # Toggle between all environments
├── run-tests.sh                 # Interactive test runner
└── list-scripts.sh              # Script help and documentation
```

## 🚀 **Usage Examples**

### Development Workflow
```bash
# 1. Set development environment
./scripts/set-development.sh

# 2. Check environment status
./scripts/check-environment.sh

# 3. Run tests
./scripts/run-tests.sh

# 4. Start multiplayer server
./server-scripts/start-multiplayer.sh
```

### Production Preparation

#### VK Platform
```bash
# 1. Set VK production environment
./scripts/set-vk.sh

# 2. Verify environment
./scripts/check-environment.sh

# 3. Test production features
./scripts/run-tests.sh
```

#### Telegram Platform
```bash
# 1. Set Telegram production environment
./scripts/set-telegram.sh

# 2. Verify environment
./scripts/check-environment.sh

# 3. Test production features
./scripts/run-tests.sh
```

### Quick Environment Switch
```bash
# Toggle between all environments (development → VK → Telegram → development)
./scripts/toggle-environment.sh

# Check current status
./scripts/check-environment.sh
```

## 🔍 **Troubleshooting**

### Common Issues

#### Script Permission Denied
```bash
# Fix script permissions
chmod +x scripts/*.sh
```

#### Environment Not Detected
```bash
# Check environment configuration
./scripts/check-environment.sh

# Verify EnvironmentConfig.js file
cat src/config/EnvironmentConfig.js
```

#### Tests Not Loading
```bash
# Start development server
python3 -m http.server 8000

# Run test runner
./scripts/run-tests.sh
```

#### Server Not Starting
```bash
# Check Node.js installation
node --version

# Install dependencies
cd server && npm install

# Start server
./server-scripts/start-multiplayer.sh
```

### Debug Commands
```bash
# Check all script permissions
ls -la scripts/

# Verify script syntax
bash -n scripts/*.sh

# Test individual scripts
./scripts/check-environment.sh
```

## 📝 **Creating New Scripts**

When adding new scripts:

1. **Use descriptive names**: `[action]-[target].sh`
2. **Add shebang**: `#!/bin/bash`
3. **Include help text**: Add usage information
4. **Make executable**: `chmod +x scripts/new-script.sh`
5. **Update this README**: Document the new script
6. **Test thoroughly**: Verify functionality

### Script Template
```bash
#!/bin/bash

# Script Name: [Name]
# Purpose: [Description]
# Usage: ./scripts/[script-name].sh

echo "Script description"
echo "=================="

# Script logic here

echo "✅ Script completed successfully"
```

## 🔗 **Related Files**

- `src/config/EnvironmentConfig.js` - Environment configuration
- `tests/` - Test files directory
- `server/` - Multiplayer server files
- `docs/ENVIRONMENT_SCRIPTS_README.md` - Detailed environment documentation

## 📊 **Script Statistics**

- **Total Scripts**: 7
- **Environment Scripts**: 4
- **Testing Scripts**: 1
- **Server Scripts**: 1
- **Documentation Scripts**: 1

## 🎯 **Best Practices**

1. **Always check environment** before making changes
2. **Use descriptive script names** for clarity
3. **Test scripts** after environment changes
4. **Keep scripts focused** on single responsibilities
5. **Document changes** in this README
6. **Use consistent naming** conventions
7. **Handle errors gracefully** in scripts
8. **Provide clear feedback** to users

## 🚀 **Quick Reference**

| Action | Command |
|--------|---------|
| Check Environment | `./scripts/check-environment.sh` |
| Set Development | `./scripts/set-development.sh` |
| Set Production | `./scripts/set-vk.sh` |
| Toggle Environment | `./scripts/toggle-environment.sh` |
| Run Tests | `./scripts/run-tests.sh` |
| Start Server | `./server-scripts/start-multiplayer.sh` |
| Show Help | `./scripts/list-scripts.sh` | 