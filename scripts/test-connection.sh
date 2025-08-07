#!/bin/bash

# Test SSH connection to Steam Deck
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔌 Testing Steam Deck Connection${NC}"
echo "===================================="

# Load config
if [ -f .env ]; then
    source .env
fi

DECK_IP="${DECK_IP:-192.168.68.80}"
DECK_USER="${DECK_USER:-deck}"

echo -e "Target: ${GREEN}${DECK_USER}@${DECK_IP}${NC}"
echo ""

# Test SSH connection
echo -n "SSH Connection: "
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${DECK_USER}@${DECK_IP} "echo 'connected'" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
    
    # Get Steam Deck info
    echo ""
    echo "Steam Deck Info:"
    ssh ${DECK_USER}@${DECK_IP} "uname -a" 2>/dev/null | sed 's/^/  /'
    
    # Check Decky Loader
    echo ""
    echo -n "Decky Loader: "
    if ssh ${DECK_USER}@${DECK_IP} "[ -d ~/homebrew/plugins ]" 2>/dev/null; then
        echo -e "${GREEN}✓ Installed${NC}"
        
        # Check our plugin
        echo -n "Launcher Hub Plugin: "
        if ssh ${DECK_USER}@${DECK_IP} "[ -d ~/homebrew/plugins/launcher-hub ]" 2>/dev/null; then
            echo -e "${GREEN}✓ Installed${NC}"
            
            # Check if backend is running
            echo -n "Backend Process: "
            if ssh ${DECK_USER}@${DECK_IP} "ps aux | grep -q '[L]auncher Hub'" 2>/dev/null; then
                echo -e "${GREEN}✓ Running${NC}"
            else
                echo -e "${YELLOW}⚠ Not running${NC}"
            fi
        else
            echo -e "${YELLOW}⚠ Not installed${NC}"
        fi
    else
        echo -e "${RED}✗ Not found${NC}"
        echo ""
        echo -e "${YELLOW}Please install Decky Loader first${NC}"
    fi
else
    echo -e "${RED}✗ Failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Steam Deck IP: ${DECK_IP}"
    echo "  2. Enable SSH on Steam Deck:"
    echo "     - Switch to Desktop Mode"
    echo "     - Open Konsole"
    echo "     - Run: passwd deck (set password)"
    echo "     - Run: sudo systemctl enable sshd"
    echo "     - Run: sudo systemctl start sshd"
    echo "  3. Test with: ssh deck@${DECK_IP}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Connection test complete${NC}"