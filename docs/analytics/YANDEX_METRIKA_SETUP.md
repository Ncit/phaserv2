# Yandex Metrika Integration Guide

This guide explains how to set up and use Yandex Metrika analytics in the poker game.

## Setup Instructions

### 1. Get Your Yandex Metrika ID

1. Go to [Yandex Metrika](https://metrika.yandex.ru/)
2. Create a new counter or use an existing one
3. Copy your Metrika ID (it's a number like `12345678`)

### 2. Configure the Analytics

1. Open `pokerv2/client/src/config/AnalyticsConfig.js`
2. Replace `'YOUR_METRIKA_ID'` with your actual Metrika ID:

```javascript
export const AnalyticsConfig = {
    yandexMetrika: {
        metrikaId: '12345678', // Replace with your actual ID
        // ... rest of config
    },
    // ... rest of config
};
```

### 3. Verify Installation

1. Open the game in your browser
2. Open Developer Tools (F12)
3. Check the Console for these messages:
   - `AnalyticsManager: Yandex Metrika initialized successfully` (production)
   - `AnalyticsManager: Running on localhost - Yandex Metrika disabled to avoid CORS issues` (development)
   - `AnalyticsManager: Yandex Metrika ID not configured` (if not configured)

## Development vs Production

### Localhost Development
When running on `localhost`, `127.0.0.1`, or ngrok domains:
- **Yandex Metrika is automatically disabled** to avoid CORS issues
- **Events are still logged to console** in debug mode
- **No network requests** are made to Yandex servers
- **Perfect for development** without CORS errors

### Production Deployment
When deployed to a real domain:
- **Yandex Metrika is fully enabled**
- **Events are sent to Yandex servers**
- **Real analytics data** is collected
- **No CORS issues** on production domains

## Tracked Events

The analytics system automatically tracks the following events:

### Game Events
- **Game Start**: When a game begins
- **Game End**: When a game ends (with duration and player count)
- **Player Actions**: Fold, call, check, raise, all-in
- **Hand Results**: Wins and losses with pot size and hand rank

### UI Events
- **Button Clicks**: All button interactions
- **Scene Changes**: Navigation between game scenes
- **Purchases**: Shop item purchases

### Error Events
- **Errors**: Game errors and exceptions

### User Engagement
- **Custom Events**: Additional user engagement tracking

## Event Parameters

Each event includes relevant parameters:

### Game Events
```javascript
// Game Start
{
    game_type: 'fast_game' | 'ai_bot' | 'friends_game'
}

// Player Action
{
    action: 'fold' | 'call' | 'check' | 'raise' | 'all_in',
    game_type: 'fast_game' | 'ai_bot' | 'friends_game',
    amount: 100 // bet amount
}

// Hand Win/Loss
{
    game_type: 'fast_game' | 'ai_bot' | 'friends_game',
    pot_size: 500,
    hand_rank: 'pair' // for wins only
}
```

### UI Events
```javascript
// Button Click
{
    button_name: 'fold_button' | 'shop_button' | 'fast_game_button',
    scene_name: 'fast_game_scene' | 'lobby_scene'
}

// Scene Change
{
    from_scene: 'lobby_scene',
    to_scene: 'fast_game_scene'
}

// Purchase
{
    item_name: 'Chip Pack',
    item_price: 1000,
    currency: 'chips'
}
```

## Manual Event Tracking

You can manually track custom events in your code:

```javascript
// Track a custom event
window.analyticsManager.trackEvent('custom_event', {
    parameter1: 'value1',
    parameter2: 'value2'
});

// Track user engagement
window.analyticsManager.trackUserEngagement('feature_used', {
    feature: 'chat',
    duration: 30
});

// Track errors
window.analyticsManager.trackError('network_error', 'Connection failed');
```

## Debug Mode

In debug mode (`window.isDebug = true`), analytics events are logged to the console:

### Development (localhost)
```
AnalyticsManager: Running on localhost - Yandex Metrika disabled to avoid CORS issues
AnalyticsManager: Events will be logged to console in debug mode
AnalyticsManager: Event tracked: game_start {game_type: "fast_game"}
AnalyticsManager: Event tracked: button_click {button_name: "fold_button", scene_name: "fast_game_scene"}
```

### Production
```
AnalyticsManager: Yandex Metrika initialized successfully
AnalyticsManager: Event tracked: game_start {game_type: "fast_game"}
AnalyticsManager: Event tracked: button_click {button_name: "fold_button", scene_name: "fast_game_scene"}
```

## Yandex Metrika Dashboard

Once configured and deployed to production, you can view your analytics data in the Yandex Metrika dashboard:

1. **Goals**: Custom events appear as goals
2. **Reports**: View user behavior and game statistics
3. **Real-time**: Monitor live user activity
4. **Webvisor**: Record and replay user sessions

## Privacy Considerations

- No personal data is collected
- Only game events and user interactions are tracked
- Player IDs are not included in analytics data
- All data is anonymized

## Troubleshooting

### CORS Errors on Localhost
**This is expected behavior!** The system automatically detects localhost and disables Yandex Metrika to avoid CORS issues. Events are still logged to console for development.

### Analytics Not Working in Production
1. Check that your Metrika ID is correctly set in `AnalyticsConfig.js`
2. Verify the ID is a valid number
3. Check browser console for error messages
4. Ensure you're not on localhost or ngrok

### Events Not Appearing
1. Wait 24-48 hours for data to appear in Yandex Metrika
2. Check that goals are properly configured in your Metrika dashboard
3. Verify events are being sent (check console in debug mode)
4. Ensure you're on a production domain (not localhost)

### Performance Issues
1. Analytics are loaded asynchronously and shouldn't affect game performance
2. If issues occur, you can disable analytics by setting `metrikaId: null`

## Configuration Options

You can customize the Yandex Metrika configuration in `AnalyticsConfig.js`:

```javascript
yandexMetrika: {
    metrikaId: '12345678',
    options: {
        clickmap: true,           // Track clicks
        trackLinks: true,         // Track link clicks
        accurateTrackBounce: true, // Accurate bounce tracking
        webvisor: true,           // Session recording
        trackHash: true           // Track URL hash changes
    }
}
```

## Environment Detection

The system automatically detects your environment:

```javascript
// Check analytics status
console.log(window.analyticsManager.getStatus());
// Output:
// {
//     isInitialized: true,
//     metrikaId: '12345678',
//     isDebug: true,
//     isLocalhost: true,
//     environment: 'development'
// }
``` 