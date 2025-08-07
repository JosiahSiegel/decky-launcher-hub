# Launcher Hub - Decky Plugin for Steam Deck

A Decky Loader plugin that manages non-Steam game launchers on Steam Deck, providing an easy way to install and manage Epic Games, GOG Galaxy, Battle.net, and other launchers.

## Features

- 🎮 **Gaming Launchers**: Epic Games, GOG Galaxy, Battle.net, EA App, Ubisoft Connect
- 📺 **Streaming Services**: Netflix, Disney+, Amazon Prime, Hulu, Apple TV+
- 🚀 **One-Click Install**: Easy installation directly from Steam Deck's Quick Access menu
- 📊 **Status Tracking**: See which launchers are installed
- 🔄 **Real-time Progress**: Live installation progress with phase tracking
- 🎯 **Event-driven Architecture**: Robust state management and updates

## Quick Start

### Prerequisites
- Steam Deck with [Decky Loader](https://decky.xyz) installed
- SSH enabled on Steam Deck
- Node.js and npm (for development)

### For Users: Install from Decky Store
*Coming soon - awaiting store approval*

### For Developers: Manual Installation

1. **Clone and Setup**
   ```bash
   git clone https://github.com/josiahsiegel/decky-launcher-hub.git
   cd launcher-hub
   
   # Initial setup
   make setup
   
   # Configure Steam Deck connection
   ./scripts/configure-env.sh
   ```

2. **Build and Deploy**
   ```bash
   # Full workflow: clean, build, deploy
   make all
   
   # Or use VSCode tasks (Ctrl+Shift+P → Run Task)
   # - 🧹 Clean, Build & Deploy
   # - 📦 Build & Deploy
   # - 🚀 Deploy Only
   ```

3. **Complete Installation**
   If sudo password not configured in .env:
   ```bash
   ssh -t deck@YOUR_STEAM_DECK_IP 'sudo ~/launcher-hub-stage/install.sh'
   ```

## Project Structure

```
launcher-hub/
├── dist/                  # Built plugin files
│   └── index.js          # Frontend bundle (IIFE format)
├── src/                  # Source code
│   ├── index.tsx         # Frontend (React/TypeScript)
│   └── backend/
│       └── main.py       # Backend (Python)
├── scripts/              # Development scripts
│   ├── deploy-auto.sh    # Automated deployment
│   ├── configure-env.sh  # Setup wizard
│   └── ...
├── main.py               # Backend entry point
├── plugin.json           # Plugin metadata
├── package.json          # Node dependencies
├── Makefile              # Build automation
└── .env                  # Local configuration
```

## Development

### Setting Up Development Environment

1. **Steam Deck Setup**
   ```bash
   # On Steam Deck (Desktop Mode)
   passwd deck                    # Set password
   sudo systemctl enable sshd     # Enable SSH
   sudo systemctl start sshd      # Start SSH
   
   # Find IP: Settings → Network
   ```

2. **Configure Development Machine**
   ```bash
   # Run setup wizard
   ./scripts/configure-env.sh
   
   # Or manually create .env
   echo "DECK_IP=192.168.1.100" > .env
   echo "DECK_USER=deck" >> .env
   
   # Optional: Add sudo password for automated deployment
   # ⚠️  SECURITY WARNING: Only for development!
   echo "DECK_BECOME_PASSWORD=your_password" >> .env
   ```

3. **Test Connection**
   ```bash
   ./scripts/test-connection.sh
   ```

### VSCode Integration

Press `Ctrl+Shift+P` → "Run Task" for:

- **🧹 Clean, Build & Deploy** - Full development cycle
- **📦 Build & Deploy** - Skip cleaning
- **🚀 Deploy Only** - Deploy existing build
- **📋 View Plugin Logs** - Live log monitoring
- **🔌 Test Connection** - Verify SSH connection
- **⚙️ Configure Steam Deck** - Setup wizard

### Build Commands

```bash
make help        # Show all commands
make setup       # Initial project setup
make clean       # Remove build artifacts
make package     # Build plugin
make deploy      # Deploy to Steam Deck
make all         # Clean, build, and deploy
make verify      # Check project structure
```

### Deployment Options

#### Automated (with sudo password in .env)
```bash
./scripts/deploy-auto.sh
```

#### Staging (manual sudo required)
```bash
./scripts/stage-deploy.sh
# Then on Steam Deck:
sudo ~/launcher-hub-stage/install.sh
```

## Architecture

### Frontend (JavaScript/React)
- **Entry**: `src/index.tsx` → `dist/index.js`
- **Format**: IIFE with `(DFL, SP_REACT)` parameters
- **State**: React hooks (useState, useEffect)
- **Backend Communication**: `serverAPI.callPluginMethod()`

### Backend (Python)
- **Entry**: `main.py`
- **Class**: `Plugin` with `_main()` and `_unload()` methods
- **Methods**: Async functions callable from frontend
- **Logging**: `decky_plugin.logger`

### Plugin Structure Requirements
- Frontend must be IIFE format
- Backend must have `Plugin` class
- Plugin directories are root-owned (by design)
- Hot reload supported for both frontend and backend

## API Reference

### Frontend → Backend Communication
```javascript
// In frontend
const result = await serverAPI.callPluginMethod("method_name", { 
  param1: "value" 
});
```

### Backend Methods
```python
# In main.py
async def get_launchers(self) -> List[Dict[str, Any]]:
    """Returns list of available launchers"""
    
async def install_launcher(self, launcher_id: str) -> Dict[str, Any]:
    """Installs specified launcher"""
    
async def uninstall_launcher(self, launcher_id: str) -> Dict[str, Any]:
    """Removes specified launcher"""
```

## Troubleshooting

### Plugin Not Showing
1. Check Decky Loader is installed and running
2. Verify deployment: `ssh deck@IP "ls ~/homebrew/plugins/launcher-hub"`
3. Check logs: `./scripts/view-logs.sh`

### Frontend Errors
- "DFL is not defined": Decky not properly injected
- "TypeError: map is not a function": Backend returning non-array
- "Unexpected token export": Wrong module format (must be IIFE)

### Deployment Issues
- Permission denied: Plugin dirs are root-owned, use sudo
- Connection refused: Check SSH is enabled on Steam Deck
- No such file: Run `make package` before deploying

### Getting Help
- View logs: `./scripts/view-logs.sh`
- Check backend: `ssh deck@IP "ps aux | grep 'Launcher Hub'"`
- Reload plugin: Changes auto-reload in Steam UI

## Security Notes

⚠️ **Important Security Information:**
- Decky Loader runs as root by design
- Plugin directories are root-owned for security
- Only store sudo passwords in .env for development Steam Decks
- Never commit .env files to version control

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test on Steam Deck
4. Commit: `git commit -am 'Add feature'`
5. Push: `git push origin feature-name`
6. Create Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Decky Loader team for the plugin framework
- Steam Deck community for testing and feedback
- NonSteamLaunchers project for inspiration

## Support

- **Issues**: [GitHub Issues](https://github.com/josiahsiegel/decky-launcher-hub/issues)
- **Discord**: [Decky Loader Discord](https://discord.gg/decky)
- **Documentation**: See CLAUDE.md for detailed technical documentation