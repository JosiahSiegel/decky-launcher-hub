#!/bin/bash

# Stage files for manual deployment
# This copies files to Steam Deck home directory for manual sudo move

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Launcher Hub - Stage for Deployment${NC}"
echo "========================================="

# Load config
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"
PLUGIN_NAME="launcher-hub"

echo -e "Staging to: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
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

# Create staging directory
echo -n "Creating staging directory... "
ssh ${DECK_USER}@${DECK_IP} "mkdir -p ~/launcher-hub-stage" 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

# Copy files
echo "Copying files:"
echo -n "  - dist/index.js... "
scp -q dist/index.js ${DECK_USER}@${DECK_IP}:~/launcher-hub-stage/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - main.py... "
scp -q main.py ${DECK_USER}@${DECK_IP}:~/launcher-hub-stage/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - plugin.json... "
scp -q plugin.json ${DECK_USER}@${DECK_IP}:~/launcher-hub-stage/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - package.json... "
scp -q package.json ${DECK_USER}@${DECK_IP}:~/launcher-hub-stage/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

# Create install script
echo -n "Creating install script... "
ssh ${DECK_USER}@${DECK_IP} 'cat > ~/launcher-hub-stage/install.sh' << 'INSTALL_SCRIPT'
#!/bin/bash

# Install script - run with sudo

PLUGIN_DIR="/home/deck/homebrew/plugins/launcher-hub"

echo "Installing Launcher Hub plugin..."
echo "================================"

# Create directories
echo -n "Creating plugin directory... "
mkdir -p "${PLUGIN_DIR}/dist" && echo "✓" || echo "✗"

# Copy files
echo "Copying files:"
echo -n "  - index.js... "
cp ~/launcher-hub-stage/index.js "${PLUGIN_DIR}/dist/" && echo "✓" || echo "✗"

echo -n "  - main.py... "
cp ~/launcher-hub-stage/main.py "${PLUGIN_DIR}/" && echo "✓" || echo "✗"

echo -n "  - plugin.json... "
cp ~/launcher-hub-stage/plugin.json "${PLUGIN_DIR}/" && echo "✓" || echo "✗"

echo -n "  - package.json... "
cp ~/launcher-hub-stage/package.json "${PLUGIN_DIR}/" && echo "✓" || echo "✗"

# Set permissions
echo -n "Setting permissions... "
chown -R root:root "${PLUGIN_DIR}"
chmod -R 755 "${PLUGIN_DIR}"
echo "✓"

echo ""
echo "✅ Installation complete!"
echo "Plugin will auto-reload in Steam UI"
INSTALL_SCRIPT

ssh ${DECK_USER}@${DECK_IP} "chmod +x ~/launcher-hub-stage/install.sh" 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""
echo -e "${GREEN}✅ Files staged successfully!${NC}"
echo ""
echo -e "${YELLOW}To complete installation on Steam Deck:${NC}"
echo "  1. SSH to Steam Deck: ssh ${DECK_USER}@${DECK_IP}"
echo "  2. Run: sudo ~/launcher-hub-stage/install.sh"
echo ""
echo "Or run the install script now with:"
echo "  ssh -t ${DECK_USER}@${DECK_IP} 'sudo ~/launcher-hub-stage/install.sh'"