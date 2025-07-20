# Enhanced AI Bot System - Poker Game

## Overview

The poker game now features 4 distinct AI personalities, each with unique playing styles, decision-making patterns, and strategic approaches. This creates a more dynamic and challenging gaming experience.

## AI Personalities

### 🎯 Tight Aggressive
- **Playing Style**: Selective but aggressive
- **Personality Traits**:
  - Aggression: 80%
  - Looseness: 20%
  - Bluff Frequency: 10%
  - Patience: 90%
  - Risk Tolerance: 60%
- **Strategy**: Plays few hands but bets aggressively when they do. High patience allows for strategic waiting, while aggression ensures value extraction from strong hands.
- **Visual Indicator**: Green tint when active

### 🐟 Loose Passive
- **Playing Style**: Plays many hands but rarely raises
- **Personality Traits**:
  - Aggression: 20%
  - Looseness: 80%
  - Bluff Frequency: 5%
  - Patience: 30%
  - Risk Tolerance: 40%
- **Strategy**: Calls frequently with weak hands, rarely bluffs, and often pays off stronger hands. Good for learning as they provide action but are predictable.
- **Visual Indicator**: Cyan tint when active

### 🎭 Manic Bluffer
- **Playing Style**: Highly aggressive with frequent bluffs
- **Personality Traits**:
  - Aggression: 90%
  - Looseness: 70%
  - Bluff Frequency: 40%
  - Patience: 10%
  - Risk Tolerance: 90%
- **Strategy**: Unpredictable and dangerous. Bluffs frequently, especially in late position. Can be very profitable or lose quickly depending on opponents' reactions.
- **Visual Indicator**: Magenta tint when active

### 🪨 Solid Rock
- **Playing Style**: Very selective, only plays premium hands
- **Personality Traits**:
  - Aggression: 30%
  - Looseness: 10%
  - Bluff Frequency: 2%
  - Patience: 95%
  - Risk Tolerance: 20%
- **Strategy**: Extremely tight, only plays the strongest hands. Very predictable but hard to exploit due to hand strength. Good for learning patience and hand selection.
- **Visual Indicator**: Yellow tint when active

## Technical Implementation

### Personality System
Each AI has a personality object with 5 key traits:
```javascript
personality: {
    aggression: 0.8,        // Tendency to raise vs call
    looseness: 0.2,         // Tendency to play weak hands
    bluffFrequency: 0.1,    // Likelihood of bluffing
    patience: 0.9,          // Tendency to fold weak hands
    riskTolerance: 0.6      // Willingness to risk chips
}
```

### Decision Making Process
1. **Hand Strength Evaluation**: Sophisticated preflop and postflop hand evaluation
2. **Personality Adjustment**: Hand strength is adjusted based on AI's looseness trait
3. **Bluff Calculation**: Determines bluff probability based on position, hand strength, and personality
4. **Action Selection**: Chooses action (fold/call/raise) based on personality-specific decision trees
5. **Bet Sizing**: Calculates bet size based on personality and hand strength

### Enhanced Features

#### 1. Dynamic Thinking Time
- Different AI personalities think at different speeds
- Manic Bluffer: Fast decisions (300-800ms)
- Solid Rock: Slow, deliberate decisions (800-2000ms)

#### 2. Position Awareness
- AIs adjust their strategy based on position at the table
- Late position allows for more aggressive play and bluffing
- Early position requires stronger hands to play

#### 3. Sophisticated Hand Evaluation
- Detailed preflop hand rankings (AA = 0.95, 22 = 0.40)
- Considers suitedness, connectivity, and high card value
- Postflop evaluation using HandEvaluator utility

#### 4. Performance Tracking
- Tracks hands played, hands won, and win rates
- Monitors betting patterns and total bets placed
- Logs detailed decision-making information

#### 5. Visual Indicators
- Personality icons in player names (🎯🐟🎭🪨)
- Color-coded avatars when active
- Enhanced game title and AI info display

## Usage

### Starting the Game
1. Open `test-enhanced-ai.html` to see AI personality overview
2. Click "Start Enhanced AI Game" to begin playing
3. Observe different AI behaviors and strategies

### Observing AI Behavior
- Watch for different betting patterns between AI types
- Notice bluffing frequency differences
- Observe position-based strategy adjustments
- Monitor performance statistics in console logs

### Learning Opportunities
- **Tight Aggressive**: Learn value betting and hand selection
- **Loose Passive**: Practice exploiting weak players
- **Manic Bluffer**: Learn to identify and counter bluffs
- **Solid Rock**: Study patience and premium hand play

## Console Logging

The enhanced AI system provides detailed console logging:
```
AIBotScene: 🎯 Tight Aggressive (tight_aggressive) decision: {
    handStrength: 0.85,
    adjustedHandStrength: 0.82,
    bluffProbability: 0.05,
    action: "raise",
    betSize: 60,
    position: 2,
    potOdds: 0.25
}
AIBotScene: 📈 🎯 Tight Aggressive (tight_aggressive) raises $60
```

## File Structure

- `src/scenes/AIBotScene.js` - Main AI implementation
- `test-enhanced-ai.html` - AI personality showcase
- `ENHANCED_AI_README.md` - This documentation

## Future Enhancements

Potential improvements for the AI system:
1. **Adaptive Learning**: AIs that learn from player patterns
2. **Emotional States**: AIs that tilt or become more aggressive after losses
3. **Table Dynamics**: AIs that adjust based on other players' styles
4. **Advanced Bluffing**: More sophisticated bluff detection and execution
5. **Tournament Mode**: AIs with different strategies for tournament play

## Testing

To test the enhanced AI system:
1. Open `test-enhanced-ai.html` in a web browser
2. Review the AI personality descriptions
3. Start the game and observe different AI behaviors
4. Check console logs for detailed decision-making information
5. Play multiple hands to see how different AIs perform over time

The enhanced AI system creates a much more engaging and educational poker experience, with each AI providing unique challenges and learning opportunities. 