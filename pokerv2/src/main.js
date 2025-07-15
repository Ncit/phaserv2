import { LoadingScene } from './scenes/LoadingScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { FriendsGameScene } from './scenes/FriendsGameScene.js';
import { AIBotScene } from './scenes/AIBotScene.js';

// Global debug variable accessible in all files
window.isDebug = false; // Set to true for development

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
            scene: [LoadingScene, LobbyScene, FriendsGameScene, AIBotScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

new Phaser.Game(config);
