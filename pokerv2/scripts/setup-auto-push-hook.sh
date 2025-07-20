#!/bin/bash

# Auto-Push Hook Setup Script
# Sets up a Git hook to automatically push gh-pages branch after commits

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[AUTO-PUSH]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[AUTO-PUSH]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[AUTO-PUSH]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[AUTO-PUSH]${NC} ❌ $1"
}

# Configuration
GH_PAGES_BRANCH="gh-pages"
HOOK_DIR=".git/hooks"
POST_COMMIT_HOOK="$HOOK_DIR/post-commit"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --install    Install the auto-push hook (default)"
    echo "  --remove     Remove the auto-push hook"
    echo "  --status     Check the status of the auto-push hook"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Install auto-push hook"
    echo "  $0 --install    # Install auto-push hook"
    echo "  $0 --remove     # Remove auto-push hook"
    echo "  $0 --status     # Check hook status"
}

# Function to parse command line arguments
parse_args() {
    local action="install"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                action="install"
                shift
                ;;
            --remove)
                action="remove"
                shift
                ;;
            --status)
                action="status"
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
    
    echo "$action"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        log_error "Not in a git repository. Please run this script from the project root."
        exit 1
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin &> /dev/null; then
        log_error "No remote origin configured"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to create the post-commit hook content
create_hook_content() {
    cat << 'EOF'
#!/bin/bash

# Auto-Push Hook for gh-pages Branch
# Automatically pushes gh-pages branch after commits

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[AUTO-PUSH]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[AUTO-PUSH]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[AUTO-PUSH]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[AUTO-PUSH]${NC} ❌ $1"
}

# Configuration
GH_PAGES_BRANCH="gh-pages"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Function to check if auto-push is enabled
is_auto_push_enabled() {
    if [[ -f ".git/auto-push-enabled" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to enable auto-push
enable_auto_push() {
    touch ".git/auto-push-enabled"
    log_success "Auto-push enabled for gh-pages branch"
}

# Function to disable auto-push
disable_auto_push() {
    rm -f ".git/auto-push-enabled"
    log_success "Auto-push disabled for gh-pages branch"
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
        echo "🚀 AUTO-DEPLOYMENT SUCCESSFUL!"
        echo "=========================================="
        echo "Your application is now available at:"
        echo "   🌐 $deployment_url"
        echo ""
        echo "Note: It may take a few minutes for changes to appear."
        echo "=========================================="
    fi
}

# Main hook logic
main() {
    # Only run for gh-pages branch
    if [[ "$CURRENT_BRANCH" != "$GH_PAGES_BRANCH" ]]; then
        exit 0
    fi
    
    # Check if auto-push is enabled
    if ! is_auto_push_enabled; then
        log "Auto-push not enabled for gh-pages branch"
        log "Run './pokerv2/scripts/setup-auto-push-hook.sh --install' to enable"
        exit 0
    fi
    
    log "Auto-push hook triggered for gh-pages branch"
    
    # Check if there are commits to push
    local ahead_count=$(git rev-list --count origin/$GH_PAGES_BRANCH..HEAD 2>/dev/null || echo "0")
    
    if [[ "$ahead_count" -gt 0 ]]; then
        log "Pushing $ahead_count commit(s) to remote..."
        
        # Push to remote
        if git push origin $GH_PAGES_BRANCH; then
            log_success "Successfully pushed to remote"
            show_deployment_url
        else
            log_error "Failed to push to remote"
            exit 1
        fi
    else
        log "No commits to push"
    fi
}

# Run main function
main "$@"
EOF
}

# Function to install the auto-push hook
install_hook() {
    log "Installing auto-push hook..."
    
    # Create hooks directory if it doesn't exist
    mkdir -p "$HOOK_DIR"
    
    # Create the post-commit hook
    create_hook_content > "$POST_COMMIT_HOOK"
    
    # Make the hook executable
    chmod +x "$POST_COMMIT_HOOK"
    
    # Enable auto-push
    touch ".git/auto-push-enabled"
    
    log_success "Auto-push hook installed successfully"
    log_success "Hook will automatically push gh-pages branch after commits"
    
    # Show usage instructions
    echo ""
    echo "=========================================="
    echo "🔧 AUTO-PUSH HOOK INSTALLED"
    echo "=========================================="
    echo "The hook will now automatically push the gh-pages branch"
    echo "after every commit to that branch."
    echo ""
    echo "Commands:"
    echo "  $0 --status    # Check hook status"
    echo "  $0 --remove    # Remove the hook"
    echo "=========================================="
}

# Function to remove the auto-push hook
remove_hook() {
    log "Removing auto-push hook..."
    
    if [[ -f "$POST_COMMIT_HOOK" ]]; then
        # Check if this is our hook by looking for the signature
        if grep -q "Auto-Push Hook for gh-pages Branch" "$POST_COMMIT_HOOK"; then
            rm "$POST_COMMIT_HOOK"
            log_success "Auto-push hook removed"
        else
            log_warning "Post-commit hook exists but doesn't appear to be our auto-push hook"
            log_warning "Skipping removal to avoid breaking other hooks"
        fi
    else
        log_warning "Post-commit hook not found"
    fi
    
    # Disable auto-push
    rm -f ".git/auto-push-enabled"
    log_success "Auto-push disabled"
}

# Function to check hook status
check_status() {
    log "Checking auto-push hook status..."
    
    echo ""
    echo "=========================================="
    echo "📊 AUTO-PUSH HOOK STATUS"
    echo "=========================================="
    
    # Check if hook file exists
    if [[ -f "$POST_COMMIT_HOOK" ]]; then
        echo "✅ Post-commit hook file exists"
        
        # Check if it's our hook
        if grep -q "Auto-Push Hook for gh-pages Branch" "$POST_COMMIT_HOOK"; then
            echo "✅ Auto-push hook is installed"
        else
            echo "⚠️  Post-commit hook exists but is not our auto-push hook"
        fi
        
        # Check if hook is executable
        if [[ -x "$POST_COMMIT_HOOK" ]]; then
            echo "✅ Hook is executable"
        else
            echo "❌ Hook is not executable"
        fi
    else
        echo "❌ Post-commit hook file not found"
    fi
    
    # Check if auto-push is enabled
    if [[ -f ".git/auto-push-enabled" ]]; then
        echo "✅ Auto-push is enabled"
    else
        echo "❌ Auto-push is disabled"
    fi
    
    # Check gh-pages branch status
    if git show-ref --verify --quiet refs/heads/$GH_PAGES_BRANCH; then
        echo "✅ gh-pages branch exists locally"
    else
        echo "❌ gh-pages branch doesn't exist locally"
    fi
    
    if git show-ref --verify --quiet refs/remotes/origin/$GH_PAGES_BRANCH; then
        echo "✅ gh-pages branch exists remotely"
    else
        echo "❌ gh-pages branch doesn't exist remotely"
    fi
    
    echo "=========================================="
}

# Function to test the hook
test_hook() {
    log "Testing auto-push hook..."
    
    # Check if we're on gh-pages branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [[ "$current_branch" == "$GH_PAGES_BRANCH" ]]; then
        log "Currently on gh-pages branch, testing hook..."
        
        # Create a test commit
        echo "# Test commit for auto-push hook" >> test-auto-push.md
        git add test-auto-push.md
        git commit -m "Test auto-push hook" || {
            log_error "Failed to create test commit"
            return 1
        }
        
        # Clean up test file
        git reset --hard HEAD~1
        rm -f test-auto-push.md
        
        log_success "Hook test completed"
    else
        log_warning "Not on gh-pages branch, skipping test"
        log "Switch to gh-pages branch to test the hook"
    fi
}

# Main function
main() {
    log "Auto-Push Hook Setup"
    echo ""
    
    # Parse command line arguments
    local action=$(parse_args "$@")
    
    # Check prerequisites
    check_prerequisites
    
    # Execute requested action
    case "$action" in
        "install")
            install_hook
            ;;
        "remove")
            remove_hook
            ;;
        "status")
            check_status
            ;;
        *)
            log_error "Unknown action: $action"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 