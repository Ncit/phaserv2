#!/bin/bash

# Version Update Script
# This script updates the version number in VersionConfig.js on each commit

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION_FILE="pokerv2/client/src/config/VersionConfig.js"
COMMIT_FILE=".git/COMMIT_EDITMSG"

# Logging functions
log() {
    echo -e "${BLUE}[VERSION]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[VERSION]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[VERSION]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[VERSION]${NC} ❌ $1"
}

# Function to get current git info
get_git_info() {
    local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local date=$(date '+%Y-%m-%d')
    local time=$(date '+%H:%M:%S')
    
    echo "$commit_hash|$branch|$date|$time"
}

# Function to increment version number
increment_version() {
    local version=$1
    local increment_type=${2:-patch} # patch, minor, major
    
    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $increment_type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch"|*)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

# Function to determine version increment type from commit message
get_increment_type() {
    local commit_msg=$1
    
    if [[ $commit_msg == *"[MAJOR]"* ]] || [[ $commit_msg == *"[BREAKING]"* ]]; then
        echo "major"
    elif [[ $commit_msg == *"[MINOR]"* ]] || [[ $commit_msg == *"[FEATURE]"* ]]; then
        echo "minor"
    else
        echo "patch"
    fi
}

# Function to update version file
update_version_file() {
    local new_version=$1
    local git_info=$2
    
    IFS='|' read -ra INFO <<< "$git_info"
    local commit_hash=${INFO[0]}
    local branch=${INFO[1]}
    local date=${INFO[2]}
    local time=${INFO[3]}
    
    # Create backup
    cp "$VERSION_FILE" "${VERSION_FILE}.backup"
    
    # Update version file
    sed -i.tmp \
        -e "s/version: '[^']*'/version: '$new_version'/" \
        -e "s/gitCommit: '[^']*'/gitCommit: '$commit_hash'/" \
        -e "s/gitBranch: '[^']*'/gitBranch: '$branch'/" \
        -e "s/buildDate: '[^']*'/buildDate: '$date'/" \
        -e "s/buildTime: '[^']*'/buildTime: '$time'/" \
        "$VERSION_FILE"
    
    # Remove temporary file
    rm -f "${VERSION_FILE}.tmp"
    
    log_success "Updated version to $new_version (commit: $commit_hash)"
}

# Function to get current version from file
get_current_version() {
    if [[ -f "$VERSION_FILE" ]]; then
        grep -o "version: '[^']*'" "$VERSION_FILE" | cut -d"'" -f2
    else
        echo "1.0.0"
    fi
}

# Main function
main() {
    log "Starting version update..."
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        log_warning "Not in a git repository, skipping version update"
        exit 0
    fi
    
    # Check if version file exists
    if [[ ! -f "$VERSION_FILE" ]]; then
        log_error "Version file not found: $VERSION_FILE"
        exit 1
    fi
    
    # Get current version
    local current_version=$(get_current_version)
    log "Current version: $current_version"
    
    # Get git info
    local git_info=$(get_git_info)
    
    # Get commit message (if available)
    local commit_msg=""
    if [[ -f "$COMMIT_FILE" ]]; then
        commit_msg=$(cat "$COMMIT_FILE")
    fi
    
    # Determine increment type
    local increment_type=$(get_increment_type "$commit_msg")
    log "Increment type: $increment_type"
    
    # Calculate new version
    local new_version=$(increment_version "$current_version" "$increment_type")
    log "New version: $new_version"
    
    # Update version file
    update_version_file "$new_version" "$git_info"
    
    # Add updated file to git
    git add "$VERSION_FILE" 2>/dev/null || true
    
    log_success "Version update completed successfully!"
}

# Run main function
main "$@" 