#!/bin/bash

# View live logs from Steam Deck
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Launcher Hub - Live Logs${NC}"
echo "===================================="

# Load config
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"

echo -e "Connecting to: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
echo "Press Ctrl+C to stop"
echo ""

# Show live logs
ssh ${DECK_USER}@${DECK_IP} "journalctl --user -f | grep -i --color=always 'launcher'" 2>/dev/null || {
    echo -e "${RED}Failed to connect or view logs${NC}"
    echo "Please run './scripts/test-connection.sh' first"
    exit 1
}