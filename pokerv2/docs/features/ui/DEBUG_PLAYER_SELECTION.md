# Debug Player Selection Feature

This document describes the debug player selection feature that allows testing the game with different player profiles in debug mode.

## Overview

When `window.isDebug = true`, the LoadingScene now shows a player selection screen instead of automatically proceeding to the game. This allows developers to test the game with different player profiles without needing to modify the code.

## Features

### Debug Player Profiles

Three predefined player profiles are available:

1. **Никита** (ID: 123)
   - Avatar: Robot hash avatar
   - Used for testing primary user scenarios

2. **Анна** (ID: 456)
   - Avatar: Different robot hash avatar
   - Used for testing secondary user scenarios

3. **Михаил** (ID: 789)
   - Avatar: Another robot hash avatar
   - Used for testing tertiary user scenarios

### Visual Selection Interface

- **Player Cards**: Each player is displayed in a card format with:
  - Avatar image (loaded from Gravatar)
  - Player name
  - VK User ID
  - Interactive selection area

- **Selection Feedback**:
  - Selected player card gets green tint
  - Selected player avatar scales up slightly
  - Continue button becomes active and green

- **Continue Button**: 
  - Initially disabled and gray
  - Becomes active when a player is selected
  - Shows checkmark when ready to proceed

## Implementation Details

### LoadingScene Changes

```javascript
// New properties added to LoadingScene
this.debugPlayers = [
    { id: 1, name: 'Никита', photo: '...', vk_user_id: 123 },
    { id: 2, name: 'Анна', photo: '...', vk_user_id: 456 },
    { id: 3, name: 'Михаил', photo: '...', vk_user_id: 789 }
];
this.selectedPlayer = null;
```

### Key Methods

- `createDebugPlayerSelection()`: Creates the debug UI
- `createPlayerButtons()`: Creates interactive player selection buttons
- `selectPlayer()`: Handles player selection with visual feedback
- `proceedToGame()`: Sets appData and transitions to lobby

### Integration with Game Scenes

Both `FastGameScene` and `AIBotScene` now:
- Display the selected player info in debug mode
- Use the selected player's data for multiplayer connections
- Show player name and ID in the game interface

## Usage

### Enabling Debug Mode

Set `window.isDebug = true` before loading the game:

```javascript
window.isDebug = true;
// Then load the game
```

### Testing Workflow

1. **Start the game** with debug mode enabled
2. **Select a player** from the three available options
3. **Click "Continue to Game"** to proceed
4. **Verify player data** is correctly used in the game

### Testing Multiple Players

To test multiplayer scenarios:

1. **Open multiple browser tabs/windows**
2. **Select different players** in each tab
3. **Join the same multiplayer game** to test with different player profiles

## Testing Tools

### Debug Player Test Page

A test page is available at `test-debug-players.html` that provides:

- Visual representation of available players
- Test buttons to simulate player selection
- Real-time appData inspection
- Game launch functionality

### Console Logging

Debug information is logged to the console:

```javascript
console.log('Debug: Selected player:', selectedPlayer);
console.log('Debug: Proceeding to game with player:', window.appData);
```

## Configuration

### Adding New Debug Players

To add more debug players, modify the `debugPlayers` array in `LoadingScene.js`:

```javascript
this.debugPlayers = [
    // ... existing players
    {
        id: 4,
        name: 'New Player',
        photo: 'https://gravatar.com/avatar/new?s=400&d=robohash&r=x',
        vk_user_id: 999
    }
];
```

### Customizing Player Data

Each player object supports:

- `id`: Unique identifier
- `name`: Display name
- `photo`: Avatar URL
- `vk_user_id`: VK user ID for testing

## Benefits

### Development Benefits

1. **Easy Testing**: No need to modify code for different player scenarios
2. **Visual Feedback**: Clear indication of selected player
3. **Multiplayer Testing**: Test with different player profiles simultaneously
4. **Consistent Data**: Predefined player data ensures consistent testing

### Debugging Benefits

1. **Player Identification**: Easy to identify which player profile is being used
2. **Data Verification**: Console logs show exact player data being used
3. **UI Testing**: Test different player names and avatars
4. **Network Testing**: Test multiplayer with different player IDs

## Future Enhancements

### Potential Improvements

1. **Custom Player Creation**: Allow adding custom player profiles
2. **Player Data Persistence**: Save selected player preference
3. **Avatar Customization**: Allow custom avatar URLs
4. **Player Statistics**: Track different player performance
5. **Profile Management**: Save and load player profiles

### Integration Ideas

1. **Tournament Mode**: Use different players for tournament testing
2. **Achievement System**: Test achievements with different players
3. **Friend System**: Test friend functionality with different profiles
4. **Leaderboards**: Test leaderboards with multiple player profiles

## Troubleshooting

### Common Issues

1. **Player not showing**: Check if `window.isDebug = true` is set
2. **Avatar not loading**: Verify Gravatar URLs are accessible
3. **Selection not working**: Check browser console for errors
4. **Game not starting**: Ensure a player is selected before continuing

### Debug Steps

1. Check browser console for error messages
2. Verify `window.appData` is set correctly
3. Confirm player selection is working
4. Test with different browsers if needed

## Security Notes

- Debug mode should only be enabled in development
- Player data is not persisted between sessions
- No sensitive information is stored in debug profiles
- Consider disabling debug mode in production builds 