// Statistics Manager - Local player statistics tracking without player IDs
import { eventManager } from '../utils/EventManager.js';

export class StatisticsManager {
    constructor() {
        this.storageKey = 'poker_player_statistics';
        this.sessionKey = 'poker_session_data';
        this.isDebug = window.isDebug || false;
        
        // Load existing statistics
        this.statistics = this.loadStatistics();
        
        // Initialize session data
        this.sessionData = this.loadSessionData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Initialized with existing data:', this.statistics);
        }
    }

    // Load statistics from localStorage
    loadStatistics() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                return this.validateAndMigrateData(parsed);
            }
        } catch (error) {
            console.error('StatisticsManager: Error loading statistics:', error);
        }
        
        // Return default statistics structure
        return this.getDefaultStatistics();
    }

    // Load session data from localStorage
    loadSessionData() {
        try {
            const data = localStorage.getItem(this.sessionKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('StatisticsManager: Error loading session data:', error);
        }
        
        return this.getDefaultSessionData();
    }

    // Validate and migrate data structure if needed
    validateAndMigrateData(data) {
        const defaultStats = this.getDefaultStatistics();
        
        // Ensure all required fields exist
        for (const [key, defaultValue] of Object.entries(defaultStats)) {
            if (data[key] === undefined) {
                data[key] = defaultValue;
            }
        }
        
        // Remove any playerId fields if they exist
        if (data.playerId) {
            delete data.playerId;
        }
        
        return data;
    }

    // Get default statistics structure
    getDefaultStatistics() {
        return {
            // Game Overview
            totalGames: 0,
            totalHands: 0,
            totalSessions: 0,
            totalPlayTime: 0, // in minutes
            
            // Performance Metrics
            handsWon: 0,
            handsLost: 0,
            showdowns: 0,
            showdownsWon: 0,
            winRate: 0,
            showdownRate: 0,
            
            // Financial Statistics
            totalChipsWon: 0,
            totalChipsLost: 0,
            netChipsGained: 0,
            biggestPotWon: 0,
            biggestPotLost: 0,
            averageBetSize: 0,
            
            // Action Statistics
            totalActions: 0,
            foldActions: 0,
            callActions: 0,
            raiseActions: 0,
            allInActions: 0,
            checkActions: 0,
            
            // Playing Style Analysis
            aggressionFactor: 0.5, // (raises + bets) / (calls + checks)
            loosenessFactor: 0.5,  // (calls + raises) / total actions
            bluffFrequency: 0.1,   // bluffs / total raises
            patienceLevel: 0.5,    // average decision time
            
            // Hand Strength Distribution
            handStrengthStats: {
                highCard: 0,
                pair: 0,
                twoPair: 0,
                threeOfAKind: 0,
                straight: 0,
                flush: 0,
                fullHouse: 0,
                fourOfAKind: 0,
                straightFlush: 0,
                royalFlush: 0
            },
            
            // Position Statistics
            positionStats: {
                early: { actions: 0, wins: 0 },
                middle: { actions: 0, wins: 0 },
                late: { actions: 0, wins: 0 }
            },
            
            // Session Statistics
            averageSessionLength: 0,
            longestSession: 0,
            shortestSession: 0,
            
            // Achievement Tracking
            achievements: {
                firstWin: false,
                tenWins: false,
                hundredHands: false,
                thousandChips: false,
                bigBluff: false,
                royalFlush: false
            },
            
            // Last Updated
            lastUpdated: Date.now()
        };
    }

    // Get default session data structure
    getDefaultSessionData() {
        return {
            sessionStartTime: Date.now(),
            sessionHands: 0,
            sessionWins: 0,
            sessionLosses: 0,
            sessionChipsWon: 0,
            sessionChipsLost: 0,
            sessionActions: 0,
            currentStreak: 0,
            longestWinStreak: 0,
            longestLoseStreak: 0
        };
    }

    // Set up event listeners for game events
    setupEventListeners() {
        // Poker actions
        eventManager.on('poker_action', (action, data) => {
            this.recordAction(action, data);
        });
        
        // Game events
        eventManager.on('hand_won', (data) => {
            this.recordHandWin(data);
        });
        
        eventManager.on('hand_lost', (data) => {
            this.recordHandLoss(data);
        });
        
        eventManager.on('showdown', (data) => {
            this.recordShowdown(data);
        });
        
        eventManager.on('game_started', (data) => {
            this.recordGameStart(data);
        });
        
        eventManager.on('game_ended', (data) => {
            this.recordGameEnd(data);
        });
        
        // Session events
        eventManager.on('session_started', () => {
            this.startNewSession();
        });
        
        eventManager.on('session_ended', () => {
            this.endCurrentSession();
        });
    }

    // Record a poker action
    recordAction(action, data = {}) {
        this.statistics.totalActions++;
        this.sessionData.sessionActions++;
        
        switch (action) {
            case 'fold':
                this.statistics.foldActions++;
                break;
            case 'call':
                this.statistics.callActions++;
                break;
            case 'raise':
                this.statistics.raiseActions++;
                // Check if it's a bluff (low hand strength)
                if (data.handStrength && data.handStrength < 0.4) {
                    this.statistics.bluffFrequency = this.calculateBluffFrequency();
                }
                break;
            case 'allIn':
                this.statistics.allInActions++;
                break;
            case 'check':
                this.statistics.checkActions++;
                break;
        }
        
        // Update playing style factors
        this.updatePlayingStyleFactors();
        
        // Record position if available
        if (data.position) {
            this.recordPositionAction(data.position, action);
        }
        
        this.saveStatistics();
        
        if (this.isDebug) {
            console.log(`StatisticsManager: Recorded action '${action}'`, data);
        }
    }

    // Record a hand win
    recordHandWin(data = {}) {
        this.statistics.handsWon++;
        this.statistics.totalHands++;
        this.sessionData.sessionWins++;
        this.sessionData.sessionHands++;
        
        // Update win rate
        this.statistics.winRate = this.statistics.handsWon / this.statistics.totalHands;
        
        // Record chips won
        if (data.chipsWon) {
            this.statistics.totalChipsWon += data.chipsWon;
            this.statistics.netChipsGained = this.statistics.totalChipsWon - this.statistics.totalChipsLost;
            this.sessionData.sessionChipsWon += data.chipsWon;
            
            // Update biggest pot won
            if (data.chipsWon > this.statistics.biggestPotWon) {
                this.statistics.biggestPotWon = data.chipsWon;
            }
        }
        
        // Record hand strength if available
        if (data.handRank) {
            this.recordHandStrength(data.handRank);
        }
        
        // Update streaks
        this.updateWinStreak(true);
        
        // Check achievements
        this.checkAchievements();
        
        this.saveStatistics();
        this.saveSessionData();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Recorded hand win', data);
        }
    }

    // Record a hand loss
    recordHandLoss(data = {}) {
        this.statistics.handsLost++;
        this.statistics.totalHands++;
        this.sessionData.sessionLosses++;
        this.sessionData.sessionHands++;
        
        // Update win rate
        this.statistics.winRate = this.statistics.handsWon / this.statistics.totalHands;
        
        // Record chips lost
        if (data.chipsLost) {
            this.statistics.totalChipsLost += data.chipsLost;
            this.statistics.netChipsGained = this.statistics.totalChipsWon - this.statistics.totalChipsLost;
            this.sessionData.sessionChipsLost += data.chipsLost;
            
            // Update biggest pot lost
            if (data.chipsLost > this.statistics.biggestPotLost) {
                this.statistics.biggestPotLost = data.chipsLost;
            }
        }
        
        // Update streaks
        this.updateWinStreak(false);
        
        this.saveStatistics();
        this.saveSessionData();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Recorded hand loss', data);
        }
    }

    // Record a showdown
    recordShowdown(data = {}) {
        this.statistics.showdowns++;
        
        if (data.won) {
            this.statistics.showdownsWon++;
        }
        
        // Update showdown rate
        this.statistics.showdownRate = this.statistics.showdowns / this.statistics.totalHands;
        
        // Record bluff if applicable
        if (data.wasBluff !== undefined) {
            if (data.wasBluff && data.won) {
                // Successful bluff
                this.statistics.achievements.bigBluff = true;
            }
        }
        
        this.saveStatistics();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Recorded showdown', data);
        }
    }

    // Record hand strength
    recordHandStrength(handRank) {
        const handStrengthStats = this.statistics.handStrengthStats;
        
        switch (handRank.toLowerCase()) {
            case 'high_card':
                handStrengthStats.highCard++;
                break;
            case 'pair':
                handStrengthStats.pair++;
                break;
            case 'two_pair':
                handStrengthStats.twoPair++;
                break;
            case 'three_of_a_kind':
                handStrengthStats.threeOfAKind++;
                break;
            case 'straight':
                handStrengthStats.straight++;
                break;
            case 'flush':
                handStrengthStats.flush++;
                break;
            case 'full_house':
                handStrengthStats.fullHouse++;
                break;
            case 'four_of_a_kind':
                handStrengthStats.fourOfAKind++;
                break;
            case 'straight_flush':
                handStrengthStats.straightFlush++;
                this.statistics.achievements.royalFlush = true;
                break;
            case 'royal_flush':
                handStrengthStats.royalFlush++;
                this.statistics.achievements.royalFlush = true;
                break;
        }
    }

    // Record position action
    recordPositionAction(position, action) {
        let positionKey = 'middle';
        if (position <= 2) positionKey = 'early';
        else if (position >= 4) positionKey = 'late';
        
        this.statistics.positionStats[positionKey].actions++;
    }

    // Update playing style factors
    updatePlayingStyleFactors() {
        const stats = this.statistics;
        
        // Aggression factor: (raises + all-ins) / (calls + checks)
        const aggressiveActions = stats.raiseActions + stats.allInActions;
        const passiveActions = stats.callActions + stats.checkActions;
        stats.aggressionFactor = passiveActions > 0 ? aggressiveActions / passiveActions : 0.5;
        
        // Looseness factor: (calls + raises) / total actions
        const looseActions = stats.callActions + stats.raiseActions;
        stats.loosenessFactor = stats.totalActions > 0 ? looseActions / stats.totalActions : 0.5;
        
        // Bluff frequency: bluffs / raises (calculated in recordAction)
    }

    // Calculate bluff frequency
    calculateBluffFrequency() {
        const stats = this.statistics;
        return stats.raiseActions > 0 ? stats.bluffActions / stats.raiseActions : 0.1;
    }

    // Update win streak
    updateWinStreak(won) {
        if (won) {
            this.sessionData.currentStreak = Math.max(0, this.sessionData.currentStreak) + 1;
            this.sessionData.longestWinStreak = Math.max(
                this.sessionData.longestWinStreak,
                this.sessionData.currentStreak
            );
        } else {
            this.sessionData.currentStreak = Math.min(0, this.sessionData.currentStreak) - 1;
            this.sessionData.longestLoseStreak = Math.max(
                this.sessionData.longestLoseStreak,
                Math.abs(this.sessionData.currentStreak)
            );
        }
    }

    // Check and update achievements
    checkAchievements() {
        const stats = this.statistics;
        const achievements = stats.achievements;
        
        if (stats.handsWon >= 1 && !achievements.firstWin) {
            achievements.firstWin = true;
        }
        
        if (stats.handsWon >= 10 && !achievements.tenWins) {
            achievements.tenWins = true;
        }
        
        if (stats.totalHands >= 100 && !achievements.hundredHands) {
            achievements.hundredHands = true;
        }
        
        if (stats.totalChipsWon >= 1000 && !achievements.thousandChips) {
            achievements.thousandChips = true;
        }
    }

    // Start a new session
    startNewSession() {
        this.sessionData = this.getDefaultSessionData();
        this.statistics.totalSessions++;
        this.saveSessionData();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Started new session');
        }
    }

    // End current session
    endCurrentSession() {
        const sessionDuration = (Date.now() - this.sessionData.sessionStartTime) / (1000 * 60); // minutes
        this.statistics.totalPlayTime += sessionDuration;
        
        // Update session statistics
        this.statistics.averageSessionLength = this.statistics.totalPlayTime / this.statistics.totalSessions;
        
        if (sessionDuration > this.statistics.longestSession) {
            this.statistics.longestSession = sessionDuration;
        }
        
        if (this.statistics.shortestSession === 0 || sessionDuration < this.statistics.shortestSession) {
            this.statistics.shortestSession = sessionDuration;
        }
        
        this.saveStatistics();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Ended session', {
                duration: sessionDuration,
                hands: this.sessionData.sessionHands,
                wins: this.sessionData.sessionWins
            });
        }
    }

    // Record game start
    recordGameStart(data = {}) {
        this.statistics.totalGames++;
        this.saveStatistics();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Recorded game start', data);
        }
    }

    // Record game end
    recordGameEnd(data = {}) {
        this.saveStatistics();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Recorded game end', data);
        }
    }

    // Save statistics to localStorage
    saveStatistics() {
        try {
            this.statistics.lastUpdated = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.statistics));
        } catch (error) {
            console.error('StatisticsManager: Error saving statistics:', error);
        }
    }

    // Save session data to localStorage
    saveSessionData() {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(this.sessionData));
        } catch (error) {
            console.error('StatisticsManager: Error saving session data:', error);
        }
    }

    // Get all statistics
    getStatistics() {
        return { ...this.statistics };
    }

    // Get session data
    getSessionData() {
        return { ...this.sessionData };
    }

    // Get summary statistics
    getSummary() {
        const stats = this.statistics;
        return {
            totalGames: stats.totalGames,
            totalHands: stats.totalHands,
            winRate: (stats.winRate * 100).toFixed(1) + '%',
            showdownRate: (stats.showdownRate * 100).toFixed(1) + '%',
            netChips: stats.netChipsGained,
            biggestPot: stats.biggestPotWon,
            aggressionFactor: (stats.aggressionFactor * 100).toFixed(1) + '%',
            loosenessFactor: (stats.loosenessFactor * 100).toFixed(1) + '%',
            achievements: Object.values(stats.achievements).filter(Boolean).length
        };
    }

    // Reset all statistics
    resetStatistics() {
        this.statistics = this.getDefaultStatistics();
        this.sessionData = this.getDefaultSessionData();
        this.saveStatistics();
        this.saveSessionData();
        
        if (this.isDebug) {
            console.log('StatisticsManager: Reset all statistics');
        }
    }

    // Export statistics as JSON
    exportStatistics() {
        return JSON.stringify({
            statistics: this.statistics,
            sessionData: this.sessionData,
            exportDate: new Date().toISOString()
        }, null, 2);
    }

    // Import statistics from JSON
    importStatistics(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.statistics) {
                this.statistics = this.validateAndMigrateData(data.statistics);
                this.saveStatistics();
            }
            if (data.sessionData) {
                this.sessionData = data.sessionData;
                this.saveSessionData();
            }
            
            if (this.isDebug) {
                console.log('StatisticsManager: Imported statistics successfully');
            }
            return true;
        } catch (error) {
            console.error('StatisticsManager: Error importing statistics:', error);
            return false;
        }
    }

    // Clean up event listeners
    cleanup() {
        eventManager.off('poker_action');
        eventManager.off('hand_won');
        eventManager.off('hand_lost');
        eventManager.off('showdown');
        eventManager.off('game_started');
        eventManager.off('game_ended');
        eventManager.off('session_started');
        eventManager.off('session_ended');
    }
}
