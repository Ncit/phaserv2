# Phaser Poker Game

A modern Texas Hold'em poker game built with Phaser.js, featuring AI bots, multiplayer functionality, and a beautiful user interface.

## 🎮 Features

- **Texas Hold'em Poker**: Full implementation of standard poker rules
- **AI Bots**: Intelligent computer players with different difficulty levels
- **Multiplayer Support**: Real-time multiplayer games with friends
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Mobile Friendly**: Optimized for both desktop and mobile devices
- **VK Integration**: Built-in support for VK social platform

## 🚀 Live Demo

Play the game online: [https://yourusername.github.io/phaser-poker-game](https://yourusername.github.io/phaser-poker-game)

## 🛠️ Local Development

### Prerequisites

- Python 3.x (for local server)
- Modern web browser
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/phaser-poker-game.git
cd phaser-poker-game
```

2. Start the local development server:
```bash
npm start
# or
python3 -m http.server 8000
```

3. Open your browser and navigate to `http://localhost:8000`

## 📁 Project Structure

```
pokerv2/
├── src/                    # Main source code
│   ├── main.js            # Game entry point
│   ├── config/            # Game configuration files
│   ├── managers/          # Game managers (UI, Cards, etc.)
│   ├── scenes/            # Phaser scenes
│   ├── utils/             # Utility functions
│   └── scripts/           # Additional scripts
├── assets/                # Game assets (images, sounds)
├── dependencies/          # External libraries (Phaser, etc.)
├── server/                # Backend server code
├── index.html             # Main HTML file
└── README.md              # This file
```

## 🎯 Game Modes

### AI Bot Training
- Practice against intelligent AI opponents
- Multiple difficulty levels
- Perfect for learning poker strategy

### Fast Game
- Quick matches with random opponents
- Ideal for casual gaming sessions

### Friends Game
- Private rooms for playing with friends
- Real-time multiplayer experience

### High Bid
- High-stakes games for experienced players
- Advanced betting strategies

## 🎨 Technologies Used

- **Phaser.js**: Game framework
- **JavaScript (ES6+)**: Programming language
- **HTML5 Canvas**: Graphics rendering
- **WebSockets**: Real-time communication
- **Node.js**: Backend server (for multiplayer)

## 🔧 Configuration

The game can be configured through various config files in the `src/config/` directory:

- `GameConfig.js`: Core game settings
- `AssetConfig.js`: Asset loading configuration
- `ButtonConfig.js`: UI button settings
- `PlayerConfig.js`: Player-related settings

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment process:

1. Copies the `src/` directory contents to the deployment root
2. Includes necessary dependencies and assets
3. Deploys to the `gh-pages` branch
4. Makes the game available at `https://yourusername.github.io/phaser-poker-game`

### Manual Deployment

If you need to deploy manually:

1. Build the project (if needed):
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Phaser.js team for the excellent game framework
- VK platform for social integration
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/phaser-poker-game/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Enjoy playing! 🃏** 