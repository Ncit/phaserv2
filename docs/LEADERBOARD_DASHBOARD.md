# Leaderboard Dashboard Documentation

This document describes the leaderboard dashboard feature that displays player rankings and statistics.

## Overview

The leaderboard dashboard provides a comprehensive view of player performance, rankings, and statistics in the poker game. It displays real-time data from the server's rating system and allows players to see how they compare to others.

## Features

### 🏆 Player Rankings
- **Real-time Rankings**: Live leaderboard updated from server database
- **Medal System**: Gold (🥇), Silver (🥈), Bronze (🥉) medals for top 3 players
- **Rating Display**: Current rating points for each player
- **Position Tracking**: Clear ranking position for all players

### 📊 Statistics Display
- **Total Games**: Number of games played by each player
- **Games Won**: Number of victories achieved
- **Total Profit**: Overall profit/loss in chips
- **Win Rate**: Calculated win percentage
- **Biggest Pot**: Largest pot won in a single hand

### 🎮 User Interface
- **Responsive Design**: Adapts to different screen sizes
- **Pagination**: Navigate through multiple pages of players
- **Auto-refresh**: Updates every 30 seconds automatically
- **Manual Refresh**: Refresh button for immediate updates
- **Loading States**: Visual feedback during data loading
- **Error Handling**: Graceful error messages for connection issues

### 🔄 Navigation
- **Back Button**: Return to lobby scene
- **ESC Key**: Keyboard shortcut to go back
- **Page Navigation**: Previous/Next page buttons
- **Page Indicators**: Current page and total pages display

## Accessing the Leaderboard

### From Lobby Scene
1. Click the **Leaderboard Button** (📊 icon) in the bottom control bar
2. The leaderboard scene will load with current rankings

### Keyboard Shortcut
- Press **ESC** key to return to lobby from leaderboard

## Data Structure

### Player Information
```javascript
{
    id: "player-id",
    name: "PlayerName",
    avatar_url: "avatar-url",
    rating: 1850,
    total_games: 45,
    games_won: 32,
    total_profit: 8500,
    biggest_pot: 2550
}
```

### API Endpoint
```
GET /api/leaderboard?limit=50
```

**Response:**
```javascript
{
    success: true,
    leaderboard: [
        // Array of player objects
    ]
}
```

## Rating System

### Rating Categories
- **Master**: 2500+ points (🥇 Elite players)
- **Diamond**: 2001-2500 points (💎 Expert players)
- **Platinum**: 1501-2000 points (🔷 Advanced players)
- **Gold**: 1001-1500 points (🥇 Skilled players)
- **Silver**: 501-1000 points (🥈 Intermediate players)
- **Bronze**: 100-500 points (🥉 Beginner players)

### Rating Calculation
- **Starting Rating**: 1000 points
- **Minimum Rating**: 100 points
- **Rating Factors**:
  - Win/Loss against opponents
  - Pot size in hands won/lost
  - Hand rank quality
  - Opponent rating difference

## Technical Implementation

### Scene Structure
```javascript
class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.leaderboardData = [];
        this.isLoading = true;
        this.currentPage = 0;
        this.itemsPerPage = 10;
    }
}
```

### Key Methods
- `loadLeaderboardData()`: Fetches data from server API
- `displayLeaderboard()`: Renders the leaderboard UI
- `createPlayerRow()`: Creates individual player row
- `createPagination()`: Handles page navigation
- `setupEventListeners()`: Manages user interactions

### Auto-refresh System
```javascript
// Auto-refresh every 30 seconds
this.time.addEvent({
    delay: 30000,
    callback: () => {
        if (!this.isLoading) {
            this.loadLeaderboardData();
        }
    },
    loop: true
});
```

## Error Handling

### Connection Errors
- **Server Unavailable**: Shows "Ошибка подключения к серверу"
- **API Errors**: Shows "Ошибка загрузки рейтинга"
- **Empty Data**: Shows "Нет данных для отображения"

### Loading States
- **Loading Indicator**: "Загрузка рейтинга..." message
- **Loading Spinner**: Visual feedback during data fetch
- **Error Colors**: Red text for error messages

## Performance Considerations

### Data Loading
- **Lazy Loading**: Only loads visible page data
- **Caching**: Caches leaderboard data locally
- **Optimized API**: Efficient database queries

### UI Performance
- **Container Management**: Efficient Phaser container usage
- **Memory Cleanup**: Proper scene shutdown and cleanup
- **Event Management**: Clean event listener removal

## Customization

### Visual Customization
- **Colors**: Rating colors, profit colors, background colors
- **Fonts**: Customizable font families and sizes
- **Layout**: Adjustable spacing and positioning
- **Icons**: Customizable medal and status icons

### Data Customization
- **Items Per Page**: Configurable pagination (default: 10)
- **Auto-refresh Interval**: Adjustable refresh timing (default: 30s)
- **API Endpoint**: Configurable server URL
- **Data Fields**: Customizable displayed statistics

## Testing

### Test Data
Use the test script to add sample data:
```bash
cd pokerv2/server
node scripts/test-leaderboard.js
```

### API Testing
Test the leaderboard API:
```bash
curl http://localhost:3000/api/leaderboard
```

### Manual Testing
1. Start the server: `npm start`
2. Start the client: `python3 -m http.server 8001`
3. Navigate to leaderboard from lobby
4. Test pagination and refresh functionality

## Future Enhancements

### Planned Features
- **Player Search**: Search for specific players
- **Filtering**: Filter by rating range, games played, etc.
- **Sorting**: Sort by different criteria
- **Player Profiles**: Click to view detailed player stats
- **Achievements**: Display player achievements and badges
- **Tournament Mode**: Special tournament leaderboards
- **Export Data**: Export leaderboard to CSV/PDF
- **Real-time Updates**: WebSocket-based live updates

### Analytics Integration
- **Player Trends**: Rating change over time
- **Performance Metrics**: Win rate analysis
- **Comparison Tools**: Compare multiple players
- **Historical Data**: View past leaderboards

## Troubleshooting

### Common Issues
1. **Leaderboard Not Loading**: Check server connection and API endpoint
2. **Empty Leaderboard**: Verify database has player data
3. **Slow Loading**: Check network connection and server performance
4. **UI Not Updating**: Ensure auto-refresh is enabled and working

### Debug Mode
Enable debug logging in `EnvironmentConfig.js`:
```javascript
debugLogging: true
```

### Server Logs
Check server console for API request logs and database errors.

## Support

For issues with the leaderboard dashboard:
1. Check server logs for errors
2. Verify database connectivity
3. Test API endpoints manually
4. Check browser console for client-side errors
5. Ensure all assets are loaded correctly 