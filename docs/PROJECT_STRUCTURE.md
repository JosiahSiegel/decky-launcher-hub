# Launcher Hub - Project Structure Documentation

## Directory Overview

```
launcher-hub/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD workflows
│   │   └── test.yml            # Automated testing pipeline
│   └── dependabot.yml          # Dependency update automation
├── .vscode/                    # VSCode workspace settings
│   └── tasks.json              # Development tasks (10 workflows)
├── config/                     # Centralized configuration
│   ├── babel.config.js         # Babel transpiler config
│   ├── eslint.config.js        # ESLint linting rules
│   ├── jest.config.js          # Jest test framework config
│   ├── prettier.config.js      # Code formatting config
│   ├── prettier.ignore         # Files to skip formatting
│   ├── pytest.ini              # Python test config
│   └── requirements-dev.txt    # Python dev dependencies
├── dist/                       # Build output (generated)
│   └── index.js                # Compiled frontend bundle
├── docs/                       # Documentation
│   └── PROJECT_STRUCTURE.md    # This file
├── scripts/                    # Automation scripts
│   ├── bump-version.sh         # Version management
│   ├── configure-env.sh        # Environment setup wizard
│   ├── deploy-auto.sh          # Automated deployment (with sudo)
│   ├── deploy-simple.sh        # Basic deployment
│   ├── setup-deck-dev.sh       # Steam Deck dev setup
│   ├── test-connection.sh      # SSH connection test
│   └── view-logs.sh            # Live log streaming
├── src/                        # Source code
│   ├── backend/                # Python backend
│   │   └── main.py             # Plugin backend implementation
│   ├── components/             # React components
│   │   ├── Content.tsx         # Main content container
│   │   ├── DebugPanel.tsx      # Developer debug panel
│   │   ├── LauncherList.tsx    # Game launcher list UI
│   │   └── ServiceList.tsx     # Streaming service list UI
│   ├── services/               # Service layer
│   │   └── Backend.ts          # Backend API communication
│   ├── types/                  # TypeScript definitions
│   │   └── launcher.ts         # Data type definitions
│   ├── utils/                  # Utility functions
│   │   └── errorHandler.ts     # Global error handling
│   └── index.tsx               # Plugin entry point
├── tests/                      # Test suites
│   ├── __mocks__/              # Jest mock implementations
│   │   ├── decky-frontend-lib.js
│   │   ├── deckyApi.js
│   │   ├── deckyUi.js
│   │   └── fileMock.js
│   ├── frontend/               # Frontend component tests
│   │   └── index.test.jsx      # React component tests
│   ├── integration/            # End-to-end tests
│   │   └── backend_frontend.test.js
│   ├── jest.setup.js           # Jest test setup
│   ├── README.md               # Test documentation
│   ├── run_tests.py            # Python test runner (no deps)
│   └── test_main.py            # Python backend tests
├── .babelrc                    # Babel config proxy → config/
├── .env                        # Local environment variables
├── .env.example                # Environment template
├── .eslintrc.js                # ESLint proxy → config/
├── .gitignore                  # Git ignore patterns
├── .prettierignore             # Prettier ignore patterns
├── .prettierrc.js              # Prettier proxy → config/
├── CLAUDE.md                   # Technical documentation
├── jest.config.js              # Jest proxy → config/
├── LICENSE                     # MIT license
├── Makefile                    # Build automation
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lock file
├── plugin.json                 # Decky plugin metadata
├── pytest.ini                  # Pytest proxy → config/
└── README.md                   # Project documentation
```

## File Purposes

### Root Configuration Files

All root config files are minimal proxies that reference the actual configs in `config/`:

- `.babelrc` → `config/babel.config.js`
- `.eslintrc.js` → `config/eslint.config.js`
- `.prettierrc.js` → `config/prettier.config.js`
- `jest.config.js` → `config/jest.config.js`
- `pytest.ini` → `config/pytest.ini`

This pattern keeps the root clean while tools can still find their configs.

### Required Root Files

These files MUST be in the root for Decky Loader:

- `plugin.json` - Plugin metadata (name, version, author)
- `package.json` - Node.js package definition
- `dist/index.js` - Compiled frontend code

### Source Code Organization

#### Frontend (`src/`)
- **components/** - React UI components, each with single responsibility
- **services/** - API communication layer
- **types/** - TypeScript type definitions
- **utils/** - Shared utility functions
- **index.tsx** - Main entry point

#### Backend (`src/backend/`)
- **main.py** - Python backend implementation

### Scripts

Essential deployment and development scripts:

- **deploy-auto.sh** - Automated deployment with sudo password
- **deploy-simple.sh** - Basic deployment (manual sudo)
- **test-connection.sh** - Verify SSH connection
- **view-logs.sh** - Stream plugin logs
- **configure-env.sh** - Setup wizard
- **bump-version.sh** - Version management

### Testing

Comprehensive test coverage:

- **frontend/** - React component tests (18 tests)
- **integration/** - End-to-end tests (15 tests)
- **test_main.py** - Python backend tests (10 tests)
- **run_tests.py** - Zero-dependency test runner

### CI/CD

- **.github/workflows/test.yml** - Automated testing on push/PR
- **.github/dependabot.yml** - Automated dependency updates

## Development Workflow

### 1. Initial Setup
```bash
make setup
./scripts/configure-env.sh
```

### 2. Development Cycle
```bash
# Edit code
vim src/components/LauncherList.tsx

# Test
make test-all

# Deploy
make deploy
```

### 3. VSCode Integration

Press `Ctrl+Shift+P` → "Run Task":

- **🚀 Full Deploy Pipeline** - Complete workflow
- **⚡ Quick Deploy** - Fast deploy without tests
- **🧪 Test & Fix** - Fix issues and run tests
- **👀 Watch Mode** - Auto-test on changes
- **📋 Live Logs** - Stream from Steam Deck

## Build Process

### Frontend Build
1. TypeScript files in `src/` are compiled
2. Bundle created as ES6 module format
3. Output to `dist/index.js` with `export default`

### Backend Build
1. Python files are syntax-checked
2. No compilation needed (interpreted)
3. Deployed as `main.py` to plugin directory

## Deployment

### File Locations on Steam Deck
```
/home/deck/homebrew/plugins/launcher-hub/
├── dist/
│   └── index.js        # Frontend bundle
├── main.py             # Backend (from src/backend/main.py)
├── plugin.json         # Plugin metadata
└── package.json        # Dependencies
```

### Deployment Methods

1. **Automated** (`deploy-auto.sh`)
   - Uses sudo password from `.env`
   - Fully automated
   - Development only

2. **Simple** (`deploy-simple.sh`)
   - Basic file copy
   - Manual sudo required
   - Production safe

## Testing Strategy

### Test Types
- **Unit Tests** - Individual components/functions
- **Integration Tests** - Frontend-backend communication
- **End-to-end Tests** - Full workflow validation

### Test Execution
```bash
# All tests
make test-all

# Specific suites
npm run test:python      # Python tests
npm run test:frontend    # React tests
npm run test:integration # Integration tests

# No dependencies required
cd tests && python3 run_tests.py
```

## Configuration Management

### Environment Variables (`.env`)
```bash
DECK_IP=192.168.1.100      # Steam Deck IP address
DECK_USER=deck             # SSH username
DECK_BECOME_PASSWORD=***   # Sudo password (dev only)
```

### Plugin Configuration (`plugin.json`)
```json
{
  "name": "Launcher Hub",
  "author": "Launcher Hub Team",
  "version": "1.5.0",
  "main_view_html": "dist/index.js",
  "tile_view_html": "",
  "flags": ["hot_reload", "_debug"]
}
```

## Best Practices

### Code Organization
- One component per file
- Clear separation of concerns
- Types in dedicated files
- Services abstract API calls

### Testing
- Test files adjacent to code
- Mock external dependencies
- Focus on behavior, not implementation
- Maintain >90% coverage

### Documentation
- README for users
- CLAUDE.md for technical details
- Inline comments for complex logic
- JSDoc/docstrings for public APIs

### Version Control
- `.gitignore` excludes build artifacts
- Commit message conventions
- Feature branches for development
- Tags for releases

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check `dist/index.js` exists
   - Verify plugin.json syntax
   - Check backend process: `ps aux | grep launcher`

2. **Tests failing**
   - Run `npm install`
   - Check Python path in tests
   - Verify mock implementations

3. **Deployment errors**
   - Test SSH connection first
   - Check file permissions
   - Verify Decky Loader installed

### Debug Commands
```bash
# Check structure
make verify

# View logs
./scripts/view-logs.sh

# Test connection
./scripts/test-connection.sh

# Clean and rebuild
make clean && make package
```

## Contributing

### Adding a Component
1. Create file in `src/components/`
2. Add TypeScript types in `src/types/`
3. Write tests in `tests/frontend/`
4. Update this documentation

### Adding a Backend Method
1. Add method to `src/backend/main.py`
2. Add frontend call in `src/services/Backend.ts`
3. Write tests in `tests/test_main.py`
4. Test integration in `tests/integration/`

---

*Last Updated: 2024 - Version 1.5.0*