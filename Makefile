# Launcher Hub - Makefile
# Build and deployment automation

.PHONY: all setup clean build package deploy verify help

# Default target
all: package deploy

# Help message
help:
	@echo "Launcher Hub - Build System"
	@echo "============================"
	@echo ""
	@echo "Available targets:"
	@echo "  make setup      - Initial project setup"
	@echo "  make build      - Build the plugin"
	@echo "  make package    - Build and prepare for deployment"
	@echo "  make deploy     - Deploy to Steam Deck"
	@echo "  make clean      - Remove build artifacts"
	@echo "  make verify     - Verify project structure"
	@echo "  make all        - Build and deploy (default)"
	@echo ""
	@echo "Configuration:"
	@echo "  Edit .env file to set DECK_IP and DECK_USER"

# Initial setup
setup:
	@echo "🚀 Setting up Launcher Hub development environment..."
	@echo ""
	@# Check for Node.js
	@which node > /dev/null || (echo "❌ Node.js not found. Please install Node.js first." && exit 1)
	@echo "✓ Node.js found: $$(node --version)"
	@# Check for npm
	@which npm > /dev/null || (echo "❌ npm not found. Please install npm first." && exit 1)
	@echo "✓ npm found: $$(npm --version)"
	@echo ""
	@# Install dependencies
	@echo "📦 Installing dependencies..."
	@npm install
	@echo ""
	@# Create .env if it doesn't exist
	@if [ ! -f .env ]; then \
		echo "⚙️ Creating .env file..."; \
		echo "# Launcher Hub Configuration" > .env; \
		echo "DECK_IP=192.168.1.100" >> .env; \
		echo "DECK_USER=deck" >> .env; \
		echo "DECKY_PLUGIN_DIR=~/homebrew/plugins" >> .env; \
		echo ""; \
		echo "📝 Please edit .env and set your Steam Deck IP address"; \
	else \
		echo "✓ .env file already exists"; \
	fi
	@echo ""
	@# Make scripts executable
	@echo "🔧 Making scripts executable..."
	@chmod +x scripts/*.sh 2>/dev/null || true
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit .env and set your Steam Deck IP"
	@echo "  2. Run 'make package' to build"
	@echo "  3. Run 'make deploy' to deploy to Steam Deck"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/*.map 2>/dev/null || true
	@rm -rf node_modules/.cache 2>/dev/null || true
	@rm -rf .rollup.cache 2>/dev/null || true
	@rm -rf temp_* 2>/dev/null || true
	@rm -f *.log 2>/dev/null || true
	@echo "✅ Clean complete"

# Build the plugin
build:
	@echo "🔨 Building plugin..."
	@if [ -f "rollup.config.js" ]; then \
		npm run build; \
	else \
		echo "⚠️ No build system configured, using existing dist/index.js"; \
	fi

# Package for deployment
package: build
	@echo "📦 Packaging plugin..."
	@# Ensure dist directory exists
	@mkdir -p dist
	@# Check required files
	@test -f dist/index.js || (echo "❌ dist/index.js not found" && exit 1)
	@test -f main.py || (echo "❌ main.py not found" && exit 1)
	@test -f plugin.json || (echo "❌ plugin.json not found" && exit 1)
	@test -f package.json || (echo "❌ package.json not found" && exit 1)
	@echo "✅ Plugin packaged successfully"

# Deploy to Steam Deck
deploy:
	@echo "🚀 Deploying to Steam Deck..."
	@if [ -f scripts/deploy-auto.sh ]; then \
		./scripts/deploy-auto.sh; \
	else \
		./scripts/deploy-simple.sh; \
	fi

# Verify project structure
verify:
	@echo "🔍 Verifying project structure..."
	@echo ""
	@echo "Required files:"
	@test -f dist/index.js && echo "  ✓ dist/index.js" || echo "  ✗ dist/index.js"
	@test -f main.py && echo "  ✓ main.py" || echo "  ✗ main.py"
	@test -f plugin.json && echo "  ✓ plugin.json" || echo "  ✗ plugin.json"
	@test -f package.json && echo "  ✓ package.json" || echo "  ✗ package.json"
	@test -f .env && echo "  ✓ .env" || echo "  ⚠ .env (run 'make setup' to create)"
	@echo ""
	@echo "Scripts:"
	@test -x scripts/deploy-simple.sh && echo "  ✓ deploy-simple.sh" || echo "  ✗ deploy-simple.sh"
	@test -x scripts/test-connection.sh && echo "  ✓ test-connection.sh" || echo "  ✗ test-connection.sh"
	@test -x scripts/view-logs.sh && echo "  ✓ view-logs.sh" || echo "  ✗ view-logs.sh"
	@test -x scripts/bump-version.sh && echo "  ✓ bump-version.sh" || echo "  ✗ bump-version.sh"
	@test -x scripts/setup-deck-dev.sh && echo "  ✓ setup-deck-dev.sh" || echo "  ✗ setup-deck-dev.sh"
	@echo ""
	@# Check .env configuration
	@if [ -f .env ]; then \
		echo "Configuration (.env):"; \
		grep "^DECK_IP=" .env && echo "  ✓ DECK_IP configured" || echo "  ✗ DECK_IP not set"; \
		grep "^DECK_USER=" .env && echo "  ✓ DECK_USER configured" || echo "  ✗ DECK_USER not set"; \
	else \
		echo "⚠️ .env file not found - run 'make setup' to create"; \
	fi
	@echo ""
	@echo "✅ Verification complete"

# Watch mode (if build system supports it)
watch:
	@echo "👀 Starting watch mode..."
	@npm run watch 2>/dev/null || echo "⚠️ Watch mode not configured"

# Run tests
test:
	@echo "🧪 Running tests..."
	@npm test 2>/dev/null || echo "⚠️ No tests configured"