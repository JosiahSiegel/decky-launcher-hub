#!/bin/bash

# Setup Steam Deck for development
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Setup Steam Deck for Development${NC}"
echo "======================================="
echo ""
echo "This script will:"
echo "  1. Test SSH connection"
echo "  2. Install Decky Loader (if needed)"
echo "  3. Create plugin directory"
echo "  4. Set correct permissions"
echo ""

# Load config
if [ -f .env ]; then
    source .env
else
    echo -e "${YELLOW}No .env file found${NC}"
    read -p "Enter Steam Deck IP address: " DECK_IP
    read -p "Enter Steam Deck username (default: deck): " DECK_USER
    DECK_USER="${DECK_USER:-deck}"
    
    # Save to .env
    echo "DECK_IP=${DECK_IP}" > .env
    echo "DECK_USER=${DECK_USER}" >> .env
    echo -e "${GREEN}Saved configuration to .env${NC}"
    echo ""
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"

echo -e "Target: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
echo ""

# Test connection
echo -n "Testing SSH connection... "
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${DECK_USER}@${DECK_IP} "echo 'connected'" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo ""
    echo -e "${RED}Cannot connect to Steam Deck${NC}"
    echo ""
    echo "Please enable SSH on your Steam Deck:"
    echo "  1. Switch to Desktop Mode"
    echo "  2. Open Konsole"
    echo "  3. Set password: passwd deck"
    echo "  4. Enable SSH: sudo systemctl enable sshd"
    echo "  5. Start SSH: sudo systemctl start sshd"
    echo ""
    echo "Then run this script again"
    exit 1
fi

# Check Decky Loader
echo -n "Checking Decky Loader... "
if ssh ${DECK_USER}@${DECK_IP} "[ -d ~/homebrew/plugins ]" 2>/dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}Not found${NC}"
    echo ""
    echo "Decky Loader is required for this plugin"
    echo "Visit: https://decky.xyz"
    echo ""
    read -p "Would you like instructions to install it? (y/n): " INSTALL_DECKY
    if [[ "$INSTALL_DECKY" =~ ^[Yy]$ ]]; then
        echo ""
        echo "To install Decky Loader:"
        echo "  1. On Steam Deck, open a web browser"
        echo "  2. Go to: https://decky.xyz"
        echo "  3. Download the installer"
        echo "  4. Run in Desktop Mode: "
        echo "     curl -L https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/install_release.sh | sh"
        echo ""
        echo "After installation, run this script again"
        exit 0
    fi
fi

# Create plugin directory
echo -n "Creating plugin directory... "
ssh ${DECK_USER}@${DECK_IP} "mkdir -p ~/homebrew/plugins/launcher-hub/dist" 2>/dev/null
echo -e "${GREEN}✓${NC}"

# Check permissions
echo -n "Checking permissions... "
OWNER=$(ssh ${DECK_USER}@${DECK_IP} "stat -c '%U' ~/homebrew/plugins/launcher-hub 2>/dev/null" || echo "unknown")
if [ "$OWNER" = "$DECK_USER" ]; then
    echo -e "${GREEN}✓ Correct${NC}"
else
    echo -e "${YELLOW}⚠ Fixing${NC}"
    echo ""
    echo "Plugin directory has incorrect ownership"
    echo "You may need to enter your Steam Deck password:"
    ssh -t ${DECK_USER}@${DECK_IP} "sudo chown -R ${DECK_USER}:${DECK_USER} ~/homebrew/plugins/launcher-hub" 2>/dev/null
    echo -e "${GREEN}✓ Fixed${NC}"
fi

echo ""
echo -e "${GREEN}✅ Steam Deck is ready for development!${NC}"
echo ""
echo "You can now:"
echo "  - Use 'Build & Deploy' task in VSCode"
echo "  - Run: ./scripts/deploy-simple.sh"
echo "  - View logs: ./scripts/view-logs.sh"