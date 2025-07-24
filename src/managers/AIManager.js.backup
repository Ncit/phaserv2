import { HandEvaluator } from '../utils/HandEvaluator.js';

export class AIManager {
    constructor() {
        this.handEvaluator = new HandEvaluator();
        this.playerProfile = this.loadProfileFromStorage() || {
            aggression: 0.5,
            looseness: 0.5,
            bluffFrequency: 0.1,
            totalActions: 0,
            raiseActions: 0,
            callActions: 0,
            foldActions: 0,
            bluffActions: 0,
            showdownBluffs: 0,
            showdownHands: 0
        };
    }

    saveProfileToStorage() {
        try {
            localStorage.setItem('ai_player_profile', JSON.stringify(this.playerProfile));
        } catch (e) { /* ignore */ }
    }

    loadProfileFromStorage() {
        try {
            const data = localStorage.getItem('ai_player_profile');
            if (data) return JSON.parse(data);
        } catch (e) { /* ignore */ }
        return null;
    }

    /**
     * Calculate thinking time based on AI personality
     * @param {Object} player - The AI player object
     * @returns {number} - Thinking time in milliseconds
     */
    calculateThinkingTime(player) {
        const baseTime = 800;
        const personality = player.personality;
        
        // Manic bluffer thinks fast, solid rock thinks slow
        const speedMultiplier = 1 - (personality.patience * 0.5);
        return Math.max(300, Math.min(2000, baseTime * speedMultiplier));
    }

    /**
     * Calculate AI decision based on game state and personality
     * @param {Object} player - The AI player object
     * @param {Object} gameState - Current game state
     * @returns {Object} - Decision object with action and amount
     */
    calculateAIDecision(player, gameState) {
        // Use adapted personality
        const adaptedPersonality = player.isAI && player.personality
            ? this.getAdaptedPersonality(player.personality)
            : player.personality;
        const callAmount = gameState.currentBet - player.currentBet;
        const potOdds = callAmount / (gameState.pot + callAmount);
        const handStrength = this.evaluateHandStrength(player, gameState);
        const position = this.getPlayerPosition(player.id, gameState);
        const isLatePosition = position >= 3;
        // Calculate adjusted hand strength based on adapted personality
        const adjustedHandStrength = this.adjustHandStrengthForPersonality(handStrength, adaptedPersonality);
        // Calculate bluff probability
        const bluffProbability = this.calculateBluffProbability(player, handStrength, position, gameState, adaptedPersonality);
        // Determine action based on AI personality
        const action = this.determineActionByPersonality(
            { ...player, personality: adaptedPersonality },
            adjustedHandStrength, potOdds, position, bluffProbability
        );
        // Calculate bet sizing based on personality
        const betSize = this.calculateBetSizeByPersonality(
            { ...player, personality: adaptedPersonality },
            action, adjustedHandStrength, potOdds, gameState
        );
        console.log(`AIManager: ${player.name} (${player.aiLevel}) decision:`, {
            handStrength: handStrength.toFixed(2),
            adjustedHandStrength: adjustedHandStrength.toFixed(2),
            bluffProbability: bluffProbability.toFixed(2),
            action: action,
            betSize: betSize,
            position: position,
            potOdds: potOdds.toFixed(2),
            adaptedPersonality
        });
        return { action, amount: betSize };
    }

    /**
     * Adjust hand strength based on AI personality
     * @param {number} handStrength - Base hand strength (0-1)
     * @param {Object} personality - AI personality object
     * @returns {number} - Adjusted hand strength
     */
    adjustHandStrengthForPersonality(handStrength, personality) {
        // Loose players overvalue hands, tight players undervalue hands
        const loosenessAdjustment = (personality.looseness - 0.5) * 0.3;
        return Math.max(0, Math.min(1, handStrength + loosenessAdjustment));
    }

    /**
     * Calculate bluff probability based on personality and game state
     * @param {Object} player - The AI player object
     * @param {number} handStrength - Hand strength (0-1)
     * @param {number} position - Player position
     * @param {Object} gameState - Current game state
     * @param {Object} personality - Current personality object
     * @returns {number} - Bluff probability (0-1)
     */
    calculateBluffProbability(player, handStrength, position, gameState, personality) {
        const baseBluffProb = personality.bluffFrequency;
        
        // Bluff more in late position
        const positionBonus = position >= 3 ? 0.2 : 0;
        
        // Bluff less with strong hands
        const handStrengthPenalty = handStrength * 0.5;
        
        // Bluff more when pot is large relative to stack
        const potSizeBonus = gameState.pot > player.bank * 0.5 ? 0.1 : 0;
        
        return Math.max(0, Math.min(1, baseBluffProb + positionBonus - handStrengthPenalty + potSizeBonus));
    }

    /**
     * Determine action based on AI personality
     * @param {Object} player - The AI player object
     * @param {number} adjustedHandStrength - Adjusted hand strength
     * @param {number} potOdds - Pot odds
     * @param {number} position - Player position
     * @param {number} bluffProbability - Bluff probability
     * @returns {string} - Action ('fold', 'call', 'raise')
     */
    determineActionByPersonality(player, adjustedHandStrength, potOdds, position, bluffProbability) {
        const personality = player.personality;
        const random = Math.random();
        
        // Check if this is a bluff
        if (random < bluffProbability && adjustedHandStrength < 0.6) {
            return 'raise';
        }
        
        // Determine action based on personality and hand strength
        switch (player.aiLevel) {
            case 'tight_aggressive':
                return this.tightAggressiveDecision(adjustedHandStrength, potOdds, position);
            case 'loose_passive':
                return this.loosePassiveDecision(adjustedHandStrength, potOdds, position);
            case 'manic_bluffer':
                return this.manicBlufferDecision(adjustedHandStrength, potOdds, position, random);
            case 'solid_rock':
                return this.solidRockDecision(adjustedHandStrength, potOdds, position);
            default:
                return this.defaultDecision(adjustedHandStrength, potOdds, position);
        }
    }

    /**
     * Tight aggressive decision logic
     */
    tightAggressiveDecision(handStrength, potOdds, position) {
        if (handStrength > 0.7) {
            return 'raise';
        } else if (handStrength > 0.5 || (potOdds < 0.3 && position >= 2)) {
            return 'call';
        } else {
            return 'fold';
        }
    }

    /**
     * Loose passive decision logic
     */
    loosePassiveDecision(handStrength, potOdds, position) {
        if (handStrength > 0.8) {
            return 'raise';
        } else if (handStrength > 0.2 || potOdds < 0.4) {
            return 'call';
        } else {
            return 'fold';
        }
    }

    /**
     * Manic bluffer decision logic
     */
    manicBlufferDecision(handStrength, potOdds, position, random) {
        if (handStrength > 0.6) {
            return 'raise';
        } else if (random < 0.4 && position >= 2) {
            return 'raise'; // Bluff frequently
        } else if (handStrength > 0.3 || potOdds < 0.5) {
            return 'call';
        } else {
            return 'fold';
        }
    }

    /**
     * Solid rock decision logic
     */
    solidRockDecision(handStrength, potOdds, position) {
        if (handStrength > 0.8) {
            return 'raise';
        } else if (handStrength > 0.6 && position >= 3) {
            return 'call';
        } else if (handStrength > 0.4 && potOdds < 0.2) {
            return 'call';
        } else {
            return 'fold';
        }
    }

    /**
     * Default decision logic
     */
    defaultDecision(handStrength, potOdds, position) {
        if (handStrength > 0.7) {
            return 'raise';
        } else if (handStrength > 0.4 || potOdds < 0.3) {
            return 'call';
        } else {
            return 'fold';
        }
    }

    /**
     * Calculate bet size based on personality
     * @param {Object} player - The AI player object
     * @param {string} action - The action to take
     * @param {number} handStrength - Hand strength
     * @param {number} potOdds - Pot odds
     * @param {Object} gameState - Current game state
     * @returns {number} - Bet amount
     */
    calculateBetSizeByPersonality(player, action, handStrength, potOdds, gameState) {
        const personality = player.personality;
        const callAmount = gameState.currentBet - player.currentBet;
        
        if (action === 'fold') {
            return 0;
        } else if (action === 'call') {
            return callAmount;
        } else if (action === 'raise') {
            // Calculate raise size based on personality
            let raiseMultiplier = 1;
            
            if (player.aiLevel === 'tight_aggressive') {
                raiseMultiplier = handStrength > 0.8 ? 3 : 2;
            } else if (player.aiLevel === 'loose_passive') {
                raiseMultiplier = handStrength > 0.7 ? 2 : 1.5;
            } else if (player.aiLevel === 'manic_bluffer') {
                raiseMultiplier = handStrength > 0.6 ? 4 : 2.5;
            } else if (player.aiLevel === 'solid_rock') {
                raiseMultiplier = handStrength > 0.8 ? 2.5 : 1.8;
            }
            
            const baseBet = gameState.currentBet === 0 ? gameState.bigBlind : gameState.currentBet;
            const raiseAmount = Math.floor(baseBet * raiseMultiplier);
            
            // Ensure raise doesn't exceed player's bank
            return Math.min(raiseAmount, player.bank);
        }
        
        return callAmount;
    }

    /**
     * Evaluate hand strength for a player
     * @param {Object} player - The player object
     * @param {Object} gameState - Current game state
     * @returns {number} - Hand strength (0-1)
     */
    evaluateHandStrength(player, gameState) {
        const hand = player.hand;
        const community = gameState.communityCards;
        
        if (community.length === 0) {
            // Preflop - evaluate hole cards only
            return this.evaluateHoleCards(hand);
        } else {
            // Postflop - evaluate complete hand
            const handEvaluation = this.handEvaluator.evaluateHand(hand, community);
            return this.handEvaluator.getHandStrength(handEvaluation);
        }
    }

    /**
     * Evaluate hole cards strength (preflop)
     * @param {Array} holeCards - Array of hole cards
     * @returns {number} - Hand strength (0-1)
     */
    evaluateHoleCards(holeCards) {
        if (holeCards.length !== 2) return 0;
        
        const [card1, card2] = holeCards;
        const val1 = this.handEvaluator.cardValues[card1.value];
        const val2 = this.handEvaluator.cardValues[card2.value];
        const isSuited = card1.suit === card2.suit;
        const isConnected = Math.abs(val1 - val2) <= 2;
        const isBroadway = val1 >= 10 && val2 >= 10;
        
        // Premium pairs
        if (val1 === val2) {
            if (val1 === 14) return 0.95; // AA
            if (val1 === 13) return 0.92; // KK
            if (val1 === 12) return 0.88; // QQ
            if (val1 === 11) return 0.84; // JJ
            if (val1 === 10) return 0.80; // TT
            if (val1 === 9) return 0.75; // 99
            if (val1 === 8) return 0.70; // 88
            if (val1 === 7) return 0.65; // 77
            if (val1 === 6) return 0.60; // 66
            if (val1 === 5) return 0.55; // 55
            if (val1 === 4) return 0.50; // 44
            if (val1 === 3) return 0.45; // 33
            return 0.40; // 22
        }
        
        // Premium unpaired hands
        if (val1 === 14 || val2 === 14) {
            const otherVal = val1 === 14 ? val2 : val1;
            if (otherVal === 13) return isSuited ? 0.90 : 0.85; // AK
            if (otherVal === 12) return isSuited ? 0.87 : 0.82; // AQ
            if (otherVal === 11) return isSuited ? 0.84 : 0.79; // AJ
            if (otherVal === 10) return isSuited ? 0.81 : 0.76; // AT
            if (otherVal === 9) return isSuited ? 0.78 : 0.73; // A9
            if (otherVal === 8) return isSuited ? 0.75 : 0.70; // A8
            if (otherVal === 7) return isSuited ? 0.72 : 0.67; // A7
            if (otherVal === 6) return isSuited ? 0.69 : 0.64; // A6
            if (otherVal === 5) return isSuited ? 0.66 : 0.61; // A5
            if (otherVal === 4) return isSuited ? 0.63 : 0.58; // A4
            if (otherVal === 3) return isSuited ? 0.60 : 0.55; // A3
            return isSuited ? 0.57 : 0.52; // A2
        }
        
        // Broadway pairs
        if (isBroadway && val1 !== val2) {
            if (val1 === 13 && val2 === 12) return isSuited ? 0.75 : 0.70; // KQ
            if (val1 === 13 && val2 === 11) return isSuited ? 0.72 : 0.67; // KJ
            if (val1 === 13 && val2 === 10) return isSuited ? 0.69 : 0.64; // KT
            if (val1 === 12 && val2 === 11) return isSuited ? 0.66 : 0.61; // QJ
            if (val1 === 12 && val2 === 10) return isSuited ? 0.63 : 0.58; // QT
            if (val1 === 11 && val2 === 10) return isSuited ? 0.60 : 0.55; // JT
        }
        
        // Connected hands
        if (isConnected) {
            const maxVal = Math.max(val1, val2);
            if (maxVal >= 10) return isSuited ? 0.55 : 0.50; // High connected
            if (maxVal >= 7) return isSuited ? 0.50 : 0.45; // Medium connected
            return isSuited ? 0.45 : 0.40; // Low connected
        }
        
        // Suited connectors
        if (isSuited && Math.abs(val1 - val2) <= 3) {
            const maxVal = Math.max(val1, val2);
            if (maxVal >= 10) return 0.50; // High suited connector
            if (maxVal >= 7) return 0.45; // Medium suited connector
            return 0.40; // Low suited connector
        }
        
        // High card hands
        if (val1 >= 10 && val2 >= 10) return isSuited ? 0.45 : 0.40; // High cards
        if (val1 >= 9 || val2 >= 9) return isSuited ? 0.40 : 0.35; // One high card
        
        return 0.25; // Weak hands
    }

    /**
     * Get player position relative to dealer
     * @param {number} playerId - Player ID
     * @param {Object} gameState - Current game state
     * @returns {number} - Player position (0-based)
     */
    getPlayerPosition(playerId, gameState) {
        const dealerPos = gameState.dealerPosition;
        const playerPos = (playerId - dealerPos + gameState.players.length) % gameState.players.length;
        return playerPos;
    }

    /**
     * Execute AI action and update player state
     * @param {Object} player - The AI player object
     * @param {Object} decision - Decision object with action and amount
     */
    executeAIAction(player, decision) {
        // Track the action for AI learning
        player.lastAction = decision.action;
        player.totalBets += decision.amount;
        
        // Log AI action with personality context
        const actionEmoji = decision.action === 'fold' ? '🃏' : 
                           decision.action === 'call' ? '📞' : '📈';
        
        console.log(`AIManager: ${actionEmoji} ${player.name} (${player.aiLevel}) ${decision.action}s ${decision.amount > 0 ? `$${decision.amount}` : ''}`);
        
        return decision;
    }

    /**
     * Update AI statistics after a hand
     * @param {Array} playerHands - Array of player hand evaluations
     * @param {Array} winners - Array of winning players
     */
    updateAIStatistics(playerHands, winners, players) {
        // Update statistics for all AI players
        players.forEach(player => {
            if (player.isAI) {
                player.handsPlayed++;
                
                // Check if this player won
                const isWinner = winners.some(({ player: winner }) => winner.id === player.id);
                if (isWinner) {
                    player.handsWon++;
                }
                
                // Calculate win rate
                const winRate = player.handsPlayed > 0 ? (player.handsWon / player.handsPlayed * 100).toFixed(1) : 0;
                
                console.log(`AIManager: ${player.name} (${player.aiLevel}) stats:`, {
                    handsPlayed: player.handsPlayed,
                    handsWon: player.handsWon,
                    winRate: `${winRate}%`,
                    currentBank: player.bank
                });
            }
        });
    }

    /**
     * Get AI personality icon based on AI level
     * @param {string} aiLevel - AI level string
     * @returns {string} - Personality icon emoji
     */
    getPersonalityIcon(aiLevel) {
        switch (aiLevel) {
            case 'tight_aggressive':
                return '🎯'; // Target for precision
            case 'loose_passive':
                return '🐟'; // Fish for loose play
            case 'manic_bluffer':
                return '🎭'; // Drama mask for bluffing
            case 'solid_rock':
                return '🪨'; // Rock for solid play
            default:
                return '🤖'; // Default robot
        }
    }

    /**
     * Get AI personality color tint based on AI level
     * @param {string} aiLevel - AI level string
     * @returns {number} - Color tint value
     */
    getPersonalityColor(aiLevel) {
        switch (aiLevel) {
            case 'tight_aggressive':
                return 0x00ff00; // Green
            case 'loose_passive':
                return 0x00ffff; // Cyan
            case 'manic_bluffer':
                return 0xff00ff; // Magenta
            case 'solid_rock':
                return 0xffff00; // Yellow
            default:
                return 0x00ff00; // Default green
        }
    }

    // Call this from AIBotScene whenever the player acts
    recordPlayerAction(action, context = {}) {
        this.playerProfile.totalActions++;
        if (action === 'raise') {
            this.playerProfile.raiseActions++;
            // If context.handStrength is low, count as bluff
            if (context.handStrength !== undefined && context.handStrength < 0.4) {
                this.playerProfile.bluffActions++;
            }
        } else if (action === 'call') {
            this.playerProfile.callActions++;
        } else if (action === 'fold') {
            this.playerProfile.foldActions++;
        }
        // Update rolling stats
        this.updatePlayerStats();
    }

    // Call this at showdown to track bluffs
    recordShowdown(playerHandStrength, wasBluff) {
        this.playerProfile.showdownHands++;
        if (wasBluff) this.playerProfile.showdownBluffs++;
    }

    updatePlayerStats() {
        const p = this.playerProfile;
        // Aggression: raises / (calls + raises)
        const totalAggressive = p.raiseActions + p.callActions;
        p.aggression = totalAggressive > 0 ? p.raiseActions / totalAggressive : 0.5;
        // Looseness: (calls + raises) / total actions
        p.looseness = p.totalActions > 0 ? (p.raiseActions + p.callActions) / p.totalActions : 0.5;
        // Bluff frequency: bluffs / raises
        p.bluffFrequency = p.raiseActions > 0 ? p.bluffActions / p.raiseActions : 0.1;
        this.saveProfileToStorage();
    }

    // Get adapted personality for an AI (base + adaptation)
    getAdaptedPersonality(basePersonality) {
        const p = this.playerProfile;
        // Adaptation: if player is aggressive, AI tightens up; if player bluffs, AI calls more, etc.
        return {
            aggression: this.clamp(basePersonality.aggression + (0.5 - p.aggression) * 0.3, 0, 1),
            looseness: this.clamp(basePersonality.looseness + (0.5 - p.looseness) * 0.3, 0, 1),
            bluffFrequency: this.clamp(basePersonality.bluffFrequency + (p.bluffFrequency - 0.1) * 0.5, 0, 1),
            patience: basePersonality.patience,
            riskTolerance: basePersonality.riskTolerance
        };
    }

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
} 