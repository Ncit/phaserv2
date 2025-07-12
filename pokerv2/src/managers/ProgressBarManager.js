// Progress Bar Manager - Progress bar functionality and management
import { GameConfig } from '../config/GameConfig.js';
import { PositionCalculator } from '../utils/PositionCalculator.js';
import { eventManager } from '../utils/EventManager.js';

export class ProgressBarManager {
    constructor(scene) {
        this.scene = scene;
        this.progressBars = new Map();
        this.positionCalculator = new PositionCalculator();
        this.isDebug = window.isDebug || false;
    }

    // Create a progress bar
    createProgressBar(key, x, y, config = {}) {
        const progressConfig = {
            width: config.width || GameConfig.layout.progressBar.width,
            height: config.height || GameConfig.layout.progressBar.height,
            min: config.min || GameConfig.layout.progressBar.min,
            max: config.max || GameConfig.layout.progressBar.max,
            step: config.step || GameConfig.layout.progressBar.step,
            value: config.initialValue || 0,
            colors: config.colors || {
                background: 0x333333,
                backgroundSecondary: 0x111111,
                low: GameConfig.colors.progressLow,
                medLow: GameConfig.colors.progressMedLow,
                medHigh: GameConfig.colors.progressMedHigh,
                high: GameConfig.colors.progressHigh,
            },
        };

        // Create progress bar elements
        const elements = this.createProgressBarElements(x, y, progressConfig);
        
        // Store progress bar data
        const progressBarData = {
            elements,
            config: progressConfig,
            value: progressConfig.value,
        };

        this.progressBars.set(key, progressBarData);

        // Update visual to match initial value
        this.updateProgressBar(key, progressConfig.value);

        if (this.isDebug) {
            console.log(`ProgressBarManager: Created progress bar '${key}' at (${x}, ${y})`);
            console.log(`ProgressBarManager: Progress bar elements:`, elements);
        }

        return elements;
    }

    // Create the visual elements of a progress bar
    createProgressBarElements(x, y, config) {
        const elements = {};

        // Background (full bar outline) - match original styling
        elements.background = this.scene.add.rectangle(
            x, y,
            config.width + 4, config.height + 4,
            config.colors.background
        );
        elements.background.setStrokeStyle(0, 0xffffff);

        // Secondary background (darker inner) - match original styling
        elements.backgroundSecondary = this.scene.add.rectangle(
            x, y,
            config.width,
            config.height,
            config.colors.backgroundSecondary
        );

        // Progress fill (colored based on value) - match original positioning
        const fillWidth = (config.width * config.value) / config.max;
        elements.fill = this.scene.add.rectangle(
            x - config.width / 2, y,
            fillWidth,
            config.height - 2,
            config.colors.high
        );
        elements.fill.setOrigin(0, 0.5);

        // Ensure proper z-index by bringing to front
        elements.background.setDepth(1000);
        elements.backgroundSecondary.setDepth(1001);
        elements.fill.setDepth(1002);

        if (this.isDebug) {
            console.log(`ProgressBarManager: Created progress bar elements at (${x}, ${y}) with width ${config.width}, height ${config.height}`);
        }

        return elements;
    }

    // Update progress bar value and visual
    updateProgressBar(key, newValue) {
        const progressBarData = this.progressBars.get(key);
        if (!progressBarData) {
            console.error(`ProgressBarManager: Progress bar '${key}' not found`);
            return false;
        }

        const { elements, config } = progressBarData;
        
        // Clamp value to valid range
        const clampedValue = Math.max(config.min, Math.min(config.max, newValue));
        progressBarData.value = clampedValue;

        // Calculate fill width
        const fillWidth = config.width * (clampedValue / config.max);
        elements.fill.width = fillWidth;

        // Update fill color based on progress level
        const fillColor = this.getProgressColor(clampedValue, config.max, config.colors);
        elements.fill.setFillStyle(fillColor);

        if (this.isDebug) {
            console.log(`ProgressBarManager: Updated progress bar '${key}' to ${clampedValue}%`);
        }

        // Emit progress update event
        eventManager.emit('progress_updated', key, clampedValue);

        return true;
    }

    // Get progress color based on value
    getProgressColor(value, maxValue, colors) {
        const percentage = (value / maxValue) * 100;
        
        if (percentage <= 25) {
            return colors.low;      // Red for low values
        } else if (percentage <= 50) {
            return colors.medLow;   // Orange for medium-low values
        } else if (percentage <= 75) {
            return colors.medHigh;  // Yellow for medium-high values
        } else {
            return colors.high;     // Green for high values
        }
    }

    // Increase progress value
    increaseProgress(key, amount = null) {
        const progressBarData = this.progressBars.get(key);
        if (!progressBarData) {
            console.error(`ProgressBarManager: Progress bar '${key}' not found`);
            return false;
        }

        const stepAmount = amount || progressBarData.config.step;
        const newValue = progressBarData.value + stepAmount;
        
        return this.updateProgressBar(key, newValue);
    }

    // Decrease progress value
    decreaseProgress(key, amount = null) {
        const progressBarData = this.progressBars.get(key);
        if (!progressBarData) {
            console.error(`ProgressBarManager: Progress bar '${key}' not found`);
            return false;
        }

        const stepAmount = amount || progressBarData.config.step;
        const newValue = progressBarData.value - stepAmount;
        
        return this.updateProgressBar(key, newValue);
    }

    // Set progress to specific value
    setProgress(key, value) {
        return this.updateProgressBar(key, value);
    }

    // Get current progress value
    getProgress(key) {
        const progressBarData = this.progressBars.get(key);
        return progressBarData ? progressBarData.value : null;
    }

    // Set progress to minimum
    setToMinimum(key) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            return this.updateProgressBar(key, progressBarData.config.min);
        }
        return false;
    }

    // Set progress to maximum
    setToMaximum(key) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            return this.updateProgressBar(key, progressBarData.config.max);
        }
        return false;
    }

    // Set progress to specific percentage
    setToPercentage(key, percentage) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            const value = (progressBarData.config.max * percentage) / 100;
            return this.updateProgressBar(key, value);
        }
        return false;
    }

    // Create the main game progress bar (extracted from GameScene)
    createGameProgressBar() {
        const config = GameConfig.layout.progressBar;
        return this.createProgressBar('main', config.x, config.y, {
            width: config.width,
            height: config.height,
            min: config.min,
            max: config.max,
            step: config.step,
            initialValue: 50, // Match original initial value
        });
    }

    // Set up event listeners for progress bar controls
    setupProgressBarControls(progressBarKey) {
        // Listen for progress control events
        eventManager.on('progress_set', (value) => {
            this.setProgress(progressBarKey, value);
        });

        eventManager.on('progress_change', (direction) => {
            if (direction === 'increase') {
                this.increaseProgress(progressBarKey);
            } else if (direction === 'decrease') {
                this.decreaseProgress(progressBarKey);
            }
        });

        if (this.isDebug) {
            console.log(`ProgressBarManager: Set up controls for progress bar '${progressBarKey}'`);
        }
    }

    // Update progress bar visibility
    setProgressBarVisibility(key, visible) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            Object.values(progressBarData.elements).forEach(element => {
                if (element && element.setVisible) {
                    element.setVisible(visible);
                }
            });
        }
    }

    // Update progress bar interactivity
    setProgressBarInteractive(key, interactive, onClick = null) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            const { background } = progressBarData.elements;
            
            if (interactive && onClick) {
                background.setInteractive({ useHandCursor: true });
                background.on('pointerdown', (pointer) => {
                    // Calculate clicked percentage based on position
                    const localX = pointer.x - (background.x - background.width / 2);
                    const percentage = (localX / background.width) * 100;
                    const clampedPercentage = Math.max(0, Math.min(100, percentage));
                    
                    onClick(clampedPercentage, key);
                });
            } else {
                background.disableInteractive();
            }
        }
    }

    // Remove a progress bar
    removeProgressBar(key) {
        const progressBarData = this.progressBars.get(key);
        if (progressBarData) {
            // Destroy all elements
            Object.values(progressBarData.elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });

            this.progressBars.delete(key);

            if (this.isDebug) {
                console.log(`ProgressBarManager: Removed progress bar '${key}'`);
            }

            return true;
        }
        return false;
    }

    // Remove all progress bars
    removeAllProgressBars() {
        this.progressBars.forEach((progressBarData, key) => {
            this.removeProgressBar(key);
        });

        if (this.isDebug) {
            console.log('ProgressBarManager: Removed all progress bars');
        }
    }

    // Get progress bar statistics
    getStats() {
        return {
            totalProgressBars: this.progressBars.size,
            progressBarKeys: Array.from(this.progressBars.keys()),
            averageProgress: this.getAverageProgress(),
        };
    }

    // Calculate average progress across all bars
    getAverageProgress() {
        if (this.progressBars.size === 0) return 0;
        
        const totalProgress = Array.from(this.progressBars.values())
            .reduce((sum, progressBarData) => sum + progressBarData.value, 0);
        
        return totalProgress / this.progressBars.size;
    }
} 