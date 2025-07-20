#!/bin/bash

# Documentation Organization Verification Script
# Verifies that all documentation files are properly organized

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[DOC VERIFY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[DOC VERIFY]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[DOC VERIFY]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[DOC VERIFY]${NC} ❌ $1"
}

# Check if we're in the project root
if [[ ! -f "README.md" ]] || [[ ! -d "docs" ]]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check if a file exists
check_file() {
    local file_path=$1
    local description=$2
    
    if [[ -f "$file_path" ]]; then
        log_success "$description"
        return 0
    else
        log_error "$description (missing: $file_path)"
        return 1
    fi
}

# Function to check if a directory exists
check_directory() {
    local dir_path=$1
    local description=$2
    
    if [[ -d "$dir_path" ]]; then
        log_success "$description"
        return 0
    else
        log_error "$description (missing: $dir_path)"
        return 1
    fi
}

# Function to count files in directory
count_files() {
    local dir_path=$1
    local pattern=$2
    find "$dir_path" -name "$pattern" 2>/dev/null | wc -l
}

# Main verification function
run_verification() {
    log "Starting documentation organization verification..."
    echo ""
    
    local total_errors=0
    local total_successes=0
    
    # Check main documentation structure
    log "Checking main documentation structure..."
    
    if check_directory "docs" "Main docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    if check_file "docs/README.md" "Documentation index"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check project documentation
    log "Checking project documentation..."
    
    if check_directory "docs/project" "Project docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    project_files=(
        "docs/project/ASSET_FIX_SUMMARY.md:Asset Fix Summary"
        "docs/project/PATH_UPDATE_SUMMARY.md:Path Update Summary"
        "docs/project/PROJECT_SUMMARY.md:Project Summary"
        "docs/project/REORGANIZATION_SUMMARY.md:Reorganization Summary"
    )
    
    for file_info in "${project_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Check client documentation
    log "Checking client documentation..."
    
    if check_directory "docs/client" "Client docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    if check_file "docs/client/CLIENT_SCRIPTS_UPDATE.md" "Client Scripts Update"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check server documentation
    log "Checking server documentation..."
    
    if check_directory "docs/server" "Server docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    if check_file "docs/server/DEPENDENCY_UPDATE_GUIDE.md" "Dependency Update Guide"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check features documentation
    log "Checking features documentation..."
    
    if check_directory "docs/features" "Features docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check AI features
    if check_directory "docs/features/ai" "AI features directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    ai_files=(
        "docs/features/ai/AI_BOT_README.md:AI Bot README"
        "docs/features/ai/ENHANCED_AI_README.md:Enhanced AI README"
        "docs/features/ai/NEW_AI_BOT_SCENE_APPROACH.md:AI Bot Scene Approach"
        "docs/features/ai/AIBOT_BLACK_SCREEN_FIX.md:AI Bot Black Screen Fix"
    )
    
    for file_info in "${ai_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Check multiplayer features
    if check_directory "docs/features/multiplayer" "Multiplayer features directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    multiplayer_files=(
        "docs/features/multiplayer/MULTIPLAYER_README.md:Multiplayer README"
        "docs/features/multiplayer/SINGLE_ROOM_README.md:Single Room README"
        "docs/features/multiplayer/SPECTATOR_FUNCTIONALITY.md:Spectator Functionality"
        "docs/features/multiplayer/ROOM_RESET_FEATURE.md:Room Reset Feature"
    )
    
    for file_info in "${multiplayer_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Check UI features
    if check_directory "docs/features/ui" "UI features directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    ui_files=(
        "docs/features/ui/ENVIRONMENT_SCRIPTS_README.md:Environment Scripts README"
        "docs/features/ui/DEBUG_PLAYER_SELECTION.md:Debug Player Selection"
        "docs/features/ui/ENVIRONMENT_MIGRATION_GUIDE.md:Environment Migration Guide"
    )
    
    for file_info in "${ui_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Check general features
    general_features=(
        "docs/features/AUTO_ALLIN_FEATURE.md:Auto All-in Feature"
        "docs/features/THREE_ALLIN_TEST.md:Three All-in Test"
        "docs/features/TELEGRAM_README.md:Telegram README"
        "docs/features/NGROK_HEADERS_README.md:Ngrok Headers README"
    )
    
    for file_info in "${general_features[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Check fixes documentation
    log "Checking fixes documentation..."
    
    if check_directory "docs/fixes" "Fixes docs directory"; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    fixes_files=(
        "docs/fixes/RAISE_FIX.md:Raise Fix"
        "docs/fixes/RAISE_BUTTON_DISABLE_FIX.md:Raise Button Disable Fix"
        "docs/fixes/RECONNECTION_BUTTON_FIX.md:Reconnection Button Fix"
        "docs/fixes/STACK_OVERFLOW_FIX.md:Stack Overflow Fix"
        "docs/fixes/ALL_IN_FIX.md:All-in Fix"
        "docs/fixes/TURN_MANAGEMENT_FIX.md:Turn Management Fix"
    )
    
    for file_info in "${fixes_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_file "$file_path" "$description"; then
            total_successes=$((total_successes + 1))
        else
            total_errors=$((total_errors + 1))
        fi
    done
    
    # Show statistics
    echo ""
    log "Documentation Statistics:"
    
    local total_docs=$(find docs -name "*.md" | wc -l)
    local project_docs=$(count_files "docs/project" "*.md")
    local client_docs=$(count_files "docs/client" "*.md")
    local server_docs=$(count_files "docs/server" "*.md")
    local ai_docs=$(count_files "docs/features/ai" "*.md")
    local multiplayer_docs=$(count_files "docs/features/multiplayer" "*.md")
    local ui_docs=$(count_files "docs/features/ui" "*.md")
    local general_docs=$(count_files "docs/features" "*.md")
    local fixes_docs=$(count_files "docs/fixes" "*.md")
    
    echo "   📊 Total documentation files: $total_docs"
    echo "   🚀 Project documentation: $project_docs"
    echo "   💻 Client documentation: $client_docs"
    echo "   🖥️ Server documentation: $server_docs"
    echo "   🤖 AI features: $ai_docs"
    echo "   🌐 Multiplayer features: $multiplayer_docs"
    echo "   🎨 UI features: $ui_docs"
    echo "   🔧 General features: $general_docs"
    echo "   🐛 Bug fixes: $fixes_docs"
    
    echo ""
    echo "=========================================="
    echo "📊 DOCUMENTATION VERIFICATION SUMMARY"
    echo "=========================================="
    echo "✅ Successful checks: $total_successes"
    echo "❌ Errors found: $total_errors"
    echo ""
    
    if [[ $total_errors -eq 0 ]]; then
        log_success "All documentation is properly organized!"
        return 0
    else
        log_error "Found $total_errors issues that need attention"
        return 1
    fi
}

# Main execution
main() {
    case $1 in
        "stats")
            log "Documentation Statistics:"
            echo "   📊 Total documentation files: $(find docs -name "*.md" | wc -l)"
            echo "   🚀 Project documentation: $(find docs/project -name "*.md" 2>/dev/null | wc -l)"
            echo "   💻 Client documentation: $(find docs/client -name "*.md" 2>/dev/null | wc -l)"
            echo "   🖥️ Server documentation: $(find docs/server -name "*.md" 2>/dev/null | wc -l)"
            echo "   🤖 AI features: $(find docs/features/ai -name "*.md" 2>/dev/null | wc -l)"
            echo "   🌐 Multiplayer features: $(find docs/features/multiplayer -name "*.md" 2>/dev/null | wc -l)"
            echo "   🎨 UI features: $(find docs/features/ui -name "*.md" 2>/dev/null | wc -l)"
            echo "   🔧 General features: $(find docs/features -maxdepth 1 -name "*.md" 2>/dev/null | wc -l)"
            echo "   🐛 Bug fixes: $(find docs/fixes -name "*.md" 2>/dev/null | wc -l)"
            ;;
        *)
            run_verification
            ;;
    esac
}

# Run main function with arguments
main "$@" 