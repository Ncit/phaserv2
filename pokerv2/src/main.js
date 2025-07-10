import { Splash } from './scenes/Splash.js';
import { Start } from './scenes/Start.js';
import { GameScene } from './scenes/GameScene.js';

// Global debug variable accessible in all files
window.isDebug = false; // Set to false for production


const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Splash,
        Start,
        GameScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            