#!/bin/bash

# Simple deployment script for VSCode tasks
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Launcher Hub - Simple Deploy${NC}"
echo "===================================="

# Check for .env file or use defaults
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"
PLUGIN_NAME="launcher-hub"

echo -e "Deploying to: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
echo ""

# Test connection
echo -n "Testing connection... "
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${DECK_USER}@${DECK_IP} "echo 'connected'" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}Cannot connect to Steam Deck at ${DECK_IP}${NC}"
    echo "Please check:"
    echo "  1. Steam Deck IP is correct"
    echo "  2. SSH is enabled on Steam Deck"
    echo "  3. You have set up SSH keys or password"
    exit 1
fi

# Create plugin directory
echo -n "Creating plugin directory... "
if ssh ${DECK_USER}@${DECK_IP} "mkdir -p ~/homebrew/plugins/${PLUGIN_NAME}/dist" 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${RED}Failed to create plugin directory${NC}"
    echo "This might be a permissions issue (directories are root-owned)"
    echo "Continuing with deployment..."
fi

# Deploy files
echo "Deploying files:"

# Check if we have built files in dist, otherwise use root files
if [ -f dist/index.js ]; then
    echo -n "  - dist/index.js... "
    scp -q dist/index.js ${DECK_USER}@${DECK_IP}:~/homebrew/plugins/${PLUGIN_NAME}/dist/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
else
    echo -e "  - dist/index.js... ${YELLOW}⚠ Not found, build required${NC}"
fi

# Use main.py from root (that's where Decky expects it)
if [ -f main.py ]; then
    echo -n "  - main.py... "
    scp -q main.py ${DECK_USER}@${DECK_IP}:~/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
elif [ -f src/backend/main.py ]; then
    echo -n "  - src/backend/main.py -> main.py... "
    scp -q src/backend/main.py ${DECK_USER}@${DECK_IP}:~/homebrew/plugins/${PLUGIN_NAME}/main.py 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
else
    echo -e "  - main.py... ${RED}✗ Not found${NC}"
fi

echo -n "  - plugin.json... "
if scp -q plugin.json ${DECK_USER}@${DECK_IP}:~/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    # Try copying to home directory first
    if scp -q plugin.json ${DECK_USER}@${DECK_IP}:~/plugin.json.tmp 2>/dev/null; then
        echo -e "${YELLOW}⚠ Copied to home (needs manual move)${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
fi

echo -n "  - package.json... "
scp -q package.json ${DECK_USER}@${DECK_IP}:~/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Plugin will auto-reload in Steam Deck UI"
echo "Look for the 🚀 icon in Quick Access menu"