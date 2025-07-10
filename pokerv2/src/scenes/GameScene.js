export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('game_bg', 'assets/game_bg_2.png');
        this.load.image('menu_game', 'assets/menu_game.png');
        this.load.image('settings_game', 'assets/settings_game.png');
        // this.load.image('media_poker', 'assets/media_poker.png');
        this.load.image('gaming_table', 'assets/gaming_table.png');
        this.load.image('chat_button', 'assets/chat_button.png');
        this.load.image('fold_button', 'assets/fold_button.png');
        this.load.image('call_button', 'assets/call_button.png');
        this.load.image('raise_button', 'assets/raise_button.png');
        this.load.image('minus_button', 'assets/minus_button.png');
        this.load.image('plus_button', 'assets/plus_button.png');

        this.load.image('underline', 'assets/underline.png');
    }

    create() {
        this.background = this.add.image(640, 360, 'game_bg');
        this.menuGame = this.add.image(85, 60, 'menu_game');
        this.settingsGame = this.add.image(150, 60, 'settings_game');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        this.chatButton = this.add.image(150, 640, 'chat_button');

        this.foldButton = this.add.image(310, 640, 'fold_button');
        this.callButton = this.add.image(510, 640, 'call_button');
        this.raiseButton = this.add.image(710, 640, 'raise_button');
        this.minusButton = this.add.image(850, 640, 'minus_button');
        this.plusButton = this.add.image(1110, 640, 'plus_button');
        
        this.underline = this.add.image(640,700, 'underline');

        // this.underline.setScale(0.25);
        this.underline.setDisplaySize(400,10);
        this.gamingTable.scale = 0.4
        this.menuGame.scale = 0.3
        this.settingsGame.scale = 0.3
        this.chatButton.scale = 0.3

        this.foldButton.scale = 0.3
        this.callButton.scale = 0.3
        this.raiseButton.scale = 0.3

        this.minusButton.scale = 0.3
        this.plusButton.scale = 0.3
    }

    update() {

    }
}
