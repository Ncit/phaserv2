#!/bin/bash

# Server Dependencies Update Script
# Provides multiple options for updating Node.js dependencies

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[UPDATE]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[UPDATE]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[UPDATE]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[UPDATE]${NC} ❌ $1"
}

# Check if we're in the server directory
if [[ ! -f "package.json" ]]; then
    log_error "Please run this script from the server directory"
    exit 1
fi

# Function to show current status
show_status() {
    log "Current Dependencies Status"
    echo "=========================="
    
    if command -v npm-check-updates &> /dev/null; then
        npx npm-check-updates
    else
        npm outdated
    fi
    
    echo ""
    log "Security Audit"
    echo "=============="
    npm audit --audit-level=moderate || true
}

# Function to update within version ranges
update_safe() {
    log "Updating dependencies within version ranges..."
    npm update
    log_success "Safe update completed"
}

# Function to update to latest versions
update_latest() {
    log "Updating to latest versions..."
    
    # Check if npm-check-updates is available
    if ! command -v npm-check-updates &> /dev/null; then
        log_warning "npm-check-updates not found, installing..."
        npm install -g npm-check-updates
    fi
    
    # Update package.json
    npx npm-check-updates -u
    
    # Install updated packages
    npm install
    
    log_success "Latest versions update completed"
}

# Function to clean install
clean_install() {
    log "Performing clean install..."
    
    # Remove existing modules
    rm -rf node_modules package-lock.json
    
    # Reinstall
    npm install
    
    log_success "Clean install completed"
}

# Function to fix security issues
fix_security() {
    log "Checking and fixing security issues..."
    
    # Run audit fix
    npm audit fix || {
        log_warning "Some security issues require manual attention"
        log "Run 'npm audit' to see details"
    }
    
    log_success "Security fixes applied"
}

# Function to update specific package
update_specific() {
    local package_name=$1
    
    if [[ -z "$package_name" ]]; then
        log_error "Please specify a package name"
        echo "Usage: $0 specific <package-name>"
        exit 1
    fi
    
    log "Updating specific package: $package_name"
    npm update "$package_name"
    log_success "Package $package_name updated"
}

# Main menu
show_menu() {
    echo ""
    echo "🔄 Server Dependencies Update Tool"
    echo "=================================="
    echo ""
    echo "1. Show current status"
    echo "2. Safe update (within version ranges)"
    echo "3. Update to latest versions"
    echo "4. Clean install (fresh start)"
    echo "5. Fix security issues"
    echo "6. Update specific package"
    echo "7. All-in-one update (safe + security)"
    echo "8. Exit"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# Main execution
main() {
    case $1 in
        "status")
            show_status
            ;;
        "safe")
            update_safe
            ;;
        "latest")
            update_latest
            ;;
        "clean")
            clean_install
            ;;
        "security")
            fix_security
            ;;
        "specific")
            update_specific "$2"
            ;;
        "all")
            update_safe
            fix_security
            show_status
            ;;
        *)
            # Interactive mode
            while true; do
                show_menu
                case $choice in
                    1)
                        show_status
                        ;;
                    2)
                        update_safe
                        ;;
                    3)
                        update_latest
                        ;;
                    4)
                        clean_install
                        ;;
                    5)
                        fix_security
                        ;;
                    6)
                        read -p "Enter package name: " package_name
                        update_specific "$package_name"
                        ;;
                    7)
                        update_safe
                        fix_security
                        show_status
                        ;;
                    8)
                        log "Goodbye!"
                        exit 0
                        ;;
                    *)
                        log_error "Invalid option"
                        ;;
                esac
                
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with arguments
main "$@" 