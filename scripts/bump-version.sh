#!/bin/bash

# Bump version in plugin files
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Bump Version${NC}"
echo "================"

# Get new version from argument or prompt
NEW_VERSION="${1:-}"
if [ -z "$NEW_VERSION" ]; then
    read -p "Enter new version (e.g., 1.4.1): " NEW_VERSION
fi

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}No version provided${NC}"
    exit 1
fi

# Validate version format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Invalid version format. Use X.Y.Z (e.g., 1.4.1)${NC}"
    exit 1
fi

echo "Updating to version: ${NEW_VERSION}"
echo ""

# Update package.json
echo -n "Updating package.json... "
if [ -f package.json ]; then
    sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"${NEW_VERSION}\"/" package.json && rm package.json.bak
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Not found${NC}"
fi

# Update plugin.json
echo -n "Updating plugin.json... "
if [ -f plugin.json ]; then
    sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"${NEW_VERSION}\"/" plugin.json && rm plugin.json.bak
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ Not found${NC}"
fi

# Update version in dist/index.js if it has a version string
echo -n "Updating dist/index.js... "
if [ -f dist/index.js ]; then
    if grep -q "Plugin v[0-9]" dist/index.js; then
        sed -i.bak "s/Plugin v[0-9]\+\.[0-9]\+\.[0-9]\+/Plugin v${NEW_VERSION}/" dist/index.js && rm dist/index.js.bak
        echo -e "${GREEN}✓${NC}"
    else
        echo "no version string found"
    fi
else
    echo -e "${YELLOW}⚠ Not found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Version updated to ${NEW_VERSION}${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the changes"
echo "  2. Commit: git add -A && git commit -m \"Bump version to ${NEW_VERSION}\""
echo "  3. Tag: git tag v${NEW_VERSION}"
echo "  4. Push: git push && git push --tags"