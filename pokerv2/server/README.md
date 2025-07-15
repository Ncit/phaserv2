# Poker Server

A Node.js multiplayer poker server for the Phaser poker game.

## Features

- Real-time multiplayer Texas Hold'em poker
- WebSocket communication using Socket.IO
- Automatic game management and player matching
- Hand evaluation and winner determination
- Action timers and auto-fold functionality
- Support for up to 6 players per game
- Multiple concurrent games

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### REST API

- `GET /api/games` - Get list of all games
- `GET /api/games/:gameId` - Get specific game details

### WebSocket Events

#### Client to Server

- `joinGame` - Join a game with player data
- `pokerAction` - Send a poker action (fold, call, raise, etc.)
- `startNewHand` - Request to start a new hand

#### Server to Client

- `gameJoined` - Confirmation that player joined a game
- `gameStateUpdate` - Updated game state
- `playerJoined` - New player joined the game
- `playerLeft` - Player left the game
- `error` - Error message

## Game Flow

1. **Connection**: Player connects to server via WebSocket
2. **Join Game**: Player joins an available game or creates a new one
3. **Game Start**: Game starts when minimum players (2) join
4. **Betting Rounds**: Players take turns making poker actions
5. **Showdown**: Remaining players reveal cards and determine winner
6. **New Hand**: Game continues with new hands until players leave

## Poker Actions

- `fold` - Fold the current hand
- `check` - Check (no bet to call)
- `call` - Call the current bet
- `raise` - Raise the current bet
- `allIn` - Bet all remaining chips

## Configuration

The server supports the following configuration:

- `maxPlayers`: Maximum players per game (default: 6)
- `minPlayers`: Minimum players to start game (default: 2)
- `smallBlind`: Small blind amount (default: 10)
- `bigBlind`: Big blind amount (default: 20)
- `actionTimeout`: Time limit for player actions in milliseconds (default: 30000)

## Development

### Project Structure

```
server/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── game/
│   ├── GameManager.js     # Manages multiple games
│   ├── PlayerManager.js   # Manages player connections
│   ├── PokerGame.js       # Individual game logic
│   └── HandEvaluator.js   # Poker hand evaluation
└── README.md             # This file
```

### Adding Features

1. **New Poker Variants**: Extend `PokerGame.js` with new game rules
2. **Tournament Mode**: Add tournament logic to `GameManager.js`
3. **Chat System**: Implement chat events in `server.js`
4. **Spectator Mode**: Allow non-playing observers

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure the server is running on the correct port
2. **Players Not Joining**: Check if the client is connecting to the right server URL
3. **Game Not Starting**: Ensure minimum player count is met
4. **Actions Not Working**: Verify the player's turn and game state

### Logs

The server provides detailed console logs for debugging:
- Player connections/disconnections
- Game state changes
- Player actions
- Error messages

## License

MIT License - see LICENSE file for details. 