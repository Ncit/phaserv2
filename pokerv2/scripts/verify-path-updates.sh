#!/bin/bash

# Path Update Verification Script
# Verifies that all path updates were successful after moving files to client folder

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[VERIFY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[VERIFY]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[VERIFY]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[VERIFY]${NC} ❌ $1"
}

# Check if we're in the pokerv2 directory
if [[ ! -f "README.md" ]]; then
    log_error "Please run this script from the pokerv2 directory"
    exit 1
fi

# Function to check for old path references
check_old_paths() {
    log "Checking for old path references..."
    
    local old_path_count=0
    
    # Check for old src/ references in client files (excluding index.html, dependencies, and README.md)
    # Look for src/ that is NOT client/src/
    local client_old_refs=$(find client -name "*.html" -o -name "*.js" -o -name "*.md" | grep -v "index.html" | grep -v "dependencies" | grep -v "README.md" | xargs grep -l "src/" | xargs grep -L "client/src/" 2>/dev/null | wc -l)
    if [[ $client_old_refs -gt 0 ]]; then
        log_error "Found $client_old_refs old 'src/' references in client files"
        old_path_count=$((old_path_count + 1))
    else
        log_success "No old 'src/' references found in client files"
    fi
    
    # Check for old src/ references in main project files (should be client/src/)
    local main_old_refs=$(find . -maxdepth 1 -name "*.md" | xargs grep -l "src/" | xargs grep -L "client/src/" 2>/dev/null | wc -l)
    if [[ $main_old_refs -gt 0 ]]; then
        log_error "Found $main_old_refs old 'src/' references in main project files"
        old_path_count=$((old_path_count + 1))
    else
        log_success "No old 'src/' references found in main project files"
    fi
    
    # Check for old src/ references in docs (should be client/src/)
    local docs_old_refs=$(find docs -name "*.md" | xargs grep -l "src/" | xargs grep -L "client/src/" 2>/dev/null | wc -l)
    if [[ $docs_old_refs -gt 0 ]]; then
        log_error "Found $docs_old_refs old 'src/' references in docs"
        old_path_count=$((old_path_count + 1))
    else
        log_success "No old 'src/' references found in docs"
    fi
    
    return $old_path_count
}

# Function to check for correct new path references
check_new_paths() {
    log "Checking for correct new path references..."
    
    local correct_path_count=0
    
    # Check for client/src/ references in test files
    local test_files_with_correct_paths=$(find client/tests -name "*.html" | xargs grep -l "client/src/" 2>/dev/null | wc -l)
    if [[ $test_files_with_correct_paths -gt 0 ]]; then
        log_success "Found $test_files_with_correct_paths test files with correct 'client/src/' paths"
        correct_path_count=$((correct_path_count + test_files_with_correct_paths))
    else
        log_warning "No test files found with 'client/src/' paths"
    fi
    
    # Check for client/src/ references in main README
    if grep -q "client/src/" README.md; then
        log_success "README.md has correct 'client/src/' references"
        correct_path_count=$((correct_path_count + 1))
    else
        log_error "README.md missing 'client/src/' references"
    fi
    
    # Check for client/src/ references in docs
    local docs_with_correct_paths=$(find docs -name "*.md" | xargs grep -l "client/src/" 2>/dev/null | wc -l)
    if [[ $docs_with_correct_paths -gt 0 ]]; then
        log_success "Found $docs_with_correct_paths docs with correct 'client/src/' paths"
        correct_path_count=$((correct_path_count + docs_with_correct_paths))
    else
        log_warning "No docs found with 'client/src/' paths"
    fi
    
    return $correct_path_count
}

# Function to check memory bank files
check_memory_bank() {
    log "Checking memory bank files..."
    
    if grep -q "pokerv2/client/src/" ../memory-bank/*.md; then
        log_success "Memory bank files have correct 'pokerv2/client/src/' references"
        return 0
    else
        log_error "Memory bank files missing 'pokerv2/client/src/' references"
        return 1
    fi
}

# Function to check environment scripts
check_environment_scripts() {
    log "Checking environment scripts..."
    
    local script_count=0
    
    # Check if environment scripts exist and have correct paths
    if [[ -f "client/scripts/check-environment.sh" ]]; then
        if grep -q "client/src/config/EnvironmentConfig.js" client/scripts/check-environment.sh; then
            log_success "check-environment.sh has correct path"
            script_count=$((script_count + 1))
        else
            log_error "check-environment.sh has incorrect path"
        fi
    fi
    
    if [[ -f "client/scripts/set-development.sh" ]]; then
        if grep -q "client/src/config/EnvironmentConfig.js" client/scripts/set-development.sh; then
            log_success "set-development.sh has correct path"
            script_count=$((script_count + 1))
        else
            log_error "set-development.sh has incorrect path"
        fi
    fi
    
    if [[ -f "client/scripts/set-vk.sh" ]]; then
        if grep -q "client/src/config/EnvironmentConfig.js" client/scripts/set-vk.sh; then
            log_success "set-vk.sh has correct path"
            script_count=$((script_count + 1))
        else
            log_error "set-vk.sh has incorrect path"
        fi
    fi
    
    if [[ -f "client/scripts/set-telegram.sh" ]]; then
        if grep -q "client/src/config/EnvironmentConfig.js" client/scripts/set-telegram.sh; then
            log_success "set-telegram.sh has correct path"
            script_count=$((script_count + 1))
        else
            log_error "set-telegram.sh has incorrect path"
        fi
    fi
    
    return $script_count
}

# Function to check file structure
check_file_structure() {
    log "Checking file structure..."
    
    local structure_ok=true
    
    # Check if client directory exists and has expected structure
    if [[ ! -d "client" ]]; then
        log_error "client/ directory not found"
        structure_ok=false
    fi
    
    if [[ ! -d "client/src" ]]; then
        log_error "client/src/ directory not found"
        structure_ok=false
    fi
    
    if [[ ! -d "client/tests" ]]; then
        log_error "client/tests/ directory not found"
        structure_ok=false
    fi
    
    if [[ ! -d "client/scripts" ]]; then
        log_error "client/scripts/ directory not found"
        structure_ok=false
    fi
    
    if [[ ! -f "client/index.html" ]]; then
        log_error "client/index.html not found"
        structure_ok=false
    fi
    
    # Check if server directory exists
    if [[ ! -d "server" ]]; then
        log_error "server/ directory not found"
        structure_ok=false
    fi
    
    if [[ ! -d "server/src" ]]; then
        log_error "server/src/ directory not found"
        structure_ok=false
    fi
    
    if $structure_ok; then
        log_success "File structure is correct"
        return 0
    else
        return 1
    fi
}

# Function to run all checks
run_all_checks() {
    log "Starting comprehensive path update verification..."
    echo ""
    
    local total_errors=0
    local total_successes=0
    
    # Check file structure
    if check_file_structure; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check for old paths
    check_old_paths
    if [[ $? -eq 0 ]]; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + $?))
    fi
    
    # Check for new paths
    check_new_paths
    if [[ $? -gt 0 ]]; then
        total_successes=$((total_successes + $?))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check memory bank
    if check_memory_bank; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check environment scripts
    if check_environment_scripts; then
        total_successes=$((total_successes + $?))
    else
        total_errors=$((total_errors + 1))
    fi
    
    echo ""
    echo "=========================================="
    echo "📊 VERIFICATION SUMMARY"
    echo "=========================================="
    echo "✅ Successful checks: $total_successes"
    echo "❌ Errors found: $total_errors"
    echo ""
    
    if [[ $total_errors -eq 0 ]]; then
        log_success "All path updates verified successfully!"
        return 0
    else
        log_error "Found $total_errors issues that need attention"
        return 1
    fi
}

# Main execution
main() {
    case $1 in
        "structure")
            check_file_structure
            ;;
        "old-paths")
            check_old_paths
            ;;
        "new-paths")
            check_new_paths
            ;;
        "memory-bank")
            check_memory_bank
            ;;
        "scripts")
            check_environment_scripts
            ;;
        *)
            run_all_checks
            ;;
    esac
}

# Run main function with arguments
main "$@" 