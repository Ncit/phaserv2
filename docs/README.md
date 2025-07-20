# Documentation Directory

This directory contains all documentation for the poker game project. Documentation is organized by functionality and provides comprehensive guides for development, features, and troubleshooting.

## 📚 **Documentation Categories**

### 🏠 **Project Overview**
- **[README.md](README.md)** - Main project documentation and quick start guide

### 🔧 **Environment & Configuration**
- **[ENVIRONMENT_SCRIPTS_README.md](ENVIRONMENT_SCRIPTS_README.md)** - Environment management scripts guide
- **[ENVIRONMENT_MIGRATION_GUIDE.md](ENVIRONMENT_MIGRATION_GUIDE.md)** - Migration from window.isDebug to EnvironmentConfig

### 🤖 **AI Bot Features**
- **[AI_BOT_README.md](AI_BOT_README.md)** - AI bot functionality overview
- **[AIBOT_BLACK_SCREEN_FIX.md](AIBOT_BLACK_SCREEN_FIX.md)** - Black screen issue fixes
- **[ENHANCED_AI_README.md](ENHANCED_AI_README.md)** - Enhanced AI bot features
- **[NEW_AI_BOT_SCENE_APPROACH.md](NEW_AI_BOT_SCENE_APPROACH.md)** - New AI bot scene implementation

### 🎮 **Game Mechanics**
- **[ALL_IN_FIX.md](ALL_IN_FIX.md)** - All-in functionality fixes
- **[AUTO_ALLIN_FEATURE.md](AUTO_ALLIN_FEATURE.md)** - Automatic all-in feature
- **[RAISE_FIX.md](RAISE_FIX.md)** - Raise button functionality fixes
- **[RAISE_BUTTON_DISABLE_FIX.md](RAISE_BUTTON_DISABLE_FIX.md)** - Raise button disable logic
- **[TURN_MANAGEMENT_FIX.md](TURN_MANAGEMENT_FIX.md)** - Turn management system fixes
- **[STACK_OVERFLOW_FIX.md](STACK_OVERFLOW_FIX.md)** - Stack overflow issue resolution

### 🔗 **Multiplayer & Networking**
- **[MULTIPLAYER_README.md](MULTIPLAYER_README.md)** - Multiplayer functionality overview
- **[SINGLE_ROOM_README.md](SINGLE_ROOM_README.md)** - Single room game implementation
- **[RECONNECTION_BUTTON_FIX.md](RECONNECTION_BUTTON_FIX.md)** - Reconnection functionality fixes
- **[ROOM_RESET_FEATURE.md](ROOM_RESET_FEATURE.md)** - Room reset functionality
- **[NGROK_HEADERS_README.md](NGROK_HEADERS_README.md)** - Ngrok tunnel headers setup

### 👥 **Player Management**
- **[DEBUG_PLAYER_SELECTION.md](DEBUG_PLAYER_SELECTION.md)** - Debug player selection system
- **[SPECTATOR_FUNCTIONALITY.md](SPECTATOR_FUNCTIONALITY.md)** - Spectator mode implementation

### 🧪 **Testing & Debugging**
- **[THREE_ALLIN_TEST.md](THREE_ALLIN_TEST.md)** - Three-player all-in test scenarios

## 📋 **Documentation Index**

### Quick Reference
| Category | Documents | Description |
|----------|-----------|-------------|
| **Project** | 1 | Main project overview and setup |
| **Environment** | 2 | Configuration and environment management |
| **AI Bot** | 4 | AI bot features and fixes |
| **Game Mechanics** | 6 | Core game functionality |
| **Multiplayer** | 5 | Networking and multiplayer features |
| **Player Management** | 2 | Player and spectator features |
| **Testing** | 1 | Test scenarios and debugging |

### Feature-Specific Documentation

#### 🎯 **Core Game Features**
- **All-in System**: [ALL_IN_FIX.md](ALL_IN_FIX.md), [AUTO_ALLIN_FEATURE.md](AUTO_ALLIN_FEATURE.md)
- **Betting System**: [RAISE_FIX.md](RAISE_FIX.md), [RAISE_BUTTON_DISABLE_FIX.md](RAISE_BUTTON_DISABLE_FIX.md)
- **Turn Management**: [TURN_MANAGEMENT_FIX.md](TURN_MANAGEMENT_FIX.md)
- **Game Flow**: [STACK_OVERFLOW_FIX.md](STACK_OVERFLOW_FIX.md)

#### 🤖 **AI Bot System**
- **Overview**: [AI_BOT_README.md](AI_BOT_README.md)
- **Issues & Fixes**: [AIBOT_BLACK_SCREEN_FIX.md](AIBOT_BLACK_SCREEN_FIX.md)
- **Enhanced Features**: [ENHANCED_AI_README.md](ENHANCED_AI_README.md)
- **Implementation**: [NEW_AI_BOT_SCENE_APPROACH.md](NEW_AI_BOT_SCENE_APPROACH.md)

#### 🔗 **Multiplayer Features**
- **Overview**: [MULTIPLAYER_README.md](MULTIPLAYER_README.md)
- **Room Management**: [SINGLE_ROOM_README.md](SINGLE_ROOM_README.md), [ROOM_RESET_FEATURE.md](ROOM_RESET_FEATURE.md)
- **Connection**: [RECONNECTION_BUTTON_FIX.md](RECONNECTION_BUTTON_FIX.md)
- **Development**: [NGROK_HEADERS_README.md](NGROK_HEADERS_README.md)

#### 👥 **Player Features**
- **Debug Tools**: [DEBUG_PLAYER_SELECTION.md](DEBUG_PLAYER_SELECTION.md)
- **Spectator Mode**: [SPECTATOR_FUNCTIONALITY.md](SPECTATOR_FUNCTIONALITY.md)

## 🚀 **Getting Started**

### For New Developers
1. **Start with**: [README.md](README.md) - Project overview and setup
2. **Environment setup**: [ENVIRONMENT_SCRIPTS_README.md](ENVIRONMENT_SCRIPTS_README.md)
3. **Feature understanding**: [AI_BOT_README.md](AI_BOT_README.md), [MULTIPLAYER_README.md](MULTIPLAYER_README.md)

### For Feature Development
1. **Check existing fixes**: Look for relevant `.md` files in this directory
2. **Environment configuration**: [ENVIRONMENT_MIGRATION_GUIDE.md](ENVIRONMENT_MIGRATION_GUIDE.md)
3. **Testing**: [THREE_ALLIN_TEST.md](THREE_ALLIN_TEST.md)

### For Bug Fixes
1. **Search for similar issues**: Check existing fix documentation
2. **Environment issues**: [ENVIRONMENT_SCRIPTS_README.md](ENVIRONMENT_SCRIPTS_README.md)
3. **Game mechanics**: Check specific feature documentation

## 📝 **Documentation Standards**

### File Naming Convention
- **Feature Overview**: `[FEATURE]_README.md`
- **Bug Fixes**: `[ISSUE]_FIX.md`
- **New Features**: `[FEATURE]_FEATURE.md`
- **Migration Guides**: `[FROM]_TO_[TO]_GUIDE.md`

### Content Structure
Each documentation file should include:
1. **Purpose**: What the document covers
2. **Problem**: Issue being solved (if applicable)
3. **Solution**: Implementation details
4. **Usage**: How to use the feature
5. **Examples**: Code examples or usage scenarios
6. **Troubleshooting**: Common issues and solutions

## 🔍 **Searching Documentation**

### By Feature
```bash
# Search for AI bot related docs
ls docs/ | grep -i ai

# Search for multiplayer docs
ls docs/ | grep -i multi

# Search for fix documentation
ls docs/ | grep -i fix
```

### By Content
```bash
# Search for specific terms
grep -r "all-in" docs/
grep -r "environment" docs/
grep -r "reconnection" docs/
```

## 📊 **Documentation Statistics**

- **Total Documents**: 22 markdown files
- **Categories**: 7 main categories
- **Feature Docs**: 15 feature-specific documents
- **Fix Docs**: 7 bug fix documents
- **Guide Docs**: 2 migration/guide documents

## 🛠️ **Maintaining Documentation**

### Adding New Documentation
1. **Use consistent naming**: Follow the naming convention
2. **Include in this README**: Add to appropriate category
3. **Update statistics**: Update the document count
4. **Cross-reference**: Link to related documents

### Updating Existing Documentation
1. **Check for accuracy**: Verify information is current
2. **Update links**: Ensure all links work
3. **Add examples**: Include practical usage examples
4. **Review structure**: Follow the content structure

## 🔗 **Related Resources**

- **[Scripts Documentation](../scripts/README.md)** - Automation scripts
- **[Tests Documentation](../tests/README.md)** - Test suite documentation
- **[Server Documentation](../server/README.md)** - Multiplayer server
- **[Source Code](../src/)** - Application source code

## 📚 **Documentation Best Practices**

1. **Keep it current**: Update documentation with code changes
2. **Be specific**: Include exact steps and examples
3. **Use clear language**: Write for the target audience
4. **Include troubleshooting**: Common issues and solutions
5. **Cross-reference**: Link to related documentation
6. **Version control**: Track documentation changes
7. **Review regularly**: Keep documentation accurate and helpful

## 🎯 **Quick Navigation**

### Essential Documents
- **[README.md](README.md)** - Start here for project overview
- **[ENVIRONMENT_SCRIPTS_README.md](ENVIRONMENT_SCRIPTS_README.md)** - Environment setup
- **[AI_BOT_README.md](AI_BOT_README.md)** - AI bot features
- **[MULTIPLAYER_README.md](MULTIPLAYER_README.md)** - Multiplayer setup

### Common Issues
- **[AIBOT_BLACK_SCREEN_FIX.md](AIBOT_BLACK_SCREEN_FIX.md)** - Black screen issues
- **[RECONNECTION_BUTTON_FIX.md](RECONNECTION_BUTTON_FIX.md)** - Connection problems
- **[RAISE_FIX.md](RAISE_FIX.md)** - Betting issues
- **[STACK_OVERFLOW_FIX.md](STACK_OVERFLOW_FIX.md)** - Performance issues 