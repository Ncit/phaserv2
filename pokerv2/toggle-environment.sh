#!/bin/bash

# Environment Toggle Script
# Switches between development and productionVK environments

TARGET_FILE="src/config/EnvironmentConfig.js"

echo "🔄 Environment Toggle Script"
echo "=============================="

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Check current environment setting
if grep -q "return 'development';" "$TARGET_FILE"; then
    CURRENT_ENV="development"
    NEW_ENV="productionVK"
    echo "📝 Current environment: DEVELOPMENT"
    echo "🔄 Switching to: PRODUCTION VK"
elif grep -q "return 'productionVK';" "$TARGET_FILE"; then
    CURRENT_ENV="productionVK"
    NEW_ENV="development"
    echo "📝 Current environment: PRODUCTION VK"
    echo "🔄 Switching to: DEVELOPMENT"
else
    echo "❌ Error: Could not determine current environment"
    echo "💡 Expected to find either 'return \"development\";' or 'return \"productionVK\";'"
    exit 1
fi

# Perform the switch
if [[ "$CURRENT_ENV" == "development" ]]; then
    # Switch from development to productionVK
    sed -i '' 's/return '\''development'\'';/return '\''productionVK'\'';/g' "$TARGET_FILE"
    
    # Verify the change
    if grep -q "return 'productionVK';" "$TARGET_FILE"; then
        echo "✅ Successfully switched to PRODUCTION VK mode"
        echo "🎮 VK Bridge will be initialized"
        echo "🔧 Debug features disabled"
    else
        echo "❌ Error: Failed to switch to productionVK"
        exit 1
    fi
else
    # Switch from productionVK to development
    sed -i '' 's/return '\''productionVK'\'';/return '\''development'\'';/g' "$TARGET_FILE"
    
    # Verify the change
    if grep -q "return 'development';" "$TARGET_FILE"; then
        echo "✅ Successfully switched to DEVELOPMENT mode"
        echo "🎮 Debug player selection enabled"
        echo "🔧 Debug features enabled"
    else
        echo "❌ Error: Failed to switch to development"
        exit 1
    fi
fi

echo ""
echo "📋 Environment Summary:"
echo "======================"
if [[ "$NEW_ENV" == "development" ]]; then
    echo "🎯 Mode: DEVELOPMENT"
    echo "🔧 Debug: Enabled"
    echo "👥 Player Selection: Enabled"
    echo "📝 Mock Data: Enabled"
    echo "🌐 Ngrok Headers: Enabled"
    echo "⚠️  Verbose Errors: Enabled"
elif [[ "$NEW_ENV" == "productionVK" ]]; then
    echo "🎯 Mode: PRODUCTION VK"
    echo "🔧 Debug: Disabled"
    echo "👥 Player Selection: Disabled"
    echo "📝 Mock Data: Disabled"
    echo "🌐 Ngrok Headers: Enabled"
    echo "⚠️  Verbose Errors: Disabled"
fi

echo ""
echo "💡 To test the change:"
echo "   1. Refresh your browser"
echo "   2. Or restart your development server"
echo ""
echo "🔄 Run this script again to toggle back" 