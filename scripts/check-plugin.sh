#!/bin/bash

# Check plugin status on Steam Deck
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Launcher Hub - Plugin Status Check${NC}"
echo "========================================="

# Load config
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"
PLUGIN_NAME="${PLUGIN_NAME:-launcher-hub}"

echo -e "Checking: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
echo ""

# Check if plugin is installed
echo -e "${YELLOW}1. Plugin Installation:${NC}"
ssh ${DECK_USER}@${DECK_IP} "ls -la /home/deck/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null | head -5" || echo "Not installed"
echo ""

# Check backend process
echo -e "${YELLOW}2. Backend Process:${NC}"
ssh ${DECK_USER}@${DECK_IP} "ps aux | grep -i 'launcher.*hub' | grep -v grep" || echo "Not running"
echo ""

# Check recent logs
echo -e "${YELLOW}3. Recent Plugin Logs (last 20 lines):${NC}"
ssh ${DECK_USER}@${DECK_IP} "sudo journalctl -u plugin_loader --no-hostname --since '2 minutes ago' | grep -i launcher | tail -20" 2>/dev/null || echo "No recent logs"
echo ""

# Check for errors
echo -e "${YELLOW}4. Recent Errors:${NC}"
ssh ${DECK_USER}@${DECK_IP} "sudo journalctl -u plugin_loader --no-hostname --since '2 minutes ago' | grep -iE 'error|failed|exception' | grep -i launcher | tail -10" 2>/dev/null || echo "No errors found"
echo ""

# Check CEF logs for frontend errors
echo -e "${YELLOW}5. Frontend Errors (CEF):${NC}"
ssh ${DECK_USER}@${DECK_IP} "tail -20 /home/deck/.local/share/Steam/logs/cef_log.txt 2>/dev/null | grep -i launcher" || echo "No frontend errors"
echo ""

echo -e "${GREEN}Check complete!${NC}"