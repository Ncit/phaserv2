#!/bin/bash

# Deploy script for GitHub Pages
# This script prepares the project for deployment

echo "🚀 Starting deployment preparation..."

# Create deployment directory
echo "📁 Creating deployment directory..."
rm -rf deploy
mkdir -p deploy

# Copy source files
echo "📋 Copying source files..."
cp -r src/* deploy/

# Copy dependencies
echo "📦 Copying dependencies..."
cp -r dependencies deploy/

# Copy assets
echo "🎨 Copying assets..."
cp -r assets deploy/

# Copy main HTML file
echo "📄 Copying main HTML file..."
cp index.html deploy/

# Copy supabase directory if it exists
if [ -d "supabase" ]; then
    echo "🗄️ Copying Supabase files..."
    cp -r supabase deploy/
fi

# Copy project config if it exists
if [ -f "project.config" ]; then
    echo "⚙️ Copying project config..."
    cp project.config deploy/
fi

# Create .nojekyll file in deployment root
echo "🚫 Creating .nojekyll file..."
touch deploy/.nojekyll

# Create a minimal _config.yml that completely disables Jekyll
echo "⚙️ Creating Jekyll config..."
cat > deploy/_config.yml << 'EOF'
# Completely disable Jekyll processing
plugins: []
markdown: raw
theme: null
include: []
exclude: ["*"]
safe: false
EOF

# Create a simple index.html for the deployment root if it doesn't exist
if [ ! -f "deploy/index.html" ]; then
    echo "📄 Creating index.html..."
    cat > deploy/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phaser Poker Game</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        #gameContainer {
            width: 1280px;
            height: 720px;
            margin: 0 auto;
            border: 2px solid #333;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div id="gameContainer">
        <div class="loading">Loading Phaser Poker Game...</div>
    </div>
    
    <!-- Load Phaser -->
    <script src="dependencies/phaser.js"></script>
    
    <!-- Load dependencies -->
    <script src="dependencies/rexui.js"></script>
    <script src="dependencies/vkbridge.js"></script>
    
    <!-- Load configs -->
    <script src="config/AssetConfig.js"></script>
    <script src="config/ButtonConfig.js"></script>
    <script src="config/GameConfig.js"></script>
    <script src="config/PlayerConfig.js"></script>
    
    <!-- Load utils -->
    <script src="utils/AssetHelper.js"></script>
    <script src="utils/EventManager.js"></script>
    <script src="utils/HandEvaluator.js"></script>
    <script src="utils/PositionCalculator.js"></script>
    
    <!-- Load managers -->
    <script src="managers/ButtonManager.js"></script>
    <script src="managers/CardManager.js"></script>
    <script src="managers/NetworkManager.js"></script>
    <script src="managers/PlayerManager.js"></script>
    <script src="managers/UIManager.js"></script>
    
    <!-- Load scenes -->
    <script src="scenes/LobbyScene.js"></script>
    <script src="scenes/AIBotScene.js"></script>
    <script src="scenes/FastGameScene.js"></script>
    <script src="scenes/FriendsGameScene.js"></script>
    <script src="scenes/LoadingScene.js"></script>
    
    <!-- Load main -->
    <script src="main.js"></script>
</body>
</html>
EOF
fi

echo "✅ Deployment preparation completed!"
echo "📁 Deployment files are ready in the 'deploy' directory"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Push your changes to GitHub"
echo "2. The GitHub Action will automatically deploy to gh-pages branch"
echo "3. Your game will be available at: https://yourusername.github.io/phaser-poker-game"
echo ""
echo "For manual deployment:"
echo "1. Copy the contents of 'deploy' directory to your gh-pages branch"
echo "2. Or use: git subtree push --prefix deploy origin gh-pages" 