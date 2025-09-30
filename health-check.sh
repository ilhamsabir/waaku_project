#!/bin/bash

# WhatsApp Sessions Health Check Script
# Usage: ./health-check.sh [URL] [--verbose]

# Default configuration
BASE_URL="${1:-http://localhost:3000}"
VERBOSE="${2:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if service is running
check_service() {
    local url=$1
    local timeout=5

    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main health check
main() {
    print_status "INFO" "Checking WhatsApp Sessions Health..."
    print_status "INFO" "Base URL: $BASE_URL"
    echo ""

    # Check general health
    print_status "INFO" "1. Checking general service health..."
    if check_service "$BASE_URL/health"; then
        GENERAL_HEALTH=$(curl -s "$BASE_URL/health" 2>/dev/null)
        if [ $? -eq 0 ]; then
            print_status "OK" "General service is healthy"
            if [ "$VERBOSE" = "--verbose" ]; then
                echo "   Service Info: $(echo $GENERAL_HEALTH | jq -r '.service // "N/A"' 2>/dev/null || echo "N/A")"
                echo "   Uptime: $(echo $GENERAL_HEALTH | jq -r '.uptime // "N/A"' 2>/dev/null || echo "N/A")s"
            fi
        else
            print_status "WARNING" "General service responded but with issues"
        fi
    else
        print_status "ERROR" "General service is not responding"
        exit 1
    fi

    echo ""

    # Check sessions health
    print_status "INFO" "2. Checking WhatsApp sessions health..."
    if check_service "$BASE_URL/api/sessions/health"; then
        SESSIONS_HEALTH=$(curl -s "$BASE_URL/api/sessions/health" 2>/dev/null)
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/sessions/health" 2>/dev/null)

        if [ "$HTTP_CODE" = "200" ]; then
            print_status "OK" "All sessions are healthy"
        elif [ "$HTTP_CODE" = "503" ]; then
            print_status "WARNING" "Some sessions are unhealthy"
        else
            print_status "ERROR" "Sessions health check failed (HTTP $HTTP_CODE)"
        fi

        # Parse session statistics
        if command -v jq > /dev/null 2>&1; then
            TOTAL=$(echo $SESSIONS_HEALTH | jq -r '.summary.total // 0' 2>/dev/null)
            HEALTHY=$(echo $SESSIONS_HEALTH | jq -r '.summary.healthy // 0' 2>/dev/null)
            READY=$(echo $SESSIONS_HEALTH | jq -r '.summary.ready // 0' 2>/dev/null)
            UNHEALTHY=$(echo $SESSIONS_HEALTH | jq -r '.summary.unhealthy // 0' 2>/dev/null)

            echo "   📊 Sessions Summary:"
            echo "      Total: $TOTAL"
            echo "      Healthy: $HEALTHY"
            echo "      Ready: $READY"
            echo "      Unhealthy: $UNHEALTHY"

            if [ "$VERBOSE" = "--verbose" ] && [ "$TOTAL" -gt 0 ]; then
                echo ""
                echo "   📋 Individual Sessions:"
                echo $SESSIONS_HEALTH | jq -r '.sessions[] | "      ID: \(.id) | Status: \(.status) | Healthy: \(.healthy) | Uptime: \(.uptime)s"' 2>/dev/null
            fi
        else
            echo "   ⚠️  Install 'jq' for detailed session statistics"
        fi
    else
        print_status "ERROR" "Sessions health endpoint is not responding"
        exit 1
    fi

    echo ""

    # Overall assessment
    if [ "$HTTP_CODE" = "200" ]; then
        print_status "OK" "🎉 Overall system health: GOOD"
        exit 0
    elif [ "$HTTP_CODE" = "503" ]; then
        print_status "WARNING" "⚠️  Overall system health: DEGRADED"
        exit 1
    else
        print_status "ERROR" "💥 Overall system health: CRITICAL"
        exit 2
    fi
}

# Help function
show_help() {
    echo "WhatsApp Sessions Health Check"
    echo ""
    echo "Usage: $0 [URL] [--verbose]"
    echo ""
    echo "Arguments:"
    echo "  URL       Base URL of the WhatsApp service (default: http://localhost:3000)"
    echo "  --verbose Show detailed session information"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Check localhost:3000"
    echo "  $0 http://your-domain.com            # Check remote server"
    echo "  $0 http://localhost:3000 --verbose   # Detailed output"
    echo ""
    echo "Exit codes:"
    echo "  0 - All healthy"
    echo "  1 - Some issues detected"
    echo "  2 - Critical issues"
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main
