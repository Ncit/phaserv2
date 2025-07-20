# Telegram Mini App Integration

This document provides comprehensive information about the Telegram Mini App integration for the poker game.

## 📱 **Overview**

The poker game now supports Telegram Mini Apps, allowing players to enjoy the game directly within the Telegram platform. This integration provides seamless user experience with native Telegram features like user authentication, UI components, and platform-specific optimizations.

## 🚀 **Quick Start**

### 1. **Set Telegram Environment**
```bash
# Set environment to Telegram production mode
./scripts/set-telegram.sh
```

### 2. **Test Telegram Integration**
```bash
# Check current environment
./scripts/check-environment.sh

# Toggle between environments
./scripts/toggle-environment.sh
```

### 3. **Deploy to Telegram**
1. Create a Telegram Bot via @BotFather
2. Configure Mini App settings
3. Deploy your game files
4. Test in Telegram environment

## 🏗️ **Architecture**

### **Core Components**

#### **1. Telegram Bridge (`src/scripts/telegramlogic.js`)**
- **Purpose**: Handles all Telegram Web App API interactions
- **Features**:
  - User authentication and data retrieval
  - UI component management (buttons, notifications)
  - Haptic feedback and platform integration
  - Theme and platform detection

#### **2. Environment Configuration (`src/config/EnvironmentConfig.js`)**
- **Purpose**: Manages environment-specific settings
- **Features**:
  - Automatic Telegram environment detection
  - Platform-specific feature flags
  - Production optimizations

#### **3. Loading Scene Integration (`src/scenes/LoadingScene.js`)**
- **Purpose**: Handles Telegram initialization and user setup
- **Features**:
  - Automatic Telegram Web App initialization
  - User data retrieval and formatting
  - Seamless transition to game

## 🔧 **Configuration**

### **Environment Settings**

| Setting | Development | Production VK | Production Telegram |
|---------|-------------|---------------|-------------------|
| Debug Mode | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Player Selection | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Mock Data | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Ngrok Headers | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| Verbose Errors | ✅ Enabled | ❌ Disabled | ❌ Disabled |
| Platform Bridge | ❌ None | ✅ VK Bridge | ✅ Telegram Web App |

### **Telegram-Specific Features**

- **User Authentication**: Automatic user data retrieval
- **UI Integration**: Native Telegram buttons and components
- **Haptic Feedback**: Platform-specific tactile responses
- **Theme Support**: Automatic theme detection and adaptation
- **Platform Detection**: Automatic environment detection

## 📱 **Telegram Web App API Integration**

### **Core Functions**

#### **Initialization**
```javascript
import { initTelegramWebApp, setupTelegramApp } from './scripts/telegramlogic.js';

// Initialize Telegram Web App
if (initTelegramWebApp()) {
    // Setup with user data
    setupTelegramApp((appData) => {
        window.appData = appData;
        console.log('Telegram user data:', appData);
    });
}
```

#### **User Data Structure**
```javascript
{
    telegram_user_id: 123456789,
    first_name: "John",
    last_name: "Doe",
    username: "johndoe",
    language_code: "en",
    photo_url: "https://t.me/i/userpic/320/...",
    is_premium: false,
    added_to_attachment_menu: false,
    allows_write_to_pm: false
}
```

#### **UI Components**

##### **Main Button**
```javascript
import { showTelegramMainButton, hideTelegramMainButton } from './scripts/telegramlogic.js';

// Show main button
showTelegramMainButton("Start Game", () => {
    console.log("Main button clicked");
});

// Hide main button
hideTelegramMainButton();
```

##### **Back Button**
```javascript
import { showTelegramBackButton, hideTelegramBackButton } from './scripts/telegramlogic.js';

// Show back button
showTelegramBackButton(() => {
    console.log("Back button clicked");
});

// Hide back button
hideTelegramBackButton();
```

##### **Notifications**
```javascript
import { showTelegramNotification, showTelegramConfirm } from './scripts/telegramlogic.js';

// Show alert
showTelegramNotification("Game started!", () => {
    console.log("Alert dismissed");
});

// Show confirmation
showTelegramConfirm("Are you sure?", (confirmed) => {
    if (confirmed) {
        console.log("User confirmed");
    }
});
```

##### **Haptic Feedback**
```javascript
import { showTelegramHapticFeedback } from './scripts/telegramlogic.js';

// Light impact
showTelegramHapticFeedback('light');

// Medium impact
showTelegramHapticFeedback('medium');

// Heavy impact
showTelegramHapticFeedback('heavy');
```

## 🎮 **Game Integration**

### **Loading Scene**

The LoadingScene automatically detects Telegram environment and initializes the appropriate integration:

```javascript
// In LoadingScene.js
if (window.gameConfig && window.gameConfig.isProductionTelegram()) {
    this.initializeTelegram();
}
```

### **User Data Handling**

Telegram user data is automatically formatted to match the game's expected structure:

```javascript
// VK format (for compatibility)
window.appData = {
    vk_user_id: appData.telegram_user_id, // Mapped for compatibility
    telegram_user_id: appData.telegram_user_id,
    userAvatar: appData.photo_url,
    first_name: appData.first_name,
};
```

### **Debug Mode**

In development mode, debug players include Telegram user IDs for testing:

```javascript
this.debugPlayers = [
    {
        id: 1,
        name: 'Никита',
        photo: 'https://gravatar.com/avatar/...',
        vk_user_id: 123,
        telegram_user_id: 123456789  // Added for Telegram testing
    }
];
```

## 🚀 **Deployment Guide**

### **1. Create Telegram Bot**

1. **Contact @BotFather** in Telegram
2. **Create new bot**: `/newbot`
3. **Set bot name and username**
4. **Get bot token** for API access

### **2. Configure Mini App**

1. **Set bot commands**: `/setcommands`
2. **Configure Mini App**: `/newapp`
3. **Set app title and description**
4. **Configure app URL** (your deployed game URL)

### **3. Deploy Game Files**

1. **Set Telegram environment**:
   ```bash
   ./scripts/set-telegram.sh
   ```

2. **Deploy to web server**:
   - Upload all game files
   - Ensure HTTPS is enabled
   - Configure CORS if needed

3. **Test deployment**:
   - Access game URL directly
   - Test in Telegram environment
   - Verify user data retrieval

### **4. Bot Integration**

#### **Basic Bot Commands**
```javascript
// Example bot commands
const commands = [
    { command: "start", description: "Start the poker game" },
    { command: "play", description: "Play poker" },
    { command: "help", description: "Get help" }
];
```

#### **Web App Button**
```javascript
// Inline keyboard with Web App button
const keyboard = {
    inline_keyboard: [[
        {
            text: "Play Poker",
            web_app: { url: "https://your-game-url.com" }
        }
    ]]
};
```

## 🧪 **Testing**

### **Local Testing**

1. **Set development environment**:
   ```bash
   ./scripts/set-development.sh
   ```

2. **Test with debug players**:
   - Select debug players with Telegram IDs
   - Verify data mapping works correctly

3. **Test Telegram functions**:
   ```javascript
   // Test in browser console
   import('./src/scripts/telegramlogic.js').then(({ isTelegramEnvironment }) => {
       console.log('Telegram environment:', isTelegramEnvironment());
   });
   ```

### **Telegram Testing**

1. **Deploy to test environment**
2. **Access via Telegram bot**
3. **Test user authentication**
4. **Verify UI components**
5. **Test game functionality**

### **Environment Testing**

```bash
# Test environment switching
./scripts/set-development.sh
./scripts/check-environment.sh

./scripts/set-vk.sh
./scripts/check-environment.sh

./scripts/set-telegram.sh
./scripts/check-environment.sh

# Test toggle functionality
./scripts/toggle-environment.sh
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Telegram Web App Not Available**
```javascript
// Check if Telegram environment is detected
if (typeof window.Telegram === 'undefined') {
    console.warn('Telegram Web App not available');
    // Fallback to development mode
}
```

#### **2. User Data Not Retrieved**
```javascript
// Check user data availability
const user = TelegramWebApp.initDataUnsafe?.user;
if (!user) {
    console.warn('No user data available');
    // Use fallback data
}
```

#### **3. UI Components Not Working**
```javascript
// Verify Telegram Web App initialization
if (!TelegramWebApp) {
    console.error('Telegram Web App not initialized');
    return;
}
```

### **Debug Commands**

```bash
# Check current environment
./scripts/check-environment.sh

# View environment configuration
cat src/config/EnvironmentConfig.js

# Test environment detection
node -e "
import('./src/config/EnvironmentConfig.js').then(({ EnvironmentConfig }) => {
    const config = new EnvironmentConfig();
    console.log('Environment:', config.getEnvironment());
});
"
```

## 📚 **API Reference**

### **Telegram Web App API**

#### **Core Methods**
- `initTelegramWebApp()` - Initialize Telegram Web App
- `setupTelegramApp(callback)` - Setup with user data
- `getTelegramUserInfo(callback)` - Get user information

#### **UI Methods**
- `showTelegramMainButton(text, callback)` - Show main button
- `hideTelegramMainButton()` - Hide main button
- `showTelegramBackButton(callback)` - Show back button
- `hideTelegramBackButton()` - Hide back button

#### **Feedback Methods**
- `showTelegramHapticFeedback(style)` - Haptic feedback
- `showTelegramNotification(message, callback)` - Show alert
- `showTelegramConfirm(message, callback)` - Show confirmation

#### **Utility Methods**
- `isTelegramEnvironment()` - Check if running in Telegram
- `getTelegramPlatform()` - Get platform (ios/android/web)
- `getTelegramVersion()` - Get Telegram version
- `getTelegramThemeParams()` - Get theme parameters
- `closeTelegramWebApp()` - Close Web App

### **Environment Configuration**

#### **Detection Methods**
- `isProductionTelegram()` - Check if Telegram environment
- `isProductionVK()` - Check if VK environment
- `isDevelopment()` - Check if development environment

#### **Feature Methods**
- `isFeatureEnabled(featureName)` - Check feature status
- `getEnvironment()` - Get current environment
- `getConfig()` - Get full configuration

## 🔗 **Related Documentation**

- **[Environment Management](ENVIRONMENT_SCRIPTS_README.md)** - Environment configuration guide
- **[VK Integration](VK_README.md)** - VKontakte platform integration
- **[Deployment Guide](DEPLOYMENT_README.md)** - General deployment instructions
- **[API Documentation](API_README.md)** - Game API reference

## 📊 **Performance Considerations**

### **Optimizations**

1. **Lazy Loading**: Telegram logic loaded only when needed
2. **Error Handling**: Graceful fallbacks for missing features
3. **Memory Management**: Proper cleanup of event listeners
4. **Network Efficiency**: Minimal API calls and data transfer

### **Best Practices**

1. **Always check availability** before using Telegram features
2. **Provide fallbacks** for non-Telegram environments
3. **Handle errors gracefully** with user-friendly messages
4. **Test thoroughly** in both development and production
5. **Monitor performance** and optimize as needed

## 🎯 **Future Enhancements**

### **Planned Features**

1. **Advanced UI Components**: More native Telegram elements
2. **Push Notifications**: Game notifications via Telegram
3. **Social Features**: Share game results with friends
4. **Payment Integration**: In-app purchases via Telegram
5. **Analytics**: Telegram-specific usage analytics

### **Integration Opportunities**

1. **Telegram Groups**: Multiplayer games in groups
2. **Telegram Channels**: Game announcements and updates
3. **Telegram Stickers**: Custom game-themed stickers
4. **Telegram Bots**: Advanced bot commands and features

## 📞 **Support**

For issues and questions related to Telegram Mini App integration:

1. **Check this documentation** for common solutions
2. **Review troubleshooting section** for specific issues
3. **Test environment configuration** using provided scripts
4. **Consult Telegram Bot API documentation** for platform-specific issues

---

**Last Updated**: July 2024  
**Version**: 1.0.0  
**Compatibility**: Telegram Web App API v6.0+ 