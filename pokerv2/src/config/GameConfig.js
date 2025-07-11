// Game Configuration - All hardcoded values centralized
export const GameConfig = {
    // Screen dimensions
    screen: {
        width: 1280,
        height: 720,
        centerX: 640,
        centerY: 360,
    },

    // Layout positions
    layout: {
        topBar: { x: 640, y: 50 },
        bottomBar: { x: 640, y: 660 },
        underline: { x: 680, y: 700 },
        
        // Progress bar configuration
        progressBar: {
            x: 640,
            y: 650,
            width: 260,
            height: 20,
            step: 5,
            min: 0,
            max: 100,
        },
        
        // Button container layout
        buttonContainer: {
            y: 250,
            buttonSpacing: 240,
            buttonY: 100,
        },
    },

    // Colors and tints
    colors: {
        // Interactive states
        hover: 0xdddddd,
        click: 0x888888,
        
        // Progress bar colors by level
        progressLow: 0xff4b00,      // Red for 0-25%
        progressMedLow: 0xfd5f1d,   // Orange for 26-50%
        progressMedHigh: 0xfc692c,  // Yellow for 51-75%
        progressHigh: 0xfb733a,     // Green for 76-100%
        
        // Text colors
        primaryText: 0xffffff,
        secondaryText: 0x9fa6b3,
        
        // UI overlays
        dimOverlay: 0xff0000,
        
        // Player colors
        playerOrange: 0xFF6A13,
        handRankOrange: 0xFF4B00,
    },

    // Transparency values
    alpha: {
        subtle: 0.22,
        normal: 1.0,
    },

    // Scale values
    scales: {
        // UI elements
        topBar: 0.5,
        bottomBar: 0.5,
        underline: 0.25,
        lobbyOverlay: 0.5,
        
        // Buttons
        smallButton: 0.25,
        mediumButton: 0.27,
        standardButton: 0.29,
        actionButton: 0.3,
        chipButton: 0.35,
        bonusButton: 0.4,
        
        // Icons and avatars
        userAvatar: 0.3,
        crown: 0.34,
        progress: 0.34,
        star: 0.36,
        planetIcon: 0.3,
        
        // Hover effect
        hoverScale: 1.1,
    },

    // Animation timings
    timing: {
        buttonFeedback: 150,
        hoverDelay: 100,
        transitionDelay: 200,
    },
} 