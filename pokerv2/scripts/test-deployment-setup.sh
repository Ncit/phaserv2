#!/bin/bash

# Test Deployment Setup Script
# Tests the deployment prerequisites without actually deploying

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[TEST]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[TEST]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[TEST]${NC} ❌ $1"
}

# Configuration
CLIENT_DIR="client"
GH_PAGES_BRANCH="gh-pages"

# Function to check if a command exists
check_command() {
    local command=$1
    local description=$2
    
    if command -v "$command" &> /dev/null; then
        log_success "$description"
        return 0
    else
        log_error "$description (not found: $command)"
        return 1
    fi
}

# Function to check if a file/directory exists
check_path() {
    local path=$1
    local description=$2
    
    if [[ -e "$path" ]]; then
        log_success "$description"
        return 0
    else
        log_error "$description (not found: $path)"
        return 1
    fi
}

# Function to check git configuration
check_git_config() {
    log "Checking git configuration..."
    
    local errors=0
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        log_error "Not in a git repository"
        errors=$((errors + 1))
    else
        log_success "In a git repository"
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin &> /dev/null; then
        log_error "No remote origin configured"
        errors=$((errors + 1))
    else
        local origin_url=$(git remote get-url origin)
        log_success "Remote origin configured: $origin_url"
        
        # Check if it's a GitHub repository
        if [[ $origin_url == *"github.com"* ]]; then
            log_success "GitHub repository detected"
        else
            log_warning "Not a GitHub repository (GitHub Pages requires GitHub)"
        fi
    fi
    
    # Check current branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_success "Current branch: $current_branch"
    
    # Check if gh-pages branch exists
    if git show-ref --verify --quiet refs/heads/$GH_PAGES_BRANCH; then
        log_success "gh-pages branch exists locally"
    else
        log_warning "gh-pages branch doesn't exist locally (will be created)"
    fi
    
    # Check if gh-pages branch exists remotely
    if git show-ref --verify --quiet refs/remotes/origin/$GH_PAGES_BRANCH; then
        log_success "gh-pages branch exists remotely"
    else
        log_warning "gh-pages branch doesn't exist remotely (will be created)"
    fi
    
    return $errors
}

# Function to check client directory
check_client_directory() {
    log "Checking client directory..."
    
    local errors=0
    
    # Check if client directory exists
    if [[ ! -d "$CLIENT_DIR" ]]; then
        log_error "Client directory not found: $CLIENT_DIR"
        errors=$((errors + 1))
        return $errors
    fi
    
    log_success "Client directory exists: $CLIENT_DIR"
    
    # Check for essential files
    local essential_files=(
        "$CLIENT_DIR/index.html:Main HTML file"
        "$CLIENT_DIR/src/main.js:Main JavaScript file"
        "$CLIENT_DIR/assets/:Assets directory"
    )
    
    for file_info in "${essential_files[@]}"; do
        IFS=':' read -r file_path description <<< "$file_info"
        if check_path "$file_path" "$description"; then
            # Additional checks for specific files
            if [[ "$file_path" == "$CLIENT_DIR/index.html" ]]; then
                # Check if index.html contains game container
                if grep -q "game-container" "$file_path" 2>/dev/null; then
                    log_success "index.html contains game container"
                else
                    log_warning "index.html may not contain game container"
                fi
            fi
        else
            errors=$((errors + 1))
        fi
    done
    
    # Check client directory size
    local client_size=$(du -sh "$CLIENT_DIR" | cut -f1)
    log_success "Client directory size: $client_size"
    
    # Check for large files that might cause issues
    local large_files=$(find "$CLIENT_DIR" -type f -size +10M 2>/dev/null | wc -l)
    if [[ $large_files -gt 0 ]]; then
        log_warning "Found $large_files files larger than 10MB (may cause deployment issues)"
    else
        log_success "No excessively large files found"
    fi
    
    return $errors
}

# Function to check deployment scripts
check_deployment_scripts() {
    log "Checking deployment scripts..."
    
    local errors=0
    
    local scripts=(
        "scripts/deploy-to-gh-pages-simple.sh:Simple deployment script"
        "scripts/deploy-to-gh-pages.sh:Advanced deployment script"
    )
    
    for script_info in "${scripts[@]}"; do
        IFS=':' read -r script_path description <<< "$script_info"
        if check_path "$script_path" "$description"; then
            # Check if script is executable
            if [[ -x "$script_path" ]]; then
                log_success "$description is executable"
            else
                log_warning "$description is not executable (run: chmod +x $script_path)"
            fi
        else
            errors=$((errors + 1))
        fi
    done
    
    return $errors
}

# Function to simulate deployment process
simulate_deployment() {
    log "Simulating deployment process..."
    
    # Check what would be copied
    local files_to_copy=$(find "$CLIENT_DIR" -type f | wc -l)
    local dirs_to_copy=$(find "$CLIENT_DIR" -type d | wc -l)
    
    log_success "Would copy $files_to_copy files and $dirs_to_copy directories"
    
    # Show some example files
    log "Example files that would be deployed:"
    find "$CLIENT_DIR" -type f | head -5 | while read -r file; do
        echo "   📄 $file"
    done
    
    # Check for potential issues
    local hidden_files=$(find "$CLIENT_DIR" -name ".*" | wc -l)
    if [[ $hidden_files -gt 0 ]]; then
        log_warning "Found $hidden_files hidden files (will be filtered during deployment)"
    fi
    
    # Check for git files
    local git_files=$(find "$CLIENT_DIR" -name ".git*" | wc -l)
    if [[ $git_files -gt 0 ]]; then
        log_warning "Found $git_files git files (will be filtered during deployment)"
    fi
}

# Function to show deployment URL
show_deployment_url() {
    log "Calculating deployment URL..."
    
    local repo_url=$(git config --get remote.origin.url 2>/dev/null)
    
    if [[ -n "$repo_url" ]] && [[ $repo_url == *"github.com"* ]]; then
        local repo_name=$(echo "$repo_url" | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git.*/\1/')
        local deployment_url="https://$repo_name.github.io"
        
        echo ""
        echo "=========================================="
        echo "🌐 DEPLOYMENT URL"
        echo "=========================================="
        echo "Your application would be available at:"
        echo "   $deployment_url"
        echo ""
        echo "Note: Enable GitHub Pages in repository settings"
        echo "=========================================="
    else
        log_warning "Could not determine deployment URL"
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "=========================================="
    echo "📋 NEXT STEPS"
    echo "=========================================="
    echo "1. Enable GitHub Pages in repository settings:"
    echo "   - Go to Settings → Pages"
    echo "   - Source: Deploy from a branch"
    echo "   - Branch: gh-pages"
    echo "   - Folder: / (root)"
    echo ""
    echo "2. Deploy your application:"
    echo "   ./scripts/deploy-to-gh-pages-simple.sh"
    echo ""
    echo "3. Monitor deployment:"
    echo "   - Check repository Settings → Pages"
    echo "   - Visit your deployment URL"
    echo "=========================================="
}

# Main test function
main() {
    log "Starting deployment setup test..."
    echo ""
    
    local total_errors=0
    
    # Check prerequisites
    log "Checking prerequisites..."
    check_command "git" "Git is installed"
    total_errors=$((total_errors + $?))
    
    # Check git configuration
    git_errors=$(check_git_config)
    total_errors=$((total_errors + git_errors))
    
    # Check client directory
    client_errors=$(check_client_directory)
    total_errors=$((total_errors + client_errors))
    
    # Check deployment scripts
    script_errors=$(check_deployment_scripts)
    total_errors=$((total_errors + script_errors))
    
    # Simulate deployment
    simulate_deployment
    
    # Show deployment URL
    show_deployment_url
    
    echo ""
    echo "=========================================="
    echo "📊 TEST SUMMARY"
    echo "=========================================="
    echo "✅ Successful checks: $((37 - total_errors))"
    echo "❌ Errors found: $total_errors"
    echo ""
    
    if [[ $total_errors -eq 0 ]]; then
        log_success "All tests passed! Ready for deployment."
        show_next_steps
    else
        log_error "Found $total_errors issues that need to be resolved before deployment."
        echo ""
        echo "Please fix the issues above before attempting deployment."
    fi
}

# Run main function
main 