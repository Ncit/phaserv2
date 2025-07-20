# Settings System & App Info

## Overview

The Poker Game now includes a comprehensive settings dialog that displays app information and allows users to configure various game settings. The system automatically updates the app version on each commit.

## Features

### 🎮 Settings Dialog
- **App Information**: Displays version, build date, git commit, and technical details
- **Settings Toggles**: Sound effects, background music, notifications, and debug mode
- **Contact Information**: Support email, Telegram, and website links
- **Platform Support**: Lists all supported platforms (Web, Telegram Mini App, VK Mini App)

### 🔄 Auto-Updating Version System
- **Automatic Version Increment**: Version number updates on each commit
- **Smart Versioning**: Detects commit message keywords to determine increment type
- **Git Integration**: Tracks commit hash, branch, and build timestamp
- **Pre-commit Hook**: Automatically runs before each commit

## Version Management

### Version Increment Types
The system automatically determines version increment based on commit messages:

- **Patch** (default): `1.0.0` → `1.0.1`
  - Regular commits, bug fixes, minor changes

- **Minor**: `1.0.0` → `1.1.0`
  - Commit messages containing `[MINOR]` or `[FEATURE]`
  - New features, improvements

- **Major**: `1.0.0` → `2.0.0`
  - Commit messages containing `[MAJOR]` or `[BREAKING]`
  - Breaking changes, major updates

### Example Commit Messages
```bash
git commit -m "Fix avatar scaling bug"                    # Patch increment
git commit -m "[FEATURE] Add new game mode"               # Minor increment
git commit -m "[MAJOR] Redesign UI architecture"          # Major increment
```

## Technical Implementation

### Files Created
1. **`VersionConfig.js`**: Centralized version configuration
2. **`SettingsManager.js`**: Settings dialog management
3. **`update-version.sh`**: Version update script
4. **`.git/hooks/pre-commit`**: Git hook for automatic version updates

### Integration Points
- **LobbyScene**: Settings button opens dialog
- **AIBotScene**: Settings button opens dialog
- **FastGameScene**: Settings button opens dialog
- **FriendsGameScene**: Settings button opens dialog
- **ButtonManager**: Handles settings button clicks

## Usage

### Opening Settings
1. Click the **Settings** button (gear icon) in any game scene
2. The settings dialog will appear with app information and settings toggles
3. Click outside the dialog or press **ESC** to close

### Settings Available
- **Sound Effects**: Toggle game sound effects
- **Background Music**: Toggle background music
- **Notifications**: Toggle push notifications
- **Debug Mode**: Toggle debug features (development only)

### App Information Displayed
- **App Name**: Poker Game
- **Version**: Current version number (auto-updated)
- **Build Date**: Date of last commit
- **Git Commit**: Short commit hash
- **Branch**: Current git branch
- **Engine**: Phaser 3
- **Developer**: Ncit
- **Platforms**: Web, Telegram Mini App, VK Mini App

## Configuration

### Version Configuration
Edit `pokerv2/client/src/config/VersionConfig.js` to modify:
- App metadata (name, description, developer)
- Platform support list
- Feature list
- Contact information
- Technical details

### Settings Configuration
Edit `pokerv2/client/src/managers/SettingsManager.js` to:
- Add new settings toggles
- Modify dialog layout
- Change default values
- Add new sections

## Deployment

The settings system is automatically deployed with the game. The version number will be updated during the deployment process.

### Manual Version Update
If needed, you can manually update the version:
```bash
./update-version.sh
```

### Disabling Auto-Version Update
To disable automatic version updates, remove or rename the pre-commit hook:
```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

## Troubleshooting

### Version Not Updating
1. Check if the pre-commit hook is executable: `chmod +x .git/hooks/pre-commit`
2. Verify the update script exists: `ls -la update-version.sh`
3. Check git hooks are enabled: `git config core.hooksPath .git/hooks`

### Settings Dialog Not Opening
1. Verify SettingsManager is imported in the scene
2. Check if settingsManager is initialized in scene.create()
3. Ensure ButtonManager.handleSettings() is called

### Version File Not Found
1. Check if VersionConfig.js exists in the correct path
2. Verify the path in update-version.sh matches your project structure
3. Ensure the file has proper read/write permissions

## Future Enhancements

### Planned Features
- **Settings Persistence**: Save user preferences to localStorage
- **Theme Selection**: Light/dark theme toggle
- **Language Selection**: Multi-language support
- **Accessibility Options**: Font size, contrast, etc.
- **Performance Settings**: Graphics quality, animation speed

### Customization Options
- **Custom Settings**: Add project-specific settings
- **Dynamic Content**: Load settings from external configuration
- **User Profiles**: Per-user settings storage
- **Cloud Sync**: Sync settings across devices

## Support

For issues or questions about the settings system:
- **Email**: support@example.com
- **Telegram**: @poker_support
- **Website**: https://github.com/Ncit/phaserv2 