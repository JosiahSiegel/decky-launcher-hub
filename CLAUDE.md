# Launcher Hub - Decky Plugin Technical Documentation

## ⚠️ CRITICAL: ES6 Modules are the Future (DO NOT USE IIFE)

**As of 2025, Decky has migrated to a new architecture:**
- ✅ **USE**: ES6 modules with `export default`
- ✅ **USE**: `@decky/api` and `@decky/ui` packages
- ❌ **DEPRECATED**: IIFE format (legacy, being phased out)
- ❌ **DEPRECATED**: `decky-frontend-lib` (replaced by @decky packages)

**Migration Status:**
- Decky 3.0+ requires the new API
- Official template uses `@decky/rollup` v1.0.1, `@decky/api` v1.1.2, `@decky/ui` v4.7.2
- 75% of installed plugins (6/8) already use ES6 export format
- IIFE only works temporarily due to backward compatibility

## Project Structure (v1.5.0)

```
launcher-hub/
├── src/                        # Source code
│   ├── index.tsx              # Main plugin entry point
│   ├── components/            # React components
│   │   ├── Content.tsx        # Main content component
│   │   ├── LauncherList.tsx  # Launcher management UI
│   │   ├── ServiceList.tsx   # Service management UI
│   │   └── DebugPanel.tsx    # Debug/developer panel
│   ├── services/              # Service layer
│   │   └── Backend.ts         # Backend API communication
│   ├── types/                 # TypeScript definitions
│   │   └── launcher.ts        # Launcher/Service types
│   ├── utils/                 # Utility functions
│   │   └── errorHandler.ts    # Global error handling
│   └── backend/               # Python backend
│       └── main.py            # Main backend implementation
├── tests/                      # Test suites
│   ├── frontend/              # Frontend tests
│   ├── integration/           # Integration tests
│   ├── __mocks__/             # Jest mocks
│   ├── test_main.py           # Python tests
│   └── run_tests.py           # Python test runner
├── config/                     # Configuration files
│   ├── jest.config.js         # Jest configuration
│   ├── eslint.config.js       # ESLint configuration
│   ├── prettier.config.js     # Prettier configuration
│   └── pytest.ini             # Pytest configuration
├── scripts/                    # Deployment & utility scripts
│   ├── deploy-auto.sh         # Automated deployment
│   ├── deploy-simple.sh       # Simple deployment
│   └── test-connection.sh     # Test Deck connection
├── docs/                       # Documentation
│   └── PROJECT_STRUCTURE.md   # Detailed structure docs
├── dist/                       # Build output
│   └── index.js               # Compiled frontend
├── plugin.json                 # Plugin metadata
├── package.json                # Node dependencies
├── Makefile                    # Build automation
└── README.md                   # User documentation
```

## Critical Understanding: How This Plugin Works

### The Working Solution (v1.5.0)

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

### Module Format Requirements (2025 Final Verdict)

**IMPORTANT UPDATE:** After thorough investigation, ES6 modules ARE the standard. Our "Unexpected token 'export'" error was due to incorrect build configuration, NOT a Decky limitation.

**The Truth About Module Formats:**
- **ES6 is the standard** - 75% of plugins use it successfully
- **Our error was a false signal** - We had build/configuration issues
- **IIFE is legacy** - Only 2/8 plugins still use it (including ours temporarily)
- **Migration is required** - Decky 3.0+ uses new @decky/api architecture

**Modern Development Format (REQUIRED for new plugins):**
```typescript
import { definePlugin } from '@decky/api';
import { staticClasses } from '@decky/ui';
import React from 'react';
import { FaRocket } from 'react-icons/fa';

const plugin = definePlugin((serverApi) => {
  return {
    title: <div className={staticClasses.Title}>Plugin Name</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaRocket />,
    onDismount() {
      console.log('Plugin unmounted');
    }
  };
});

export default plugin;
```

**Required Production Format (dist/index.js) - IIFE Only:**
```javascript
(function(DFL, SP_REACT) {
  // Access Decky globals
  const { definePlugin, staticClasses, PanelSection, PanelSectionRow, ButtonItem } = DFL || {};
  const React = SP_REACT || {};
  const { useState, useEffect, useCallback } = React;
  
  // Plugin code here
  
  return definePlugin((serverApi) => {
    return {
      title: React.createElement('div', { className: staticClasses.Title }, 'Plugin Name'),
      content: React.createElement(Content, { serverAPI: serverApi }),
      icon: React.createElement('div', null, '🚀'),
      onDismount() {
        console.log('Plugin unmounted');
      }
    };
  });
})(window.DFL, window.SP_REACT);
```

**Key Points:**
- Development: Use modern ES6/TypeScript with imports
- Production: Must be IIFE without any import/export statements
- Browser cannot handle ES6 modules directly
- Build process must transform to IIFE format

## Backend Communication Pattern

### The Working Pattern (serverAPI)

**Location:** `src/services/Backend.ts`

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

**Location:** `src/backend/main.py`

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

### Build Setup (Rollup Configuration)

```javascript
// rollup.config.js
export default {
  input: './src/index.tsx',
  external: ['react', 'react-dom', 'decky-frontend-lib'],
  output: {
    file: 'dist/index.js',
    format: 'es',  // ES6 modules, NOT IIFE!
    sourcemap: true
  },
  plugins: [
    typescript(),
    resolve(),
    commonjs()
  ]
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

## AI Self-Sufficient Debug Cycle (2025)

### Complete Debug Workflow for Autonomous Testing

This debug cycle allows AI agents to independently verify plugin deployment and identify issues without human intervention.

#### Step 1: Build and Deploy
```bash
# Build with ES6 format using @decky/rollup
npm run build

# Deploy to Steam Deck
make deploy
```

#### Step 2: Parallel Log Monitoring (Critical for AI)

Run these commands simultaneously to get complete diagnostic information:

```bash
# 1. Check CEF/Browser logs for JavaScript errors
ssh deck@$DECK_IP "tail -50 /home/deck/.local/share/Steam/logs/cef_log.txt | grep -i 'launcher\|export\|error\|syntax'"

# 2. Check plugin loader logs for backend status
ssh deck@$DECK_IP "journalctl -u plugin_loader --no-hostname --since '1 minute ago' | grep -i launcher"

# 3. Verify backend process is running
ssh deck@$DECK_IP "ps aux | grep -i 'launcher.*hub' | grep -v grep"

# 4. Check file structure integrity
ssh deck@$DECK_IP "ls -la /home/deck/homebrew/plugins/launcher-hub/"
```

#### Step 3: Error Pattern Recognition

**Success Indicators:**
- ✅ No "Unexpected token 'export'" errors in CEF logs
- ✅ "Loaded Launcher Hub" in plugin_loader logs
- ✅ Backend process running with PID
- ✅ All files present (dist/index.js, main.py, plugin.json)

**Failure Patterns:**
- ❌ "SyntaxError: Unexpected token 'export'" → Module format issue
- ❌ "TypeError: plugin_exports.default is not a function" → Wrong export format
- ❌ "Cannot find module '@decky/api'" → Missing dependencies
- ❌ No backend process → Python backend failed to start

#### Step 4: Automated Diagnosis

```bash
# One-liner diagnostic command for AI
ssh deck@$DECK_IP "echo '=== CEF ERRORS ===' && tail -20 /home/deck/.local/share/Steam/logs/cef_log.txt | grep -i error | tail -5 && echo '=== PLUGIN STATUS ===' && journalctl -u plugin_loader --no-hostname --since '30 seconds ago' | grep -i launcher | tail -5 && echo '=== BACKEND PROCESS ===' && ps aux | grep -i 'launcher.*hub' | grep -v grep | wc -l"
```

Expected output for success:
```
=== CEF ERRORS ===
(no launcher-related errors)
=== PLUGIN STATUS ===
Loaded Launcher Hub
Launcher Hub backend ready!
=== BACKEND PROCESS ===
1
```

#### Step 5: Recovery Actions

If errors detected, apply these fixes in order:

1. **Module Format Error**: 
   - Check dist/index.js ends with `export { index as default };`
   - Ensure no IIFE wrapper present
   
2. **Backend Not Running**:
   ```bash
   ssh deck@$DECK_IP "sudo systemctl restart plugin_loader"
   ```

3. **Cache Issues**:
   ```bash
   ssh deck@$DECK_IP "rm -rf /home/deck/homebrew/plugins/launcher-hub && sleep 2"
   make deploy
   ```

### Remote Debugging (Manual)

#### Enable Chrome DevTools

```bash
# On Steam Deck
touch ~/.steam/steam/.cef-enable-remote-debugging

# Start port forwarding
sudo systemctl start steam-web-debug-portforward.service

# Access from dev machine
http://DECK_IP:8081
```

#### Important Debugging Contexts

1. **SharedJSContext** - Where plugins run (DFL/SP_REACT available)
2. **QuickAccess_uid2** - UI display only (no Decky objects)
3. **Console Commands** - Check for `[Decky:Boot]` messages

## Common Issues and Solutions

### Issue: "TypeError: plugin_exports.default is not a function"

**Cause:** Wrong export format  
**Solution:** Use ES6 `export default` from definePlugin()

### Issue: "currentItems.map is not a function"

**Cause:** Backend returning non-array
**Solution:** Always return arrays from backend, check with `Array.isArray()`

### Issue: "DFL is not defined"

**Cause:** Trying to access in wrong context or Decky not injected
**Solution:** Check SharedJSContext, verify Decky is running

### Issue: "SyntaxError: Cannot use import statement outside a module"

**Cause:** Using ES6 import/export in browser
**Solution:** Deploy as IIFE without any import/export statements

### Issue: "Unexpected token export"

**Cause:** Using ES6 export in browser context
**Solution:** Use IIFE format without export statements

### Issue: Plugin not showing in menu

**Checklist:**
1. Backend running: `ps aux | grep "Launcher Hub"`
2. Files in place: `ls ~/homebrew/plugins/launcher-hub/`
3. Check logs: `journalctl -u plugin_loader -n 50`
4. Verify format: ES6 module with export default

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

### 2025 Definitive Answer: ES6 Modules are Standard

**CONFIRMED:** After investigating installed plugins and official documentation (August 2025):
- **6 out of 8 plugins use ES6 export** (75% adoption)
- **Official Decky template uses ES6** with @decky packages
- **IIFE is deprecated** and only works for backward compatibility
- **Migration to @decky/api is mandatory** for Decky 3.0+

#### Plugins Using ES6 Export (Working):
- `decky-steamgriddb` - ES6 export with `@decky/api`
- `decky-wifi-locker` - ES6 export with `@decky/api`
- `decky-wine-cellar` - ES6 export
- `decky-pip` - ES6 export
- `moondeck` - ES6 export
- `homebrew` (Decky's own store) - ES6 export

#### Plugins Using IIFE:
- `launcher-hub` (ours) - IIFE (after fixing export errors)
- `decky-autoflatpaks` - IIFE

### The Real Issue: Build Configuration

The problem isn't ES6 vs IIFE - it's **how the ES6 module is built**:

1. **Modern plugins use `@decky/api`** which handles the module loading:
```javascript
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
api = internalAPIConnection.connect(API_VERSION, manifest.name);
```

2. **They still export as ES6** at the end:
```javascript
export { index as default };
```

3. **But they don't use import statements** - everything is accessed from window globals

### What You MUST Use (2025 Forward)
1. **ES6 export** (`export default`) - This is the ONLY supported format going forward
2. **@decky/api** for plugin definition and API access
3. **@decky/ui** for UI components (replaces decky-frontend-lib)
4. **@decky/rollup** for building
5. **No raw imports** - Bundle properly, access globals via window

### What is DEPRECATED (Do Not Use)
1. **IIFE format** - Legacy, only backward compatible
2. **decky-frontend-lib** - Replaced by @decky packages
3. **Manual ServerAPI** - Use @decky/api instead
4. **Mixed module formats** - Stick to ES6 only

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

### Official Resources
- **Decky Plugin Template**: https://github.com/SteamDeckHomebrew/decky-plugin-template
- **Decky Loader**: https://github.com/SteamDeckHomebrew/decky-loader
- **Plugin Database**: https://github.com/SteamDeckHomebrew/decky-plugin-database
- **Decky Discord**: https://discord.gg/decky
- **Alternative Template (QuickStart)**: https://github.com/Tormak9970/Decky-QuickStart

### Key NPM Packages
- `@decky/rollup` - Official Rollup configuration for Decky plugins
- `@decky/api` - Modern API for connecting to Decky Loader
- `@decky/ui` - UI components (replaces decky-frontend-lib)

### Critical Gotchas (2025) - THE EXPORT ERROR SOLUTION

#### The "Unexpected token 'export'" Mystery SOLVED

**THE PROBLEM:** Despite 6/8 plugins using ES6 export successfully, some deployments get "Unexpected token 'export'" errors.

**THE CONFUSION:** 
- @decky/rollup outputs ES6 format with `export { index as default };`
- Other working plugins (steamgriddb, moondeck, etc.) use identical ES6 export
- But sometimes it fails with export error

**THE ACTUAL ISSUE:**
The error occurs when SP_REACT and DFL globals are not available when the plugin loads. @decky/rollup uses `externalGlobals` plugin that replaces imports with direct global references (SP_REACT, DFL) but doesn't define them.

**THE DEFINITIVE SOLUTION:**

Despite @decky/rollup outputting ES6 format, Decky Loader (as of 2025) still requires IIFE format. The solution is to post-process the build output.

**Automated Solution (Implemented):**
```bash
# Build outputs ES6, then post-build.sh wraps in IIFE
npm run build  # Now includes post-processing
```

**Manual Fix - Wrap in IIFE exactly like working plugins:**
```javascript
(function(DFL, SP_REACT) {
'use strict';
// ... entire plugin code (remove ES6 export line) ...
return index;
})(DFL, SP_REACT);  // Note: DFL first, then SP_REACT
```

**Critical Details:**
- Order matters: `(DFL, SP_REACT)` not `(SP_REACT, DFL)`
- Pass globals directly: `(DFL, SP_REACT)` not `(window.DFL, window.SP_REACT)`
- Remove the ES6 export line: `export { index as default };`
- Add `'use strict';` at the start
- Return the index at the end

**WHY OTHER PLUGINS WORK:**
They rely on Decky Loader injecting SP_REACT and DFL as globals BEFORE the plugin loads. If timing is off or injection fails, the plugin crashes with "export" error (misleading error message).

**KEY INSIGHTS:**
1. The "export" error is misleading - real issue is undefined SP_REACT/DFL
2. @decky/rollup v1.0.1 forces ES6 output (can't override to IIFE)
3. ES6 export IS correct - just needs globals defined
4. Version mismatch: API version 2 vs version 1 compatibility
5. Migration to @decky/api is still required for future compatibility

---

*Last Updated: v1.5.1 (August 2025) - DEFINITIVE: ES6 modules are the standard. IIFE is deprecated. Migrate to @decky/api ASAP.*