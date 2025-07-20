#!/bin/bash

# GitHub Pages Deployment Script
# Deploys client files to gh-pages branch for GitHub Pages hosting

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[GH-PAGES]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[GH-PAGES]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[GH-PAGES]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[GH-PAGES]${NC} ❌ $1"
}

# Configuration
CLIENT_DIR="client"
GH_PAGES_BRANCH="gh-pages"
TEMP_DIR=".gh-pages-temp"
COMMIT_MESSAGE="Deploy to GitHub Pages"

# Function to check if we're in a git repository
check_git_repo() {
    if [[ ! -d ".git" ]]; then
        log_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
}

# Function to check if client directory exists
check_client_dir() {
    if [[ ! -d "$CLIENT_DIR" ]]; then
        log_error "Client directory '$CLIENT_DIR' not found."
        exit 1
    fi
}

# Function to check git status
check_git_status() {
    log "Checking git status..."
    
    # Check if there are uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "There are uncommitted changes in the repository."
        echo "Current changes:"
        git status --short
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled."
            exit 0
        fi
    else
        log_success "Repository is clean"
    fi
}

# Function to create or update gh-pages branch
setup_gh_pages_branch() {
    log "Setting up gh-pages branch..."
    
    # Check if gh-pages branch exists
    if git show-ref --verify --quiet refs/remotes/origin/$GH_PAGES_BRANCH; then
        log "gh-pages branch exists, checking it out..."
        git checkout $GH_PAGES_BRANCH
        git pull origin $GH_PAGES_BRANCH
    else
        log "gh-pages branch doesn't exist, creating it..."
        git checkout --orphan $GH_PAGES_BRANCH
        git rm -rf .
        git commit --allow-empty -m "Initial gh-pages commit"
    fi
    
    log_success "gh-pages branch is ready"
}

# Function to clean temporary directory
cleanup_temp_dir() {
    if [[ -d "$TEMP_DIR" ]]; then
        log "Cleaning up temporary directory..."
        rm -rf "$TEMP_DIR"
    fi
}

# Function to copy client files
copy_client_files() {
    log "Copying client files to temporary directory..."
    
    # Create temporary directory
    mkdir -p "$TEMP_DIR"
    
    # Copy all files from client directory
    cp -r "$CLIENT_DIR"/* "$TEMP_DIR/"
    
    # Remove any hidden files that shouldn't be deployed
    find "$TEMP_DIR" -name ".DS_Store" -delete 2>/dev/null || true
    find "$TEMP_DIR" -name ".git*" -delete 2>/dev/null || true
    
    log_success "Client files copied to temporary directory"
}

# Function to deploy files to gh-pages branch
deploy_files() {
    log "Deploying files to gh-pages branch..."
    
    # Remove all files from current branch
    git rm -rf . || true
    
    # Copy files from temporary directory
    cp -r "$TEMP_DIR"/* .
    
    # Add all files to git
    git add .
    
    # Check if there are changes to commit
    if [[ -n $(git status --porcelain) ]]; then
        # Commit changes
        git commit -m "$COMMIT_MESSAGE"
        log_success "Files committed to gh-pages branch"
        
        # Push to remote
        log "Pushing to remote repository..."
        git push origin $GH_PAGES_BRANCH
        log_success "Deployment completed successfully!"
        
        # Show deployment URL
        show_deployment_url
    else
        log_warning "No changes to deploy"
    fi
}

# Function to show deployment URL
show_deployment_url() {
    # Get repository URL
    local repo_url=$(git config --get remote.origin.url)
    
    if [[ $repo_url == *"github.com"* ]]; then
        # Extract username and repository name
        local repo_name=$(echo "$repo_url" | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git.*/\1/')
        local deployment_url="https://$repo_name.github.io"
        
        echo ""
        echo "=========================================="
        echo "🚀 DEPLOYMENT SUCCESSFUL!"
        echo "=========================================="
        echo "Your application is now available at:"
        echo "   🌐 $deployment_url"
        echo ""
        echo "Note: It may take a few minutes for changes to appear."
        echo "=========================================="
    else
        log_warning "Could not determine deployment URL. Please check your GitHub repository settings."
    fi
}

# Function to restore original branch
restore_branch() {
    log "Restoring original branch..."
    
    # Get the original branch name
    local original_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # If we're on gh-pages branch, switch back to main/master
    if [[ "$original_branch" == "$GH_PAGES_BRANCH" ]]; then
        # Try to switch to main, then master, then the first available branch
        if git show-ref --verify --quiet refs/heads/main; then
            git checkout main
        elif git show-ref --verify --quiet refs/heads/master; then
            git checkout master
        else
            # Get the first available branch that's not gh-pages
            local first_branch=$(git branch | grep -v "$GH_PAGES_BRANCH" | head -n 1 | sed 's/^[ *]*//')
            if [[ -n "$first_branch" ]]; then
                git checkout "$first_branch"
            fi
        fi
    fi
    
    log_success "Restored to original branch"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --message MESSAGE    Custom commit message (default: 'Deploy to GitHub Pages')"
    echo "  -f, --force              Force deployment even with uncommitted changes"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       # Deploy with default settings"
    echo "  $0 -m 'Update client UI' # Deploy with custom message"
    echo "  $0 --force               # Force deployment"
}

# Function to parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--message)
                COMMIT_MESSAGE="$2"
                shift 2
                ;;
            -f|--force)
                FORCE_DEPLOY=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Main deployment function
main() {
    log "Starting GitHub Pages deployment..."
    echo ""
    
    # Parse command line arguments
    parse_args "$@"
    
    # Pre-deployment checks
    check_git_repo
    check_client_dir
    check_git_status
    
    # Store current branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Setup cleanup trap
    trap cleanup_temp_dir EXIT
    
    # Setup gh-pages branch
    setup_gh_pages_branch
    
    # Copy client files
    copy_client_files
    
    # Deploy files
    deploy_files
    
    # Restore original branch
    restore_branch
    
    log_success "Deployment process completed!"
}

# Function to check if required tools are available
check_requirements() {
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        log_error "Not in a git repository"
        exit 1
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin &> /dev/null; then
        log_error "No remote origin configured"
        exit 1
    fi
}

# Check requirements before starting
check_requirements

# Run main function with all arguments
main "$@" 