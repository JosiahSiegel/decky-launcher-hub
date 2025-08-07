# Decky Plugin Technical Documentation

## Critical Understanding: How This Plugin Works

### The Working Solution (v1.4.1)

After extensive debugging, we've identified the exact structure that works with Decky Loader. This documentation captures all the hard-won knowledge about making Decky plugins work reliably.

## Plugin Architecture

### Browser Contexts and Injection Points

**CRITICAL:** Decky injects into SharedJSContext, NOT QuickAccess!

```
Steam Client Browser Contexts:
├── SharedJSContext (https://steamloopback.host/)
│   ├── DFL (DeckyFrontendLib) injected here
│   ├── SP_REACT injected here
│   └── Plugins execute here
├── QuickAccess_uid2
│   └── UI display only (no Decky objects)
└── MainMenu_uid2
    └── Main menu (no Decky objects)
```

### Module Format Requirements

The plugin MUST be in IIFE format with specific structure:

```javascript
(function(DFL, SP_REACT) {
  var definePlugin = DFL.definePlugin;
  
  // Plugin code here
  
  var index = definePlugin((serverApi) => {
    // Plugin definition
  });
  
  return index;
})(DFL, SP_REACT);
```

**Key Points:**
- IIFE takes `(DFL, SP_REACT)` as parameters
- Must return the result of `definePlugin()` directly
- No module.exports, no ES6 export in the IIFE

## Backend Communication Pattern

### The Working Pattern (serverAPI)

```javascript
class Backend {
  static serverAPI = null;
  
  static setServer(server) { 
    this.serverAPI = server; 
  }
  
  static async callMethod(methodName, args = {}) {
    if (!this.serverAPI) {
      console.error("[Plugin] Backend not initialized");
      return [];
    }
    
    try {
      const result = await this.serverAPI.callPluginMethod(methodName, args);
      
      // Handle different response formats
      if (result && result.success === false) {
        console.error("[Plugin] Backend error:", result.error);
        return [];
      }
      
      // Return result, defaulting to empty array
      return result?.result ?? [];
    } catch (error) {
      console.error("[Plugin] Backend error:", error);
      return [];
    }
  }
}
```

### Python Backend Structure

```python
import decky_plugin

class Plugin:
    def __init__(self):
        self.state = {}
        
    async def _main(self):
        """Called when plugin loads"""
        decky_plugin.logger.info("Plugin starting...")
        
    async def _unload(self):
        """Called when plugin unloads"""
        decky_plugin.logger.info("Plugin unloading...")
        
    async def get_data(self) -> list:
        """Callable from frontend"""
        return [{"id": 1, "name": "Item"}]
    
    async def perform_action(self, param: str) -> dict:
        """Callable from frontend with parameters"""
        return {"success": True, "result": param}
```

## Build System

### Current Build Process

Since we have a working `dist/index.js`, we don't rebuild unless necessary:

```makefile
build:
	@if [ -f "rollup.config.js" ]; then \
		npm run build; \
	else \
		echo "Using existing dist/index.js"; \
	fi
```

### Future Build Setup (When Needed)

```javascript
// rollup.config.js
export default {
  input: './src/index.tsx',
  external: ['react', 'react-dom', '@decky/ui', '@decky/api'],
  output: {
    file: 'dist/index.js',
    globals: {
      react: 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
      '@decky/ui': 'DFL',
      '@decky/api': 'DFL'
    },
    format: 'iife',
    exports: 'default'
  }
};
```

## Deployment Architecture

### Permission Model

**CRITICAL:** Decky Loader runs as root by design!

```
/home/deck/homebrew/plugins/
├── launcher-hub/           (root:root 755)
│   ├── dist/               (root:root 755)
│   │   └── index.js        (root:root 644)
│   ├── main.py            (root:root 644)
│   ├── plugin.json        (root:root 644)
│   └── package.json       (root:root 644)
```

### Deployment Scripts

#### Automated Deployment (deploy-auto.sh)
```bash
# With sudo password in .env
DECK_BECOME_PASSWORD=your_password

# Deploy automatically
./scripts/deploy-auto.sh
```

#### Staging Deployment (stage-deploy.sh)
```bash
# Stage files
./scripts/stage-deploy.sh

# Then on Steam Deck
sudo ~/launcher-hub-stage/install.sh
```

## Remote Debugging

### Enable Chrome DevTools

```bash
# On Steam Deck
touch ~/.steam/steam/.cef-enable-remote-debugging

# Start port forwarding
sudo systemctl start steam-web-debug-portforward.service

# Access from dev machine
http://DECK_IP:8081
```

### Important Debugging Contexts

1. **SharedJSContext** - Where plugins run (DFL/SP_REACT available)
2. **QuickAccess_uid2** - UI display only (no Decky objects)
3. **Console Commands** - Check for `[Decky:Boot]` messages

## Common Issues and Solutions

### Issue: "TypeError: plugin_exports.default is not a function"

**Cause:** Wrong export format
**Solution:** Use IIFE with return statement, not ES6 export

### Issue: "currentItems.map is not a function"

**Cause:** Backend returning non-array
**Solution:** Always return arrays from backend, check with `Array.isArray()`

### Issue: "DFL is not defined"

**Cause:** Trying to access in wrong context or Decky not injected
**Solution:** Check SharedJSContext, verify Decky is running

### Issue: Plugin not showing in menu

**Checklist:**
1. Backend running: `ps aux | grep "Launcher Hub"`
2. Files in place: `ls ~/homebrew/plugins/launcher-hub/`
3. Check logs: `journalctl -u plugin_loader -n 50`
4. Verify format: IIFE with correct structure

### Issue: Permission denied during deployment

**Cause:** Plugin directories are root-owned
**Solution:** Use sudo or staging deployment

## Testing Procedures

### Backend Testing
```bash
# Check process
ssh deck@IP "ps aux | grep -i launcher"

# View logs
ssh deck@IP "journalctl -u plugin_loader -f"

# Kill stuck backend
ssh deck@IP "pkill -f 'launcher-hub/main.py'"
```

### Frontend Testing
```javascript
// In SharedJSContext console
console.log(typeof DFL);  // Should be 'object'
console.log(typeof SP_REACT);  // Should be 'object'

// Check plugin loaded
DFL.PluginController.pluginList
```

## State Management Pattern

### Frontend State
```javascript
function Content() {
  const [state, setState] = SP_REACT.useState({
    items: [],
    loading: false,
    error: null
  });
  
  // Always ensure arrays
  const safeItems = Array.isArray(state.items) ? state.items : [];
  
  return safeItems.map(item => 
    SP_REACT.createElement(Component, { key: item.id }, item.name)
  );
}
```

### Backend State
```python
class Plugin:
    def __init__(self):
        self.cache = {}
        self.tasks = {}
        
    async def get_state(self) -> dict:
        return {
            "cache": self.cache,
            "tasks": list(self.tasks.keys())
        }
```

## Performance Optimization

### Frontend
- Use `SP_REACT.memo()` for expensive components
- Implement debouncing for rapid state changes
- Limit polling intervals (5+ seconds)

### Backend
- Cache expensive operations
- Use `asyncio.create_task()` for background work
- Return immediately with status, poll for results

## Security Considerations

### Root Permissions
- Decky and plugins run as root
- Never execute user input directly
- Validate all file paths
- Use subprocess with shell=False

### Password Storage
- Only store passwords in .env for development
- Never commit .env to version control
- Use environment variables, not hardcoded values

## Build and Release Checklist

### Pre-release
- [ ] Remove debug console.log statements
- [ ] Update version in plugin.json and package.json
- [ ] Test on clean Steam Deck
- [ ] Verify no hardcoded IPs or passwords
- [ ] Update README with any new features

### Release
- [ ] Build with production settings
- [ ] Test deployment scripts
- [ ] Create git tag for version
- [ ] Submit to Decky Plugin Database

## Environment Variables

```bash
# .env file structure
DECK_IP=192.168.1.100
DECK_USER=deck
DECK_BECOME_PASSWORD=password  # Dev only!
PLUGIN_NAME=launcher-hub
```

## VSCode Configuration

### tasks.json
```json
{
  "label": "🧹 Clean, Build & Deploy",
  "command": "make clean && make package && ./scripts/deploy-auto.sh"
}
```

### Recommended Extensions
- ESLint
- Prettier
- Python
- Remote - SSH

## Lessons Learned

### What Works
1. IIFE format with `(DFL, SP_REACT)` parameters
2. `serverAPI.callPluginMethod()` for backend
3. Simple file structure without complex builds
4. Hot reload for rapid development

### What Doesn't Work
1. ES6 modules in production
2. `@decky/api` callable pattern (build issues)
3. Complex TypeScript configurations
4. Assuming array returns from backend

## Quick Reference

### Deploy
```bash
make all  # Clean, build, deploy
```

### Debug
```bash
./scripts/view-logs.sh  # Live logs
./scripts/test-connection.sh  # Test SSH
```

### Fix Common Issues
```bash
# Plugin not loading
ssh deck@IP "sudo systemctl restart plugin_loader"

# Clear cache
ssh deck@IP "rm -rf ~/homebrew/plugins/launcher-hub"
make deploy
```

## Support Resources

- Decky Discord: https://discord.gg/decky
- Plugin Database: https://github.com/SteamDeckHomebrew/decky-plugin-database
- This Documentation: Regular updates based on new findings

---

*Last Updated: After v1.4.1 - Working solution with automated deployment*