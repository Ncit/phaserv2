export const AnalyticsConfig = {
    // Yandex Metrika Configuration
    yandexMetrika: {
        // Replace with your actual Yandex Metrika ID
        // You can find this in your Yandex Metrika dashboard
        metrikaId: '103476099', // Replace with actual ID
        
        // Metrika initialization options
        options: {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            trackHash: true
        }
    },
    
    // Event tracking configuration
    events: {
        // Game events
        gameStart: 'game_start',
        gameEnd: 'game_end',
        playerAction: 'player_action',
        handWin: 'hand_win',
        handLoss: 'hand_loss',
        
        // UI events
        buttonClick: 'button_click',
        sceneChange: 'scene_change',
        purchase: 'purchase',
        
        // Error events
        error: 'error',
        
        // User engagement events
        userEngagement: 'user_engagement'
    },
    
    // Game types for tracking
    gameTypes: {
        fastGame: 'fast_game',
        aiBot: 'ai_bot',
        friendsGame: 'friends_game',
        highBid: 'high_bid',
        randomMatch: 'random_match'
    },
    
    // Player actions for tracking
    playerActions: {
        fold: 'fold',
        call: 'call',
        check: 'check',
        raise: 'raise',
        allIn: 'all_in'
    },
    
    // Button names for tracking
    buttonNames: {
        // Game mode buttons
        fastGame: 'fast_game_button',
        highBid: 'high_bid_button',
        trainGame: 'train_game_button',
        randomMatch: 'random_match_button',
        friendsGame: 'friends_game_button',
        
        // Action buttons
        fold: 'fold_button',
        call: 'call_button',
        raise: 'raise_button',
        allIn: 'all_in_button',
        
        // UI buttons
        menu: 'menu_button',
        settings: 'settings_button',
        chat: 'chat_button',
        shop: 'shop_button',
        bonus: 'bonus_button',
        stats: 'stats_button',
        friends: 'friends_button'
    },
    
    // Scene names for tracking
    sceneNames: {
        lobby: 'lobby_scene',
        fastGame: 'fast_game_scene',
        aiBot: 'ai_bot_scene',
        friendsGame: 'friends_game_scene',
        statistics: 'statistics_scene'
    }
}; 