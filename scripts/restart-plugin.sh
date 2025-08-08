#!/bin/bash

# Restart the plugin on Steam Deck
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Restarting Launcher Hub Plugin${NC}"
echo "===================================="

# Load config
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"
DECK_BECOME_PASSWORD="${DECK_BECOME_PASSWORD}"

if [ -z "$DECK_BECOME_PASSWORD" ]; then
    echo -e "${RED}Error: DECK_BECOME_PASSWORD not set in .env${NC}"
    exit 1
fi

echo -e "Restarting plugin_loader service..."

# Restart the service
ssh ${DECK_USER}@${DECK_IP} "echo '${DECK_BECOME_PASSWORD}' | sudo -S systemctl restart plugin_loader" 2>/dev/null && {
    echo -e "${GREEN}✓ Service restarted${NC}"
    echo ""
    echo "Waiting for service to start..."
    sleep 3
    
    # Check if our plugin loaded
    echo -e "${BLUE}Checking plugin status:${NC}"
    ssh ${DECK_USER}@${DECK_IP} "ps aux | grep -i 'launcher.*hub' | grep -v grep" && {
        echo -e "${GREEN}✓ Plugin is running!${NC}"
    } || {
        echo -e "${RED}✗ Plugin not running${NC}"
    }
} || {
    echo -e "${RED}Failed to restart service${NC}"
    exit 1
}