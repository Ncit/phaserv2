# AI Bot Texas Hold'em Scene

## Overview
The AI Bot Scene is a complete Texas Hold'em poker game implementation with 5 AI players and 1 human player. The game follows all standard Texas Hold'em rules and includes intelligent AI decision-making.

## Features

### Game Rules
- **Texas Hold'em**: Standard 5-card community card poker
- **Blinds**: Small blind ($10) and big blind ($20)
- **Betting Rounds**: Preflop, Flop, Turn, River, Showdown
- **Actions**: Fold, Call, Raise
- **Hand Evaluation**: Complete hand ranking system

### AI Players
- **4 AI Bots**: Intelligent decision-making based on:
  - Hand strength evaluation
  - Pot odds calculation
  - Position awareness
  - Betting patterns
- **AI Levels**: Medium difficulty (configurable)
- **Realistic Play**: AI makes decisions based on poker strategy

### Human Player
- **Interactive Controls**: Fold, Call, Raise buttons
- **Visual Feedback**: Current player highlighting
- **Hand Display**: Shows your hole cards face-up

### UI Features
- **Game Information**: Current phase, pot size, betting amounts
- **Player Status**: Bank balances, current bets, folded/all-in status
- **Community Cards**: Center table display
- **Hand Rankings**: Shows winning hands and descriptions
- **Visual Indicators**: Current player highlighting, action buttons

## How to Play

1. **Start the Game**: Click "AI Bot Game" from the lobby
2. **Wait for Your Turn**: AI players will act automatically
3. **Make Decisions**: When it's your turn, choose:
   - **Fold**: Give up your hand
   - **Call**: Match the current bet
   - **Raise**: Increase the current bet
4. **Watch the Action**: Community cards are dealt automatically
5. **Showdown**: Best hand wins the pot

## Technical Implementation

### Files Created/Modified
- `src/scenes/AIBotScene.js` - Main game scene
- `src/utils/HandEvaluator.js` - Hand evaluation logic
- `src/managers/UIManager.js` - Added AI Bot scene initialization
- `src/config/AssetConfig.js` - Added AI Bot button asset
- `src/scenes/LobbyScene.js` - Added AI Bot button
- `src/main.js` - Registered AI Bot scene

### Key Components

#### HandEvaluator
- Evaluates 5-card poker hands
- Ranks hands from High Card to Royal Flush
- Compares hands for winner determination
- Provides hand strength for AI decisions

#### AI Decision Making
- **Preflop**: Evaluates hole card strength
- **Postflop**: Evaluates complete hand strength
- **Position Awareness**: Considers player position
- **Pot Odds**: Calculates call/raise decisions
- **Betting Patterns**: Varies aggression based on hand strength

#### Game State Management
- Tracks current phase, pot, bets, players
- Manages betting rounds and transitions
- Handles player actions and turn progression
- Maintains deck and card dealing

## Game Flow

1. **Initialization**: Create players, shuffle deck, post blinds
2. **Preflop**: Deal hole cards, betting round
3. **Flop**: Deal 3 community cards, betting round
4. **Turn**: Deal 1 community card, betting round
5. **River**: Deal 1 community card, betting round
6. **Showdown**: Evaluate hands, determine winner
7. **New Hand**: Reset and repeat

## Future Enhancements

- **Multiple AI Levels**: Easy, Medium, Hard
- **Statistics Tracking**: Win rates, hand histories
- **Customizable Blinds**: Adjustable blind levels
- **Tournament Mode**: Multi-table tournaments
- **Advanced AI**: Machine learning-based decisions
- **Animations**: Card dealing and chip animations
- **Sound Effects**: Audio feedback for actions

## Troubleshooting

If the game doesn't load:
1. Check browser console for JavaScript errors
2. Ensure all assets are loaded correctly
3. Verify Phaser.js is included
4. Check that all dependencies are available

## Credits

- **Poker Rules**: Standard Texas Hold'em
- **Hand Evaluation**: Custom implementation
- **AI Logic**: Rule-based decision making
- **UI Framework**: Phaser.js game engine 