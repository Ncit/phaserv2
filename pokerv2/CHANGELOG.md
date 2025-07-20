# Changelog

All notable changes to the Poker Game v2 project will be documented in this file.

## [2.1.0] - 2025-07-20

### 🎯 **Major Changes**

#### **Avatar Management Refactoring**
- **BREAKING CHANGE**: Refactored from `photo_200` to `userAvatar` field
- **Improvement**: Unified avatar field naming across all platforms
- **Backward Compatibility**: Maintained during transition period
- **Files Updated**: All game scenes, platform integration scripts, and test files

#### **Script Organization**
- **Renamed**: `set-production.sh` → `set-vk.sh` for clarity
- **Moved**: Server scripts to dedicated `server-scripts/` directory
- **Updated**: All documentation and references to reflect new organization

#### **Telegram Mini App Integration**
- **New Feature**: Full Telegram Mini App support
- **Added**: `set-telegram.sh` script for Telegram environment
- **Added**: `telegramlogic.js` for Telegram Web App API integration
- **Added**: Comprehensive Telegram integration documentation

### 🔧 **Environment Management**

#### **Three-Environment System**
- **Development**: Debug features, player selection, mock data
- **ProductionVK**: VK platform integration, production features
- **ProductionTelegram**: Telegram Mini App integration, production features

#### **Enhanced Toggle System**
- **Updated**: `toggle-environment.sh` now cycles through all three environments
- **Improved**: Better environment detection and status reporting
- **Added**: Platform-specific feature flags and configurations

### 📁 **Project Structure**

#### **New Directories**
- **`server-scripts/`**: Dedicated server automation scripts
- **`src/scripts/`**: Platform integration scripts (VK, Telegram)

#### **Reorganized Files**
- **Moved**: `start-multiplayer.sh` to `server-scripts/`
- **Moved**: `test-server.js` to `server-scripts/`
- **Moved**: `test-websocket.js` to `server-scripts/`
- **Moved**: `test-allin-setup.js` to `server-scripts/`

### 🧪 **Testing Improvements**

#### **Platform Integration Tests**
- **Added**: `test-telegram-integration.html` for Telegram functionality
- **Updated**: All test files to use `userAvatar` instead of `photo_200`
- **Enhanced**: Test coverage for multi-platform scenarios

#### **Avatar Management Tests**
- **Added**: Tests for `userAvatar` field functionality
- **Updated**: Avatar URL fallback patterns
- **Verified**: Cross-platform avatar consistency

### 📚 **Documentation Updates**

#### **Main Documentation**
- **Updated**: `docs/README.md` with new project structure
- **Added**: Telegram Mini App deployment instructions
- **Updated**: Environment configuration tables
- **Added**: Recent changes section

#### **Script Documentation**
- **Updated**: `scripts/README.md` with new script names
- **Added**: `set-telegram.sh` documentation
- **Updated**: Environment toggle documentation
- **Added**: Server scripts documentation

#### **Platform Documentation**
- **Added**: `docs/TELEGRAM_README.md` comprehensive Telegram guide
- **Updated**: Platform integration examples
- **Added**: Deployment instructions for both platforms

### 🔄 **Code Quality**

#### **Avatar Field Consistency**
- **Standardized**: All avatar references use `userAvatar`
- **Cleaned**: Removed legacy `photo_200` references
- **Improved**: Better field naming across platforms

#### **Platform Integration**
- **Enhanced**: VK Bridge integration with proper field mapping
- **Added**: Telegram Web App API integration
- **Improved**: Environment detection and initialization

### 🚀 **Deployment**

#### **Multi-Platform Support**
- **VKontakte**: Production deployment with VK Bridge
- **Telegram**: Mini App deployment with Web App API
- **Development**: Local development with debug features

#### **Environment Scripts**
- **`set-development.sh`**: Development environment setup
- **`set-vk.sh`**: VK production environment setup
- **`set-telegram.sh`**: Telegram production environment setup
- **`toggle-environment.sh`**: Cycle through all environments

### 🐛 **Bug Fixes**

#### **Avatar Management**
- **Fixed**: Inconsistent avatar field usage across platforms
- **Fixed**: Avatar URL fallback patterns
- **Fixed**: Platform-specific avatar loading

#### **Script Organization**
- **Fixed**: Script naming inconsistencies
- **Fixed**: Documentation references to old script names
- **Fixed**: Server script organization

### 📊 **Statistics**

#### **Files Changed**
- **Core Files**: 15+ game scenes and managers
- **Scripts**: 8 environment and server scripts
- **Tests**: 71+ test files updated
- **Documentation**: 5+ documentation files

#### **New Features**
- **Platforms**: 2 production platforms (VK, Telegram)
- **Environments**: 3 environment configurations
- **Scripts**: 8 organized automation scripts
- **Tests**: Platform integration test suite

### 🔮 **Future Considerations**

#### **Potential Enhancements**
- **Additional Platforms**: Support for more social platforms
- **Advanced Features**: Enhanced multiplayer capabilities
- **Performance**: Optimization for mobile platforms
- **Analytics**: Platform-specific analytics integration

#### **Maintenance**
- **Documentation**: Keep documentation updated with new features
- **Testing**: Maintain comprehensive test coverage
- **Scripts**: Regular script maintenance and updates
- **Platforms**: Monitor platform API changes

---

## [2.0.0] - 2025-07-11

### 🎯 **Initial Release**
- **Base Game**: Texas Hold'em poker with AI bots
- **Multiplayer**: Real-time multiplayer support
- **VK Integration**: VKontakte platform integration
- **Basic Scripts**: Environment management scripts
- **Testing**: Comprehensive test suite

---

*For detailed information about specific changes, see the individual commit messages and documentation files.* 