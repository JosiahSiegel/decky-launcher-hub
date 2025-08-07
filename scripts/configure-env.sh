#!/bin/bash

# Configure environment for Launcher Hub development
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}⚙️  Configure Environment${NC}"
echo "=========================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}.env file already exists${NC}"
    echo ""
    echo "Current configuration:"
    grep "^DECK_IP=" .env || echo "  DECK_IP: not set"
    grep "^DECK_USER=" .env || echo "  DECK_USER: not set"
    echo ""
    read -p "Do you want to reconfigure? (y/n): " RECONFIGURE
    if [[ ! "$RECONFIGURE" =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration"
        exit 0
    fi
    echo ""
fi

# Get Steam Deck IP
echo "Enter your Steam Deck IP address"
echo "You can find this in Steam Deck's network settings"
echo "(Desktop Mode > System Settings > Network)"
echo ""
read -p "Steam Deck IP [192.168.1.100]: " DECK_IP
DECK_IP="${DECK_IP:-192.168.1.100}"

# Validate IP format
if ! [[ "$DECK_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    echo -e "${RED}Invalid IP address format${NC}"
    exit 1
fi

# Get username (usually 'deck')
echo ""
read -p "Steam Deck username [deck]: " DECK_USER
DECK_USER="${DECK_USER:-deck}"

# Ask about sudo password for automated deployment
echo ""
echo "For automated deployment, you can optionally provide the sudo password."
echo -e "${YELLOW}⚠️  SECURITY WARNING: Only do this on development Steam Decks!${NC}"
echo "Leave blank to skip (you'll need to manually run sudo commands)"
echo ""
read -s -p "Steam Deck sudo password (optional): " DECK_PASSWORD
echo ""

# Create .env file
echo ""
echo "Creating .env file..."
cat > .env << EOF
# Launcher Hub Configuration
# Generated on $(date)

# Steam Deck IP address for deployment
DECK_IP=${DECK_IP}

# SSH user (default is 'deck')
DECK_USER=${DECK_USER}

# Decky plugins directory
DECKY_PLUGIN_DIR=~/homebrew/plugins

# Plugin name
PLUGIN_NAME=launcher-hub
EOF

# Add password if provided
if [ -n "$DECK_PASSWORD" ]; then
    cat >> .env << EOF

# Automated deployment password (DEVELOPMENT ONLY!)
# ⚠️  SECURITY WARNING: Only use this on development Steam Decks!
DECK_BECOME_PASSWORD=${DECK_PASSWORD}
EOF
    echo -e "${YELLOW}⚠️  Sudo password saved (use only for development!)${NC}"
fi

echo -e "${GREEN}✅ Configuration saved to .env${NC}"
echo ""
echo "Configuration summary:"
echo "  Steam Deck IP: ${DECK_IP}"
echo "  Username: ${DECK_USER}"
echo ""
echo "Next steps:"
echo "  1. Test connection: ./scripts/test-connection.sh"
echo "  2. Deploy plugin: ./scripts/deploy-simple.sh"