#\!/bin/bash
# Quick deployment script for Launcher Hub plugin after Decky reinstall

DECK_IP="192.168.68.80"
DECK_USER="deck"
PLUGIN_NAME="launcher-hub"

echo "🚀 Launcher Hub Quick Deploy Script"
echo "===================================="
echo ""

# Check connection
echo "1. Testing connection to Steam Deck..."
if \! ssh -o ConnectTimeout=5 ${DECK_USER}@${DECK_IP} "echo 'Connected\!'" 2>/dev/null; then
    echo "❌ Cannot connect to Steam Deck at ${DECK_IP}"
    echo "   Please check the IP address and ensure SSH is enabled"
    exit 1
fi
echo "✅ Connected to Steam Deck"

# Check if Decky is installed
echo ""
echo "2. Checking Decky Loader..."
if ssh ${DECK_USER}@${DECK_IP} "[ -d /home/deck/homebrew/plugins ]" 2>/dev/null; then
    echo "✅ Decky Loader detected"
else
    echo "❌ Decky Loader not found. Please install it first."
    echo "   Visit: https://decky.xyz"
    exit 1
fi

# Create plugin directory
echo ""
echo "3. Creating plugin directory..."
ssh ${DECK_USER}@${DECK_IP} "mkdir -p /home/deck/homebrew/plugins/${PLUGIN_NAME}/dist" 2>/dev/null
echo "✅ Plugin directory ready"

# Deploy files
echo ""
echo "4. Deploying plugin files..."

# Copy main files
scp -q dist/index.js ${DECK_USER}@${DECK_IP}:/home/deck/homebrew/plugins/${PLUGIN_NAME}/dist/
scp -q main.py ${DECK_USER}@${DECK_IP}:/home/deck/homebrew/plugins/${PLUGIN_NAME}/
scp -q plugin.json ${DECK_USER}@${DECK_IP}:/home/deck/homebrew/plugins/${PLUGIN_NAME}/
scp -q package.json ${DECK_USER}@${DECK_IP}:/home/deck/homebrew/plugins/${PLUGIN_NAME}/

echo "✅ Files deployed"

# Set permissions
echo ""
echo "5. Setting permissions..."
ssh ${DECK_USER}@${DECK_IP} "chmod -R 755 /home/deck/homebrew/plugins/${PLUGIN_NAME}/" 2>/dev/null
echo "✅ Permissions set"

echo ""
echo "===================================="
echo "✅ Deployment complete\!"
echo ""
echo "Next steps:"
echo "1. Open Steam Deck UI"
echo "2. Press ... button"
echo "3. Look for 🚀 icon in Quick Access menu"
echo ""
echo "For debugging:"
echo "- Monitor logs: ssh ${DECK_USER}@${DECK_IP} 'journalctl -u plugin_loader -f'"
echo "- Chrome DevTools: http://${DECK_IP}:8081"
