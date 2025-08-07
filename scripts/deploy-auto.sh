#!/bin/bash

# Automated deployment script using sudo password from .env
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Launcher Hub - Automated Deploy${NC}"
echo "======================================="

# Load config
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}No .env file found${NC}"
    echo "Run './scripts/configure-env.sh' first"
    exit 1
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"
PLUGIN_NAME="${PLUGIN_NAME:-launcher-hub}"

echo -e "Deploying to: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"

# Check if we have a sudo password
if [ -z "$DECK_BECOME_PASSWORD" ]; then
    echo ""
    echo -e "${YELLOW}No sudo password configured${NC}"
    echo "Falling back to staging deployment..."
    echo ""
    exec ./scripts/stage-deploy.sh
fi

echo -e "${YELLOW}⚠️  Using automated sudo (DEVELOPMENT ONLY)${NC}"
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
ssh ${DECK_USER}@${DECK_IP} "mkdir -p ~/launcher-hub-deploy" 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

# Copy files
echo "Copying files:"
echo -n "  - dist/index.js... "
scp -q dist/index.js ${DECK_USER}@${DECK_IP}:~/launcher-hub-deploy/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - main.py... "
scp -q src/backend/main.py ${DECK_USER}@${DECK_IP}:~/launcher-hub-deploy/main.py 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - plugin.json... "
scp -q plugin.json ${DECK_USER}@${DECK_IP}:~/launcher-hub-deploy/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  - package.json... "
scp -q package.json ${DECK_USER}@${DECK_IP}:~/launcher-hub-deploy/ 2>/dev/null && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

# Deploy with sudo using password
echo ""
echo "Deploying plugin with sudo..."

# Create deploy command
DEPLOY_CMD="
echo '${DECK_BECOME_PASSWORD}' | sudo -S mkdir -p /home/deck/homebrew/plugins/${PLUGIN_NAME}/dist 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S cp ~/launcher-hub-deploy/index.js /home/deck/homebrew/plugins/${PLUGIN_NAME}/dist/ 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S cp ~/launcher-hub-deploy/main.py /home/deck/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S cp ~/launcher-hub-deploy/plugin.json /home/deck/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S cp ~/launcher-hub-deploy/package.json /home/deck/homebrew/plugins/${PLUGIN_NAME}/ 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S chown -R root:root /home/deck/homebrew/plugins/${PLUGIN_NAME} 2>/dev/null &&
echo '${DECK_BECOME_PASSWORD}' | sudo -S chmod -R 755 /home/deck/homebrew/plugins/${PLUGIN_NAME} 2>/dev/null &&
rm -rf ~/launcher-hub-deploy 2>/dev/null &&
echo 'SUCCESS'
"

# Execute deployment
RESULT=$(ssh ${DECK_USER}@${DECK_IP} "${DEPLOY_CMD}" 2>&1 | tail -1)

if [ "$RESULT" = "SUCCESS" ]; then
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "Plugin will auto-reload in Steam Deck UI"
    echo "Look for the 🚀 icon in Quick Access menu"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "Check sudo password in .env file"
    echo "Or use './scripts/stage-deploy.sh' for manual deployment"
    exit 1
fi