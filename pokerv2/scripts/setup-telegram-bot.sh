#!/bin/bash

# Telegram Bot Setup Script
# Helps configure your Telegram bot for Mini App deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[TELEGRAM-BOT]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[TELEGRAM-BOT]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[TELEGRAM-BOT]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[TELEGRAM-BOT]${NC} ❌ $1"
}

# Configuration
BOT_TOKEN_FILE=".telegram-bot-token"
CONFIG_FILE=".telegram-bot-config"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --setup         Interactive bot setup"
    echo "  --deploy        Deploy to GitHub Pages and configure bot"
    echo "  --test          Test bot configuration"
    echo "  --config        Show current configuration"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --setup      # Interactive setup"
    echo "  $0 --deploy     # Deploy and configure"
    echo "  $0 --test       # Test bot"
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

# Function to get GitHub Pages URL
get_github_pages_url() {
    local repo_url=$(git config --get remote.origin.url)
    
    if [[ $repo_url == *"github.com"* ]]; then
        # Extract username and repository name
        local repo_name=$(echo "$repo_url" | sed 's/.*github\.com[:/]\([^/]*\/[^/]*\)\.git.*/\1/')
        echo "https://$repo_name.github.io"
    else
        log_error "Not a GitHub repository"
        exit 1
    fi
}

# Function to interactive setup
interactive_setup() {
    log "Starting interactive Telegram bot setup..."
    echo ""
    
    # Get bot token
    echo "Step 1: Bot Token"
    echo "1. Open Telegram and search for @BotFather"
    echo "2. Send /newbot command"
    echo "3. Follow instructions to create your bot"
    echo "4. Copy the bot token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
    echo ""
    
    read -p "Enter your bot token: " bot_token
    
    if [[ -z "$bot_token" ]]; then
        log_error "Bot token is required"
        exit 1
    fi
    
    # Validate bot token format
    if [[ ! $bot_token =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
        log_warning "Bot token format looks invalid. Please double-check."
    fi
    
    # Save bot token
    echo "$bot_token" > "$BOT_TOKEN_FILE"
    chmod 600 "$BOT_TOKEN_FILE"
    log_success "Bot token saved securely"
    
    # Get bot username
    echo ""
    echo "Step 2: Bot Username"
    echo "Enter your bot's username (without @ symbol)"
    echo "Example: if your bot is @MyPokerBot, enter: MyPokerBot"
    echo ""
    
    read -p "Enter bot username: " bot_username
    
    if [[ -z "$bot_username" ]]; then
        log_error "Bot username is required"
        exit 1
    fi
    
    # Get GitHub Pages URL
    local github_url=$(get_github_pages_url)
    
    # Save configuration
    cat > "$CONFIG_FILE" << EOF
BOT_TOKEN=$bot_token
BOT_USERNAME=$bot_username
GITHUB_PAGES_URL=$github_url
DEPLOYMENT_DATE=$(date +%Y-%m-%d)
EOF
    
    log_success "Configuration saved"
    
    # Show next steps
    echo ""
    echo "=========================================="
    echo "🔧 BOT SETUP COMPLETE"
    echo "=========================================="
    echo "Next steps:"
    echo "1. Configure your bot with BotFather:"
    echo "   - Send /setdomain to @BotFather"
    echo "   - Set domain: $github_url"
    echo ""
    echo "2. Set bot commands:"
    echo "   - Send /setcommands to @BotFather"
    echo "   - Add: start - Start the poker game"
    echo ""
    echo "3. Test your bot:"
    echo "   - Open @$bot_username in Telegram"
    echo "   - Send /start command"
    echo ""
    echo "4. Deploy your app:"
    echo "   - Run: $0 --deploy"
    echo "=========================================="
}

# Function to deploy and configure
deploy_and_configure() {
    log "Deploying to GitHub Pages and configuring bot..."
    
    # Check if configuration exists
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration not found. Run --setup first."
        exit 1
    fi
    
    # Load configuration
    source "$CONFIG_FILE"
    
    # Deploy to GitHub Pages
    log "Deploying to GitHub Pages..."
    if [[ -f "pokerv2/scripts/deploy-to-gh-pages-simple.sh" ]]; then
        ./pokerv2/scripts/deploy-to-gh-pages-simple.sh -m "Deploy for Telegram Mini App"
    else
        log_error "Deployment script not found"
        exit 1
    fi
    
    # Show configuration instructions
    echo ""
    echo "=========================================="
    echo "🚀 DEPLOYMENT COMPLETE"
    echo "=========================================="
    echo "Your app is now available at:"
    echo "   🌐 $GITHUB_PAGES_URL"
    echo ""
    echo "Bot Configuration:"
    echo "   🤖 Bot: @$BOT_USERNAME"
    echo "   🔗 Domain: $GITHUB_PAGES_URL"
    echo ""
    echo "Next steps:"
    echo "1. Configure bot domain:"
    echo "   - Send /setdomain to @BotFather"
    echo "   - Set: $GITHUB_PAGES_URL"
    echo ""
    echo "2. Set bot commands:"
    echo "   - Send /setcommands to @BotFather"
    echo "   - Add: start - Start the poker game"
    echo ""
    echo "3. Test your Mini App:"
    echo "   - Open @$BOT_USERNAME in Telegram"
    echo "   - Send /start"
    echo "   - Click 'Start Game' button"
    echo "=========================================="
}

# Function to test bot configuration
test_bot() {
    log "Testing bot configuration..."
    
    # Check if configuration exists
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration not found. Run --setup first."
        exit 1
    fi
    
    # Load configuration
    source "$CONFIG_FILE"
    
    # Test bot token
    log "Testing bot token..."
    local response=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
    
    if echo "$response" | grep -q '"ok":true'; then
        local bot_name=$(echo "$response" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
        log_success "Bot token is valid"
        log_success "Bot name: $bot_name"
    else
        log_error "Bot token is invalid"
        log_error "Response: $response"
        exit 1
    fi
    
    # Test GitHub Pages URL
    log "Testing GitHub Pages URL..."
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$GITHUB_PAGES_URL")
    
    if [[ $http_code -eq 200 ]]; then
        log_success "GitHub Pages URL is accessible"
    else
        log_warning "GitHub Pages URL returned HTTP $http_code"
    fi
    
    # Show test results
    echo ""
    echo "=========================================="
    echo "🧪 TEST RESULTS"
    echo "=========================================="
    echo "✅ Bot token: Valid"
    echo "✅ Bot name: $bot_name"
    echo "✅ Bot username: @$BOT_USERNAME"
    echo "✅ GitHub Pages: HTTP $http_code"
    echo ""
    echo "To test your Mini App:"
    echo "1. Open @$BOT_USERNAME in Telegram"
    echo "2. Send /start"
    echo "3. Click 'Start Game' button"
    echo "=========================================="
}

# Function to show configuration
show_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        echo "=========================================="
        echo "📋 TELEGRAM BOT CONFIGURATION"
        echo "=========================================="
        cat "$CONFIG_FILE" | while IFS='=' read -r key value; do
            if [[ $key == "BOT_TOKEN" ]]; then
                echo "$key: ${value:0:10}..."
            else
                echo "$key: $value"
            fi
        done
        echo "=========================================="
    else
        log_error "Configuration not found. Run --setup first."
        exit 1
    fi
}

# Function to create bot commands template
create_commands_template() {
    cat > "telegram-bot-commands.txt" << 'EOF'
# Telegram Bot Commands Template
# Send these commands to @BotFather using /setcommands

start - Start the poker game
play - Play poker
help - Get help and instructions
rules - Show game rules
stats - Show your statistics
leaderboard - Show top players
settings - Game settings
about - About this game
EOF

    log_success "Bot commands template created: telegram-bot-commands.txt"
}

# Function to create deployment script
create_deployment_script() {
    cat > "deploy-telegram-mini-app.sh" << 'EOF'
#!/bin/bash

# Telegram Mini App Deployment Script
# Automatically deploys and configures your Mini App

set -e

echo "🚀 Deploying Telegram Mini App..."

# Deploy to GitHub Pages
./pokerv2/scripts/deploy-to-gh-pages-simple.sh -m "Deploy Telegram Mini App"

# Load configuration
if [[ -f ".telegram-bot-config" ]]; then
    source ".telegram-bot-config"
    echo "✅ Bot configured: @$BOT_USERNAME"
    echo "✅ Domain: $GITHUB_PAGES_URL"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Test your Mini App: https://t.me/$BOT_USERNAME"
    echo "2. Send /start to your bot"
    echo "3. Click 'Start Game' button"
else
    echo "⚠️  Bot configuration not found. Run setup first."
fi

echo "✅ Deployment complete!"
EOF

    chmod +x "deploy-telegram-mini-app.sh"
    log_success "Deployment script created: deploy-telegram-mini-app.sh"
}

# Main function
main() {
    log "Telegram Bot Setup"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Parse command line arguments
    case "${1:-}" in
        --setup)
            interactive_setup
            create_commands_template
            create_deployment_script
            ;;
        --deploy)
            deploy_and_configure
            ;;
        --test)
            test_bot
            ;;
        --config)
            show_config
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: ${1:-}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 