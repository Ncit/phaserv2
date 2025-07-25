import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.leaderboardData = [];
        this.isLoading = true;
        this.currentPage = 0;
        this.itemsPerPage = 10;
    }

    preload() {
        // Load background and UI assets
        this.load.image('leaderboard_bg', 'assets/lobby_background.png');
        this.load.image('back_button', 'assets/back_button.png');
        this.load.image('refresh_button', 'assets/refresh_button.png');
        this.load.image('player_card', 'assets/player_card.png');
        this.load.image('crown_gold', 'assets/crown.png');
        this.load.image('crown_silver', 'assets/crown.png');
        this.load.image('crown_bronze', 'assets/crown.png');
    }

    create() {
        this.createBackground();
        this.createHeader();
        this.createLeaderboardContainer();
        this.createNavigationButtons();
        this.createLoadingIndicator();
        
        // Load leaderboard data
        this.loadLeaderboardData();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    createBackground() {
        // Create background
        this.add.image(640, 360, 'leaderboard_bg');
        
        // Add overlay for better text readability
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.3);
    }

    createHeader() {
        // Title
        const title = this.add.text(640, 80, 'РЕЙТИНГ ИГРОКОВ', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(640, 130, 'Топ игроков по рейтингу', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#cccccc'
        });
        subtitle.setOrigin(0.5);
    }

    createLeaderboardContainer() {
        // Create container for leaderboard items
        this.leaderboardContainer = this.add.container(640, 200);
        
        // Background for leaderboard
        const leaderboardBg = this.add.rectangle(0, 0, 1000, 400, 0x000000, 0.7);
        leaderboardBg.setStrokeStyle(2, 0x444444);
        this.leaderboardContainer.add(leaderboardBg);
    }

    createNavigationButtons() {
        // Back button
        this.backButton = this.add.image(100, 100, 'back_button');
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => {
            this.scene.start('LobbyScene');
        });

        // Refresh button
        this.refreshButton = this.add.image(1180, 100, 'refresh_button');
        this.refreshButton.setInteractive();
        this.refreshButton.on('pointerdown', () => {
            this.loadLeaderboardData();
        });

        // Add button labels
        this.add.text(100, 140, 'НАЗАД', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(1180, 140, 'ОБНОВИТЬ', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    createLoadingIndicator() {
        this.loadingText = this.add.text(640, 400, 'Загрузка рейтинга...', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.loadingText.setOrigin(0.5);
    }

    async loadLeaderboardData() {
        try {
            this.isLoading = true;
            this.showLoading(true);

            const response = await fetch('http://localhost:3000/api/leaderboard?limit=50');
            const data = await response.json();

            if (data.success) {
                this.leaderboardData = data.leaderboard;
                this.displayLeaderboard();
            } else {
                console.error('Failed to load leaderboard:', data.error);
                this.showError('Ошибка загрузки рейтинга');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showError('Ошибка подключения к серверу');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    displayLeaderboard() {
        // Clear existing leaderboard items
        this.leaderboardContainer.removeAll(true);
        
        // Recreate background
        const leaderboardBg = this.add.rectangle(0, 0, 1000, 400, 0x000000, 0.7);
        leaderboardBg.setStrokeStyle(2, 0x444444);
        this.leaderboardContainer.add(leaderboardBg);

        if (this.leaderboardData.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create header row
        this.createHeaderRow();

        // Create player rows
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.leaderboardData.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const player = this.leaderboardData[i];
            this.createPlayerRow(player, i - startIndex, i + 1);
        }

        // Create pagination
        this.createPagination();
    }

    createHeaderRow() {
        const headerY = -150;
        const headers = [
            { text: 'МЕСТО', x: -400, width: 80 },
            { text: 'ИГРОК', x: -250, width: 200 },
            { text: 'РЕЙТИНГ', x: -50, width: 100 },
            { text: 'ИГРЫ', x: 100, width: 80 },
            { text: 'ПОБЕДЫ', x: 200, width: 80 },
            { text: 'ПРИБЫЛЬ', x: 300, width: 120 }
        ];

        headers.forEach(header => {
            const text = this.add.text(header.x, headerY, header.text, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffaa00',
                fontStyle: 'bold'
            });
            text.setOrigin(0.5);
            this.leaderboardContainer.add(text);
        });
    }

    createPlayerRow(player, rowIndex, rank) {
        const rowY = -100 + (rowIndex * 35);
        const rowBg = this.add.rectangle(0, rowY, 950, 30, 0x333333, 0.5);
        this.leaderboardContainer.add(rowBg);

        // Rank with crown for top 3
        let rankText = rank.toString();
        let rankColor = '#ffffff';
        
        if (rank === 1) {
            rankText = '🥇';
            rankColor = '#ffd700';
        } else if (rank === 2) {
            rankText = '🥈';
            rankColor = '#c0c0c0';
        } else if (rank === 3) {
            rankText = '🥉';
            rankColor = '#cd7f32';
        }

        const rankDisplay = this.add.text(-400, rowY, rankText, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: rankColor,
            fontStyle: 'bold'
        });
        rankDisplay.setOrigin(0.5);
        this.leaderboardContainer.add(rankDisplay);

        // Player name
        const nameText = this.add.text(-250, rowY, player.name || 'Anonymous', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        nameText.setOrigin(0.5);
        this.leaderboardContainer.add(nameText);

        // Rating
        const ratingText = this.add.text(-50, rowY, player.rating?.toString() || '1000', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        ratingText.setOrigin(0.5);
        this.leaderboardContainer.add(ratingText);

        // Total games
        const gamesText = this.add.text(100, rowY, (player.total_games || 0).toString(), {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        gamesText.setOrigin(0.5);
        this.leaderboardContainer.add(gamesText);

        // Games won
        const winsText = this.add.text(200, rowY, (player.games_won || 0).toString(), {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#00ff00'
        });
        winsText.setOrigin(0.5);
        this.leaderboardContainer.add(winsText);

        // Total profit
        const profit = player.total_profit || 0;
        const profitColor = profit >= 0 ? '#00ff00' : '#ff0000';
        const profitText = this.add.text(300, rowY, profit.toString(), {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: profitColor
        });
        profitText.setOrigin(0.5);
        this.leaderboardContainer.add(profitText);
    }

    createPagination() {
        const totalPages = Math.ceil(this.leaderboardData.length / this.itemsPerPage);
        if (totalPages <= 1) return;

        const paginationY = 180;
        
        // Previous page button
        if (this.currentPage > 0) {
            const prevButton = this.add.text(400, paginationY, '← Предыдущая', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#444444',
                padding: { x: 10, y: 5 }
            });
            prevButton.setInteractive();
            prevButton.on('pointerdown', () => {
                this.currentPage--;
                this.displayLeaderboard();
            });
            this.leaderboardContainer.add(prevButton);
        }

        // Page indicator
        const pageText = this.add.text(640, paginationY, `Страница ${this.currentPage + 1} из ${totalPages}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        pageText.setOrigin(0.5);
        this.leaderboardContainer.add(pageText);

        // Next page button
        if (this.currentPage < totalPages - 1) {
            const nextButton = this.add.text(880, paginationY, 'Следующая →', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: '#444444',
                padding: { x: 10, y: 5 }
            });
            nextButton.setInteractive();
            nextButton.on('pointerdown', () => {
                this.currentPage++;
                this.displayLeaderboard();
            });
            this.leaderboardContainer.add(nextButton);
        }
    }

    showEmptyState() {
        const emptyText = this.add.text(0, 0, 'Нет данных для отображения', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#888888'
        });
        emptyText.setOrigin(0.5);
        this.leaderboardContainer.add(emptyText);
    }

    showLoading(show) {
        if (this.loadingText) {
            this.loadingText.setVisible(show);
        }
    }

    showError(message) {
        if (this.loadingText) {
            this.loadingText.setText(message);
            this.loadingText.setColor('#ff0000');
        }
    }

    setupEventListeners() {
        // ESC key to go back
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('LobbyScene');
        });

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
    }

    shutdown() {
        // Clean up event listeners
        this.input.keyboard.off('keydown-ESC');
        this.time.removeAllEvents();
    }
}

export default LeaderboardScene; 