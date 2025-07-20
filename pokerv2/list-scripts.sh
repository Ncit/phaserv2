#!/bin/bash

# List All Environment Scripts
# Shows all available environment management scripts

echo "📋 Available Environment Scripts"
echo "================================"
echo ""

echo "🛠️  set-development.sh"
echo "   Purpose: Set environment to development mode"
echo "   Usage: ./set-development.sh"
echo "   Features: Debug enabled, player selection, mock data"
echo ""

echo "🚀 set-production.sh"
echo "   Purpose: Set environment to production VK mode"
echo "   Usage: ./set-production.sh"
echo "   Features: Debug disabled, direct game entry, real VK Bridge"
echo ""

echo "🔄 toggle-environment.sh"
echo "   Purpose: Toggle between development and production VK"
echo "   Usage: ./toggle-environment.sh"
echo "   Features: Switches to opposite of current environment"
echo ""

echo "🔍 check-environment.sh"
echo "   Purpose: Show current environment status"
echo "   Usage: ./check-environment.sh"
echo "   Features: No changes, just information display"
echo ""

echo "📋 list-scripts.sh"
echo "   Purpose: Show this help information"
echo "   Usage: ./list-scripts.sh"
echo "   Features: Lists all available scripts"
echo ""

echo "💡 Quick Commands:"
echo "=================="
echo "   Check status:     ./check-environment.sh"
echo "   Set development:  ./set-development.sh"
echo "   Set production:   ./set-production.sh"
echo "   Toggle:          ./toggle-environment.sh"
echo ""

echo "📖 For detailed documentation:"
echo "   cat ENVIRONMENT_SCRIPTS_README.md" 