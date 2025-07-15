# AI Bot Black Screen Fix

## Problem Description
When opening the AI Bot scene, exiting to the lobby, and then reopening the AI Bot scene, the screen would appear black instead of showing the game interface.

## Root Causes Identified

1. **Constructor Parameter Issue**: The AIBotScene constructor was modified to require a `sceneKey` parameter but didn't have a default value, causing issues when the scene was instantiated.

2. **Incomplete Scene Cleanup**: The scene wasn't properly cleaning up resources between sessions, leading to memory leaks and state conflicts.

3. **Missing Scene Lifecycle Management**: The scene wasn't properly handling wake/sleep events, which are important for scene reuse.

4. **Manager State Persistence**: Managers weren't being properly reset between scene sessions.

## Solutions Implemented

### 1. Fixed Constructor
```javascript
// Before
constructor(sceneKey) {
    super(sceneKey);
    // ...
}

// After
constructor(sceneKey = 'AIBotScene') {
    super(sceneKey);
    // ...
}
```

### 2. Added Scene Reset Method
Added a comprehensive `resetScene()` method that:
- Resets all game state variables
- Clears player arrays
- Cleans up managers
- Clears timers and UI elements
- Resets community cards container

### 3. Improved Scene Lifecycle Management
Added event listeners for scene lifecycle events:
```javascript
this.events.on('wake', () => {
    console.log('AIBotScene: Scene wake event triggered');
    this.resetScene();
});

this.events.on('sleep', () => {
    console.log('AIBotScene: Scene sleep event triggered');
});
```

### 4. Enhanced Shutdown Method
Improved the `shutdown()` method to:
- Properly destroy all UI elements
- Set references to null after destruction
- Clean up all managers
- Remove avatar textures
- Clear all timers
- Remove all event listeners

### 5. Better Scene Management in LobbyScene
Enhanced the LobbyScene to:
- Check for existing scenes before creating new ones
- Remove existing scenes to prevent conflicts
- Add better error handling and logging
- Use proper scene addition flags

## Key Changes Made

### AIBotScene.js
- Fixed constructor with default parameter
- Added `resetScene()` method
- Enhanced scene lifecycle event handling
- Improved `shutdown()` method with proper cleanup
- Added comprehensive logging for debugging

### LobbyScene.js
- Added scene existence checks
- Improved scene removal logic
- Enhanced error handling
- Added detailed logging

## Testing

A test file `test-ai-bot-black-screen.html` was created to:
- Reproduce the black screen issue
- Test scene creation and destruction
- Monitor scene lifecycle events
- Debug texture loading issues
- Verify proper cleanup

## Usage

The fix ensures that:
1. Each AI Bot session gets a unique scene key
2. Previous scenes are properly cleaned up
3. New scenes start with fresh state
4. No memory leaks occur between sessions
5. All UI elements are properly initialized

## Verification

To verify the fix works:
1. Open AI Bot scene
2. Play a few hands
3. Exit to lobby
4. Reopen AI Bot scene
5. Verify the scene loads properly with fresh state

The scene should now load correctly every time without black screen issues. 