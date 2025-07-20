#!/bin/bash

# Helper script to set environment to development mode
# Use this if you need to manually reset to development environment

TARGET_FILE="pokerv2/src/main.js"

echo "🔄 Setting environment to development mode..."

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Check if the new environment config system is being used
if grep -q "EnvironmentConfig" "$TARGET_FILE"; then
    echo "✅ New environment configuration system detected"
    echo "📝 Environment will be automatically detected as 'development' on localhost"
    echo "🎮 Ready for local development!"
    echo ""
    echo "💡 Tip: You can also set environment via URL parameter:"
    echo "   http://localhost:3000?env=development"
    echo ""
    echo "💡 Or override in browser console:"
    echo "   window.gameConfig.setEnvironment('development')"
else
    echo "⚠️  Warning: Old window.isDebug system detected"
    echo "🔄 Attempting to restore legacy development mode..."
    
    # Switch back to development mode (legacy)
    if sed -i '' 's/window\.isDebug = false/window.isDebug = true/g' "$TARGET_FILE"; then
        # Verify the change
        if grep -q "window\.isDebug = true" "$TARGET_FILE"; then
            echo "✅ Successfully restored legacy isDebug = true for development"
            echo "📝 Current state: Development mode active"
        else
            echo "⚠️  Warning: Could not verify change"
        fi
    else
        echo "❌ Error: Failed to modify $TARGET_FILE"
        exit 1
    fi
fi

echo "🎮 Ready for local development!" 