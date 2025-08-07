#!/bin/bash

# Deploy script that handles root-owned directories
# Requires sudo password or NOPASSWD sudo setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Launcher Hub - Deploy with Sudo${NC}"
echo "========================================"

# Load config
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
    echo -e "${RED}Cannot connect to Steam Deck${NC}"
    exit 1
fi

# First, copy files to home directory
echo "Staging files..."
echo -n "  - Copying files to home... "
scp -q dist/index.js main.py plugin.json package.json ${DECK_USER}@${DECK_IP}:~/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

# Create deployment script on Steam Deck
echo -n "  - Creating deployment script... "
ssh ${DECK_USER}@${DECK_IP} 'cat > ~/deploy_plugin.sh' << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

PLUGIN_NAME="launcher-hub"
PLUGIN_DIR="/home/deck/homebrew/plugins/${PLUGIN_NAME}"

echo "Creating plugin directory..."
sudo mkdir -p "${PLUGIN_DIR}/dist"

echo "Copying files..."
sudo cp ~/index.js "${PLUGIN_DIR}/dist/"
sudo cp ~/main.py "${PLUGIN_DIR}/"
sudo cp ~/plugin.json "${PLUGIN_DIR}/"
sudo cp ~/package.json "${PLUGIN_DIR}/"

echo "Setting permissions..."
sudo chown -R root:root "${PLUGIN_DIR}"
sudo chmod -R 755 "${PLUGIN_DIR}"

echo "Cleaning up staged files..."
rm -f ~/index.js ~/main.py ~/plugin.json ~/package.json

echo "Deployment complete!"
DEPLOY_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Make script executable
ssh ${DECK_USER}@${DECK_IP} "chmod +x ~/deploy_plugin.sh" 2>/dev/null

# Execute deployment script
echo ""
echo "Deploying plugin (requires sudo password)..."
echo "----------------------------------------"
ssh -t ${DECK_USER}@${DECK_IP} "./deploy_plugin.sh"

# Clean up deployment script
ssh ${DECK_USER}@${DECK_IP} "rm -f ~/deploy_plugin.sh" 2>/dev/null

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Plugin will auto-reload in Steam Deck UI"
echo "Look for the 🚀 icon in Quick Access menu"