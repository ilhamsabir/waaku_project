#!/bin/sh

# Docker healthcheck script for WhatsApp Multi-Session API
# This script is used by Docker to determine if the container is healthy

# Configuration
HEALTH_URL="http://localhost:3000/health"
SESSIONS_HEALTH_URL="http://localhost:3000/api/sessions/health"
TIMEOUT=10

# Function to check HTTP response
check_http() {
    local url=$1
    local expected_status=$2

    # Use wget if available, otherwise use curl
    if command -v curl > /dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null)
    elif command -v wget > /dev/null 2>&1; then
        response=$(wget -q -O /dev/null -S --timeout=$TIMEOUT "$url" 2>&1 | grep "HTTP/" | awk '{print $2}' | head -n1)
    else
        echo "ERROR: Neither curl nor wget available for health check"
        exit 1
    fi

    if [ "$response" = "$expected_status" ]; then
        return 0
    else
        echo "Health check failed: Expected $expected_status, got $response"
        return 1
    fi
}

# Check general service health
echo "Checking general service health..."
if ! check_http "$HEALTH_URL" "200"; then
    echo "UNHEALTHY: General service health check failed"
    exit 1
fi

# Check sessions health (can be 200 or 503)
echo "Checking sessions health..."
if command -v curl > /dev/null 2>&1; then
    sessions_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$SESSIONS_HEALTH_URL" 2>/dev/null)
elif command -v wget > /dev/null 2>&1; then
    sessions_response=$(wget -q -O /dev/null -S --timeout=$TIMEOUT "$SESSIONS_HEALTH_URL" 2>&1 | grep "HTTP/" | awk '{print $2}' | head -n1)
fi

if [ "$sessions_response" = "200" ] || [ "$sessions_response" = "503" ]; then
    echo "HEALTHY: All checks passed"
    exit 0
else
    echo "UNHEALTHY: Sessions health check failed with status $sessions_response"
    exit 1
fi
