# Tests Directory

This directory contains all test files for the poker game. Tests are organized by functionality and can be run individually to verify specific features.

## 🧪 Environment Configuration Tests

### `test-environment-config.html`
**Purpose**: Comprehensive test for the new environment configuration system
**Features**: 
- Environment detection testing
- Feature flag verification
- Environment override testing
**Usage**: Open in browser to test environment configuration

### `test-import-fix.html`
**Purpose**: Test for EnvironmentConfig import/export functionality
**Features**: 
- Import verification
- Constructor testing
- Global object creation
**Usage**: Open in browser to verify import fixes

### `simple-test.html`
**Purpose**: Minimal test for environment configuration
**Features**: 
- Basic constructor test
- Global object verification
- Backward compatibility check
**Usage**: Quick verification of environment system

## 🎮 Game Functionality Tests

### AI Bot Tests
- `test-ai-bot-black-screen.html` - Fixes black screen issues in AI bot scene
- `test-ai-bot-call-fix.html` - Fixes call button functionality in AI bot mode
- `test-enhanced-ai.html` - Tests enhanced AI bot features
- `test-new-ai-bot-scene.html` - Tests new AI bot scene implementation
- `test-unique-ai-bot-scenes.html` - Tests unique AI bot scene instances
- `test_ai_bot.html` - Basic AI bot functionality test

### All-In Tests
- `test-all-in-fix.html` - Fixes all-in functionality
- `test-auto-allin.html` - Tests automatic all-in feature
- `test-three-allin.html` - Tests three-player all-in scenarios

### Button Tests
- `test-button-activation.html` - Tests button activation logic
- `test-button-enable-debug.html` - Tests button enable/disable debugging
- `test-raise-button-disable.html` - Tests raise button disable functionality
- `test-raise-fix.html` - Fixes raise button issues
- `test-raise-limit.html` - Tests raise limit functionality

### Card Tests
- `test-card-container-fix.html` - Fixes card container issues
- `test-card-removal.html` - Tests card removal functionality
- `test-card-revelation.html` - Tests card revelation during showdown
- `test-hidden-cards.html` - Tests hidden card functionality

### Chat Tests
- `test-chat-fix.html` - Fixes chat functionality
- `test-chat-functionality.html` - Tests chat system features
- `test-chat-messages.html` - Tests chat message handling
- `test-chat-positioning.html` - Tests chat UI positioning
- `test-pretty-chat.html` - Tests enhanced chat UI

### Connection Tests
- `test-disconnect-connect.html` - Tests disconnect/reconnect scenarios
- `test-reconnection.html` - Tests reconnection functionality
- `test-reconnection-button-fix.html` - Fixes reconnection button issues
- `test-reconnection-buttons.html` - Tests reconnection button functionality
- `test-reconnection-fix.html` - Fixes reconnection issues
- `test_reconnection_ready_button.html` - Tests ready button after reconnection

### Game Flow Tests
- `test-call-loop-debug.html` - Debug call loop issues
- `test-current-player-disconnect.html` - Tests current player disconnection
- `test-final-fixes.html` - Comprehensive final fixes
- `test-infinite-loop-fix.html` - Fixes infinite loop issues
- `test-infinite-loop-fix-v2.html` - Updated infinite loop fixes
- `test-next-round-reset.html` - Tests next round reset functionality
- `test-turn-detection-debug.html` - Debug turn detection issues
- `test-turn-fix.html` - Fixes turn management issues
- `test-turn-indicator.html` - Tests turn indicator functionality
- `test-turn-management-fix.html` - Fixes turn management

### Lobby Tests
- `test-lobby-count.html` - Tests lobby player count
- `test-lobby-system.html` - Tests lobby system functionality
- `test-join-restriction.html` - Tests join restrictions

### Player Tests
- `test-all-players-active.html` - Tests all players active state
- `test-debug-players.html` - Tests debug player functionality
- `test-hide-disconnected-players.html` - Tests hiding disconnected players
- `test-new-player-reset.html` - Tests new player reset functionality
- `test-player-leave-cards.html` - Tests player leave card handling
- `test-player-leave-reset.html` - Tests player leave reset functionality

### Ready Button Tests
- `test-ready-button.html` - Tests ready button functionality
- `test-ready-money.html` - Tests ready money functionality
- `test_ready_button_reset.html` - Tests ready button reset

### Room Tests
- `test-room-empty-reset.html` - Tests room empty reset
- `test-room-reset.html` - Tests room reset functionality
- `test-room-reset-one-player.html` - Tests room reset with one player
- `test-simple-join-reset.html` - Tests simple join reset
- `test-single-room.html` - Tests single room functionality
- `test-single-room-new.html` - Tests new single room implementation

### Server Tests
- `test-server-client-sync.html` - Tests server-client synchronization
- `test-ngrok-headers.html` - Tests ngrok headers functionality

### Spectator Tests
- `test-spectator-cards-hidden.html` - Tests spectator card hiding
- `test-spectator-functionality.html` - Tests spectator functionality
- `test-spectator-join.html` - Tests spectator join functionality

### UI Tests
- `test-ui-updates.html` - Tests UI update functionality
- `test-winner-display.html` - Tests winner display functionality

### Game Logic Tests
- `test-showdown-no-rotation.html` - Tests showdown without card rotation
- `test-stack-overflow-fix.html` - Fixes stack overflow issues
- `test-reconnect-auto-fold.html` - Tests auto-fold on reconnect

## 🚀 Running Tests

### Individual Tests
```bash
# Start the development server
python3 -m http.server 8000

# Open specific test in browser
open http://localhost:8000/tests/test-environment-config.html
```

### Environment Tests
```bash
# Test environment configuration
open http://localhost:8000/tests/test-environment-config.html

# Test import functionality
open http://localhost:8000/tests/test-import-fix.html

# Quick environment test
open http://localhost:8000/tests/simple-test.html
```

### Game Tests
```bash
# Test AI bot functionality
open http://localhost:8000/tests/test-ai-bot-black-screen.html

# Test chat system
open http://localhost:8000/tests/test-chat-functionality.html

# Test reconnection
open http://localhost:8000/tests/test-reconnection.html
```

## 📋 Test Categories

### 🔧 **Environment & Configuration**
- Environment detection
- Feature flags
- Import/export functionality

### 🤖 **AI Bot**
- Scene management
- Game logic
- Player interaction

### 🃏 **Game Mechanics**
- Card handling
- Betting system
- Turn management

### 💬 **Communication**
- Chat system
- Network connectivity
- Reconnection handling

### 🎮 **User Interface**
- Button functionality
- Player display
- Game flow

### 🔗 **Network & Multiplayer**
- Server synchronization
- Room management
- Player connections

## 📝 Test Naming Convention

- `test-[feature]-[specific-issue].html` - Tests specific functionality or fixes
- `test-[component]-[action].html` - Tests component actions
- `test-[scenario].html` - Tests specific scenarios

## 🛠️ Creating New Tests

When creating new tests:

1. **Use descriptive names**: `test-[feature]-[purpose].html`
2. **Include purpose in comments**: Add header comments explaining what the test does
3. **Test one feature at a time**: Keep tests focused on specific functionality
4. **Include setup instructions**: Document any special setup requirements
5. **Add to this README**: Update the documentation when adding new tests

## 🔍 Debugging Tests

### Common Issues
- **CORS errors**: Make sure to serve files from a web server
- **Import errors**: Check that all dependencies are loaded
- **Environment issues**: Verify environment configuration is correct

### Debug Tools
- Browser Developer Tools (F12)
- Console logging
- Network tab for request debugging
- Environment configuration scripts (`../scripts/check-environment.sh`) 