# New AI Bot Scene Approach

## Overview

Instead of reusing the same AIBotScene instance, we now create a completely new copy of the AIBotScene each time the user clicks the AI bot button. This ensures a completely fresh state every time.

## Problem Solved

The previous approach of reusing the same AIBotScene instance could lead to:
- State persistence issues from previous sessions
- Memory leaks from incomplete cleanup
- Complex reset logic that might miss some state
- Potential bugs from residual game state

## New Solution

### 1. Unique Scene Keys

Each time the AI bot button is clicked, we create a new scene with a unique key:

```javascript
// Create a unique scene key for this AI bot session
const sessionId = Date.now();
const sceneKey = `AIBotScene_${sessionId}`;
```

### 2. Dynamic Scene Creation

The LobbyScene dynamically imports and creates new AIBotScene instances:

```javascript
// Import and create a new AIBotScene instance
import('./AIBotScene.js').then(({ AIBotScene }) => {
    // Add the new scene instance
    this.scene.add(sceneKey, new AIBotScene(), true);
    // Start the new scene
    this.scene.start(sceneKey);
});
```

### 3. Automatic Cleanup

When the user clicks the menu button to return to the lobby:
- The `handleMenu()` method calls `this.shutdown()` to clean up resources
- The scene is automatically removed when switching back to LobbyScene
- No residual state remains

## Implementation Details

### Modified Files

1. **LobbyScene.js** - Modified the AI bot button click handler
2. **AIBotScene.js** - No changes needed (existing shutdown method works)

### Scene Lifecycle

1. **User clicks AI bot button**
   - Generate unique session ID
   - Import AIBotScene class
   - Create new scene instance with unique key
   - Start the new scene

2. **User plays the game**
   - Game runs normally in the new scene instance
   - All state is fresh and clean

3. **User clicks menu button**
   - `handleMenu()` calls `shutdown()` for cleanup
   - Scene switches back to LobbyScene
   - Old scene instance is automatically cleaned up

## Benefits

### 1. **Guaranteed Fresh State**
- Every new AI bot game starts with completely clean state
- No risk of residual data from previous sessions
- No complex reset logic needed

### 2. **Memory Management**
- Each scene instance is properly cleaned up when done
- No memory leaks from incomplete cleanup
- Phaser handles scene lifecycle automatically

### 3. **Simplicity**
- No need for complex reset methods
- No need to track initialization state
- No risk of missing state during reset

### 4. **Reliability**
- Each session is completely isolated
- No interference between different game sessions
- Predictable behavior every time

## Testing

Created `test-new-ai-bot-scene.html` to verify:
- Each click creates a new scene instance
- Scene keys are unique
- Cleanup works properly
- No errors during scene creation/destruction

## Expected Console Output

When clicking the AI bot button multiple times:

```
[timestamp] Creating new scene: AIBotScene_1703123456789
[timestamp] Starting scene: AIBotScene_1703123456789
[timestamp] AIBotScene: Initializing game
[timestamp] AIBotScene: Game initialization completed
```

When returning to lobby:

```
[timestamp] AIBotScene: Shutting down and cleaning up resources
[timestamp] AIBotScene: Cleanup completed
[timestamp] Starting scene: LobbyScene
```

## Future Considerations

- Consider adding session tracking for analytics
- Could implement scene pooling for performance optimization
- May want to add session persistence for interrupted games
- Consider adding scene transition animations

## Migration Notes

This approach is backward compatible:
- Existing AIBotScene code works unchanged
- Menu button functionality remains the same
- All game logic remains intact
- Only the scene creation mechanism has changed 