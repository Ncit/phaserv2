#!/bin/bash

# Update Project Paths Script
# Updates all references from src/ to client/src/ in main project files

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[PROJECT PATH UPDATE]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PROJECT PATH UPDATE]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[PROJECT PATH UPDATE]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[PROJECT PATH UPDATE]${NC} ❌ $1"
}

# Check if we're in the pokerv2 directory
if [[ ! -f "README.md" ]]; then
    log_error "Please run this script from the pokerv2 directory"
    exit 1
fi

# Function to update paths in a file
update_file_paths() {
    local file_path=$1
    local temp_file="${file_path}.tmp"
    
    log "Updating paths in: $file_path"
    
    # Create backup
    cp "$file_path" "${file_path}.backup"
    
    # Update paths - replace src/ with client/src/ but be careful with existing client/src/
    sed 's|src/|client/src/|g' "$file_path" > "$temp_file"
    
    # Check if the file was actually changed
    if cmp -s "$file_path" "$temp_file"; then
        log_warning "No changes needed in: $file_path"
        rm "$temp_file"
        rm "${file_path}.backup"
    else
        mv "$temp_file" "$file_path"
        log_success "Updated: $file_path"
    fi
}

# Function to update main project documentation
update_main_docs() {
    log "Updating main project documentation..."
    
    # Main project files
    local main_files=(
        "README.md"
        "CHANGELOG.md"
        "PROJECT_SUMMARY.md"
        "REORGANIZATION_SUMMARY.md"
    )
    
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]] && grep -q "src/" "$file"; then
            update_file_paths "$file"
        fi
    done
}

# Function to update docs directory
update_docs_directory() {
    log "Updating docs directory..."
    
    # Find all markdown files in docs directory
    find docs -name "*.md" -type f | while read -r file; do
        if grep -q "src/" "$file"; then
            update_file_paths "$file"
        fi
    done
}

# Function to update all files
update_all() {
    log "Starting comprehensive project path update..."
    
    update_main_docs
    update_docs_directory
    
    log_success "All project path updates completed!"
}

# Function to show what would be updated
preview_changes() {
    log "Preview of files that would be updated:"
    echo "======================================"
    
    # Main project files
    echo ""
    echo "Main Project Files:"
    local main_files=(
        "README.md"
        "CHANGELOG.md"
        "PROJECT_SUMMARY.md"
        "REORGANIZATION_SUMMARY.md"
    )
    
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]] && grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
    
    # Documentation files
    echo ""
    echo "Documentation Files:"
    find docs -name "*.md" -type f | while read -r file; do
        if grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
}

# Function to restore backups
restore_backups() {
    log "Restoring backups..."
    
    find . -name "*.backup" -type f | while read -r backup_file; do
        original_file="${backup_file%.backup}"
        if [[ -f "$original_file" ]]; then
            mv "$backup_file" "$original_file"
            log_success "Restored: $original_file"
        fi
    done
    
    log_success "All backups restored!"
}

# Function to clean backups
clean_backups() {
    log "Cleaning backup files..."
    
    find . -name "*.backup" -type f -delete
    
    log_success "All backup files cleaned!"
}

# Main menu
show_menu() {
    echo ""
    echo "🔄 Project Path Update Tool"
    echo "==========================="
    echo ""
    echo "1. Preview changes (dry run)"
    echo "2. Update all files"
    echo "3. Update main project files only"
    echo "4. Update docs directory only"
    echo "5. Restore backups"
    echo "6. Clean backup files"
    echo "7. Exit"
    echo ""
    read -p "Choose an option (1-7): " choice
}

# Main execution
main() {
    case $1 in
        "preview")
            preview_changes
            ;;
        "all")
            update_all
            ;;
        "main")
            update_main_docs
            ;;
        "docs")
            update_docs_directory
            ;;
        "restore")
            restore_backups
            ;;
        "clean")
            clean_backups
            ;;
        *)
            # Interactive mode
            while true; do
                show_menu
                case $choice in
                    1)
                        preview_changes
                        ;;
                    2)
                        update_all
                        ;;
                    3)
                        update_main_docs
                        ;;
                    4)
                        update_docs_directory
                        ;;
                    5)
                        restore_backups
                        ;;
                    6)
                        clean_backups
                        ;;
                    7)
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