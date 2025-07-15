#!/bin/bash

# Helper script to restore isDebug to development mode
# Use this if the git hook fails or you need to manually reset

TARGET_FILE="pokerv2/src/main.js"

echo "🔄 Restoring development mode..."

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Switch back to development mode
if sed -i '' 's/window\.isDebug = false/window.isDebug = true/g' "$TARGET_FILE"; then
    # Verify the change
    if grep -q "window\.isDebug = true" "$TARGET_FILE"; then
        echo "✅ Successfully restored isDebug = true for development"
        echo "📝 Current state: Development mode active"
    else
        echo "⚠️  Warning: Could not verify change"
    fi
else
    echo "❌ Error: Failed to modify $TARGET_FILE"
    exit 1
fi

echo "🎮 Ready for local development!" 