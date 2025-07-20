#!/bin/bash

# Multiplayer Poker Game Startup Script

echo "🎰 Starting Multiplayer Poker Game..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to server directory
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install server dependencies"
        exit 1
    fi
fi

# Start the server in the background
echo "🚀 Starting poker server..."
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if ! curl -s http://localhost:3000/api/games > /dev/null; then
    echo "❌ Server failed to start. Please check the server logs."
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo "🌐 Open your browser and navigate to the game directory"
echo "📁 Game files are in the pokerv2 directory"
echo ""
echo "To stop the server, press Ctrl+C"

# Wait for user to stop the server
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; exit 0" INT

# Keep the script running
wait $SERVER_PID 