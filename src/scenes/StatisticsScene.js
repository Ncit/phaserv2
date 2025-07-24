import { StatisticsManager } from '../managers/StatisticsManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { eventManager } from '../utils/EventManager.js';

export class StatisticsScene extends Phaser.Scene {
    constructor() {
        super('StatisticsScene');
        this.statisticsManager = null;
        this.isDebug = window.isDebug || false;
    }

    preload() {
        // Load any additional assets needed for statistics display
        this.load.image('stats_background', 'assets/lobby_background.png');
        this.load.image('back_button', 'assets/settings_button.png');
    }

    create() {
        if (this.isDebug) {
            console.log('StatisticsScene: Creating statistics display');
        }

        // Initialize statistics manager
        this.statisticsManager = new StatisticsManager();

        // Create background
        this.createBackground();

        // Create title
        this.createTitle();

        // Create statistics sections
        this.createOverviewSection();
        this.createPerformanceSection();
        this.createFinancialSection();
        this.createPlayingStyleSection();
        this.createAchievementsSection();

        // Create navigation buttons
        this.createNavigationButtons();

        // Set up event listeners
        this.setupEventListeners();
    }

    createBackground() {
        // Add background image
        this.add.image(
            GameConfig.screen.centerX,
            GameConfig.screen.centerY,
            'stats_background'
        ).setDisplaySize(GameConfig.screen.width, GameConfig.screen.height);

        // Add semi-transparent overlay
        const overlay = this.add.rectangle(
            GameConfig.screen.centerX,
            GameConfig.screen.centerY,
            GameConfig.screen.width,
            GameConfig.screen.height,
            0x000000,
            0.7
        );
    }

    createTitle() {
        const title = this.add.text(
            GameConfig.screen.centerX,
            80,
            'СТАТИСТИКА ИГРОКА',
            {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.xlarge,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        title.setOrigin(0.5);
    }

    createOverviewSection() {
        const stats = this.statisticsManager.getSummary();
        const sessionData = this.statisticsManager.getSessionData();

        // Section title
        this.add.text(50, 150, 'ОБЗОР ИГРЫ', {
            fontFamily: GameConfig.typography.fontFamily,
            fontSize: GameConfig.typography.sizes.large,
            color: '#FF6A13',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Overview stats
        const overviewStats = [
            `Всего игр: ${stats.totalGames}`,
            `Всего рук: ${stats.totalHands}`,
            `Процент побед: ${stats.winRate}`,
            `Процент шоудаунов: ${stats.showdownRate}`,
            `Сессия: ${sessionData.sessionHands} рук, ${sessionData.sessionWins} побед`
        ];

        overviewStats.forEach((stat, index) => {
            this.add.text(50, 190 + (index * 30), stat, {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.medium,
                color: '#ffffff'
            });
        });
    }

    createPerformanceSection() {
        const stats = this.statisticsManager.getStatistics();

        // Section title
        this.add.text(400, 150, 'ПРОИЗВОДИТЕЛЬНОСТЬ', {
            fontFamily: GameConfig.typography.fontFamily,
            fontSize: GameConfig.typography.sizes.large,
            color: '#FF6A13',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Performance stats
        const performanceStats = [
            `Победы: ${stats.handsWon}`,
            `Поражения: ${stats.handsLost}`,
            `Шоудауны: ${stats.showdowns}`,
            `Выигранные шоудауны: ${stats.showdownsWon}`,
            `Время игры: ${Math.round(stats.totalPlayTime)} мин`
        ];

        performanceStats.forEach((stat, index) => {
            this.add.text(400, 190 + (index * 30), stat, {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.medium,
                color: '#ffffff'
            });
        });
    }

    createFinancialSection() {
        const stats = this.statisticsManager.getStatistics();

        // Section title
        this.add.text(750, 150, 'ФИНАНСЫ', {
            fontFamily: GameConfig.typography.fontFamily,
            fontSize: GameConfig.typography.sizes.large,
            color: '#FF6A13',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Financial stats
        const financialStats = [
            `Выиграно фишек: ${stats.totalChipsWon.toLocaleString()}`,
            `Проиграно фишек: ${stats.totalChipsLost.toLocaleString()}`,
            `Чистая прибыль: ${stats.netChipsGained.toLocaleString()}`,
            `Самый большой банк: ${stats.biggestPotWon.toLocaleString()}`,
            `Средняя ставка: ${Math.round(stats.averageBetSize)}`
        ];

        financialStats.forEach((stat, index) => {
            this.add.text(750, 190 + (index * 30), stat, {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.medium,
                color: '#ffffff'
            });
        });
    }

    createPlayingStyleSection() {
        const stats = this.statisticsManager.getStatistics();

        // Section title
        this.add.text(50, 350, 'СТИЛЬ ИГРЫ', {
            fontFamily: GameConfig.typography.fontFamily,
            fontSize: GameConfig.typography.sizes.large,
            color: '#FF6A13',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Playing style stats
        const styleStats = [
            `Фактор агрессии: ${stats.aggressionFactor.toFixed(2)}`,
            `Фактор развязности: ${stats.loosenessFactor.toFixed(2)}`,
            `Частота блефа: ${(stats.bluffFrequency * 100).toFixed(1)}%`,
            `Всего действий: ${stats.totalActions}`,
            `Фолды: ${stats.foldActions}`,
            `Коллы: ${stats.callActions}`,
            `Рейзы: ${stats.raiseActions}`,
            `Олл-ины: ${stats.allInActions}`
        ];

        styleStats.forEach((stat, index) => {
            this.add.text(50, 390 + (index * 25), stat, {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.small,
                color: '#ffffff'
            });
        });
    }

    createAchievementsSection() {
        const stats = this.statisticsManager.getStatistics();

        // Section title
        this.add.text(400, 350, 'ДОСТИЖЕНИЯ', {
            fontFamily: GameConfig.typography.fontFamily,
            fontSize: GameConfig.typography.sizes.large,
            color: '#FF6A13',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Achievements
        const achievements = [
            { name: 'Первая победа', unlocked: stats.achievements.firstWin },
            { name: '10 побед', unlocked: stats.achievements.tenWins },
            { name: '100 рук', unlocked: stats.achievements.hundredHands },
            { name: '1000 фишек', unlocked: stats.achievements.thousandChips },
            { name: 'Большой блеф', unlocked: stats.achievements.bigBluff },
            { name: 'Роял флеш', unlocked: stats.achievements.royalFlush }
        ];

        achievements.forEach((achievement, index) => {
            const status = achievement.unlocked ? '✅' : '❌';
            const color = achievement.unlocked ? '#00FF00' : '#FF0000';
            
            this.add.text(400, 390 + (index * 25), `${status} ${achievement.name}`, {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.small,
                color: color
            });
        });
    }

    createNavigationButtons() {
        // Back button
        const backButton = this.add.text(
            GameConfig.screen.centerX,
            GameConfig.screen.height - 80,
            'НАЗАД',
            {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.large,
                color: '#ffffff',
                backgroundColor: '#FF6A13',
                padding: { x: 20, y: 10 }
            }
        );
        backButton.setOrigin(0.5);
        backButton.setInteractive();

        // Button hover effects
        backButton.on('pointerover', () => {
            backButton.setBackgroundColor('#FF8E53');
        });

        backButton.on('pointerout', () => {
            backButton.setBackgroundColor('#FF6A13');
        });

        backButton.on('pointerdown', () => {
            this.scene.start('LobbyScene');
        });
    }

    showResetConfirmation() {
        // Create confirmation dialog
        const overlay = this.add.rectangle(
            GameConfig.screen.centerX,
            GameConfig.screen.centerY,
            GameConfig.screen.width,
            GameConfig.screen.height,
            0x000000,
            0.8
        );

        const dialog = this.add.rectangle(
            GameConfig.screen.centerX,
            GameConfig.screen.centerY,
            400,
            200,
            0x333333
        );

        // Yes button
        const yesButton = this.add.text(
            GameConfig.screen.centerX - 80,
            GameConfig.screen.centerY + 30,
            'ДА',
            {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.medium,
                color: '#ffffff',
                backgroundColor: '#FF0000',
                padding: { x: 15, y: 8 }
            }
        );
        yesButton.setOrigin(0.5);
        yesButton.setInteractive();

        yesButton.on('pointerdown', () => {
            this.statisticsManager.resetStatistics();
            this.scene.restart();
        });

        // No button
        const noButton = this.add.text(
            GameConfig.screen.centerX + 80,
            GameConfig.screen.centerY + 30,
            'НЕТ',
            {
                fontFamily: GameConfig.typography.fontFamily,
                fontSize: GameConfig.typography.sizes.medium,
                color: '#ffffff',
                backgroundColor: '#666666',
                padding: { x: 15, y: 8 }
            }
        );
        noButton.setOrigin(0.5);
        noButton.setInteractive();

        noButton.on('pointerdown', () => {
            overlay.destroy();
            dialog.destroy();
            confirmText.destroy();
            yesButton.destroy();
            noButton.destroy();
        });
    }

    setupEventListeners() {
        // Handle keyboard events
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('LobbyScene');
        });
    }

    shutdown() {
        // Clean up event listeners
        this.input.keyboard.off('keydown-ESC');
        
        if (this.statisticsManager) {
            this.statisticsManager.cleanup();
        }
    }
} 