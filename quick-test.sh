#!/bin/bash

# Quick Load Test Script for Poker Game Server
# This script provides easy-to-use commands for testing server workload

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_SERVER="ws://localhost:3000"
DEFAULT_CONNECTIONS=50
DEFAULT_DURATION=60000

# Logging functions
log() {
    echo -e "${BLUE}[LOAD-TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[LOAD-TEST]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[LOAD-TEST]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[LOAD-TEST]${NC} ❌ $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
}

# Check if dependencies are installed
check_dependencies() {
    if [ ! -f "node_modules/ws/package.json" ]; then
        log_warning "WebSocket dependency not found. Installing..."
        npm install ws
    fi
}

# Check if server is running
check_server() {
    local server_url=$1
    local host=$(echo $server_url | sed 's/ws:\/\///' | cut -d: -f1)
    local port=$(echo $server_url | sed 's/ws:\/\///' | cut -d: -f2)
    
    if ! nc -z $host $port 2>/dev/null; then
        log_warning "Server at $server_url is not responding"
        log "Make sure your poker server is running:"
        log "  cd pokerv2/server && npm start"
        return 1
    fi
    
    log_success "Server at $server_url is running"
    return 0
}

# Run a load test
run_load_test() {
    local connections=$1
    local duration=$2
    local server_url=$3
    local test_name=$4
    
    log "Starting $test_name test..."
    log "  Connections: $connections"
    log "  Duration: ${duration}ms ($(($duration/1000))s)"
    log "  Server: $server_url"
    
    node load-test.js \
        --url="$server_url" \
        --connections="$connections" \
        --duration="$duration"
    
    log_success "$test_name test completed"
}

# Run server monitoring
run_monitoring() {
    local log_file=$1
    
    log "Starting server monitoring..."
    log "  Log file: $log_file"
    
    node server-monitor.js --log="$log_file" &
    local monitor_pid=$!
    
    echo $monitor_pid > .monitor.pid
    log_success "Server monitoring started (PID: $monitor_pid)"
    
    return $monitor_pid
}

# Stop server monitoring
stop_monitoring() {
    if [ -f .monitor.pid ]; then
        local monitor_pid=$(cat .monitor.pid)
        if kill -0 $monitor_pid 2>/dev/null; then
            kill $monitor_pid
            log_success "Server monitoring stopped (PID: $monitor_pid)"
        fi
        rm -f .monitor.pid
    fi
}

# Show usage
show_usage() {
    echo "🎮 Poker Game Server Load Testing Tool"
    echo "====================================="
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  light       Run light load test (10 connections, 30s)"
    echo "  medium      Run medium load test (50 connections, 60s)"
    echo "  heavy       Run heavy load test (200 connections, 120s)"
    echo "  stress      Run stress test (500 connections, 180s)"
    echo "  custom      Run custom load test"
    echo "  monitor     Start server monitoring"
    echo "  stop        Stop server monitoring"
    echo "  full        Run full test suite with monitoring"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --server=<url>     Server WebSocket URL (default: $DEFAULT_SERVER)"
    echo "  --connections=<n>  Number of connections"
    echo "  --duration=<ms>    Test duration in milliseconds"
    echo ""
    echo "Examples:"
    echo "  $0 light"
    echo "  $0 medium --server=ws://my-server.com:3000"
    echo "  $0 custom --connections=100 --duration=90000"
    echo "  $0 full"
}

# Main function
main() {
    local command=$1
    shift
    
    # Parse options
    local server_url=$DEFAULT_SERVER
    local connections=$DEFAULT_CONNECTIONS
    local duration=$DEFAULT_DURATION
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --server=*)
                server_url="${1#*=}"
                shift
                ;;
            --connections=*)
                connections="${1#*=}"
                shift
                ;;
            --duration=*)
                duration="${1#*=}"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_node
    check_dependencies
    
    case $command in
        light)
            check_server "$server_url" || exit 1
            run_load_test 10 30000 "$server_url" "Light Load"
            ;;
        medium)
            check_server "$server_url" || exit 1
            run_load_test 50 60000 "$server_url" "Medium Load"
            ;;
        heavy)
            check_server "$server_url" || exit 1
            run_load_test 200 120000 "$server_url" "Heavy Load"
            ;;
        stress)
            check_server "$server_url" || exit 1
            run_load_test 500 180000 "$server_url" "Stress"
            ;;
        custom)
            check_server "$server_url" || exit 1
            run_load_test "$connections" "$duration" "$server_url" "Custom Load"
            ;;
        monitor)
            run_monitoring "server-monitor-$(date +%Y%m%d-%H%M%S).log"
            ;;
        stop)
            stop_monitoring
            ;;
        full)
            check_server "$server_url" || exit 1
            
            log "Starting full test suite with monitoring..."
            
            # Start monitoring
            local monitor_log="full-test-$(date +%Y%m%d-%H%M%S).log"
            run_monitoring "$monitor_log"
            local monitor_pid=$!
            
            # Wait a moment for monitoring to start
            sleep 2
            
            # Run test suite
            log "Running test suite..."
            
            run_load_test 10 30000 "$server_url" "Light Load"
            sleep 10
            
            run_load_test 50 60000 "$server_url" "Medium Load"
            sleep 10
            
            run_load_test 200 120000 "$server_url" "Heavy Load"
            
            # Stop monitoring
            stop_monitoring
            
            log_success "Full test suite completed!"
            log "Check $monitor_log for server performance data"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_warning "Script interrupted. Cleaning up..."; stop_monitoring; exit 1' INT TERM

# Run main function with all arguments
main "$@" 