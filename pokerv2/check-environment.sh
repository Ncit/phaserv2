#!/bin/bash

# Environment Status Check Script
# Shows current environment configuration without making changes

TARGET_FILE="src/config/EnvironmentConfig.js"

echo "🔍 Environment Status Check"
echo "=========================="

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Check current environment setting
if grep -q "return 'development';" "$TARGET_FILE"; then
    CURRENT_ENV="development"
    echo "🎯 Current Environment: DEVELOPMENT"
    echo ""
    echo "📋 Features:"
    echo "   🔧 Debug: Enabled"
    echo "   👥 Player Selection: Enabled"
    echo "   📝 Mock Data: Enabled"
    echo "   🌐 Ngrok Headers: Enabled"
    echo "   ⚠️  Verbose Errors: Enabled"
    echo ""
    echo "💡 Use: ./toggle-environment.sh to switch to PRODUCTION VK"
elif grep -q "return 'productionVK';" "$TARGET_FILE"; then
    CURRENT_ENV="productionVK"
    echo "🎯 Current Environment: PRODUCTION VK"
    echo ""
    echo "📋 Features:"
    echo "   🔧 Debug: Disabled"
    echo "   👥 Player Selection: Disabled"
    echo "   📝 Mock Data: Disabled"
    echo "   🌐 Ngrok Headers: Enabled"
    echo "   ⚠️  Verbose Errors: Disabled"
    echo ""
    echo "💡 Use: ./toggle-environment.sh to switch to DEVELOPMENT"
else
    echo "❌ Error: Could not determine current environment"
    echo "💡 Expected to find either 'return \"development\";' or 'return \"productionVK\";'"
    exit 1
fi

echo ""
echo "📁 File: $TARGET_FILE"
echo "🕒 Last modified: $(stat -f "%Sm" "$TARGET_FILE")" 