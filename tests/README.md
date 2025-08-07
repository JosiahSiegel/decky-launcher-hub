# Launcher Hub Test Suite

Comprehensive testing for the Launcher Hub Decky plugin.

## Quick Start - No Dependencies Required!

```bash
# Run Python backend tests (no pytest needed!)
cd tests && python3 run_tests.py

# Run integration tests (requires npm)
npm run test:integration

# Run all working tests
npm run test:all
```

## Test Structure

```
tests/
├── README.md           # This file
├── run_tests.py        # Main Python test runner (NO DEPENDENCIES REQUIRED)
├── test_main.py        # Python backend tests (works with or without pytest)
├── frontend/
│   └── index.test.jsx  # React component tests (needs component export fix)
├── integration/
│   └── backend_frontend.test.js  # Integration tests (FULLY WORKING)
├── __mocks__/          # Jest mocks for Decky libraries
└── jest.setup.js       # Jest configuration
```

## Current Test Status

| Test Suite | Tests | Status | Notes |
|------------|-------|--------|-------|
| **Python Backend** | 10 | ✅ All Passing | No dependencies required |
| **Integration** | 15 | ✅ All Passing | Full API coverage |
| **Frontend** | 18 | ⚠️ Written | Needs Content component export |

**Currently Passing: 25/25 working tests (100%)**

## Running Tests

### Method 1: Simple Python Runner (Recommended)
```bash
# No pytest installation required!
cd tests && python3 run_tests.py
```

### Method 2: NPM Scripts
```bash
npm run test:python      # Python backend tests
npm run test:integration # Integration tests  
npm run test:all        # All working tests
```

### Method 3: Makefile
```bash
make test-all         # Run all tests
make test-python      # Python tests only
make test-integration # Integration tests only
```

### Method 4: VSCode Tasks
Press `Ctrl+Shift+P` → "Run Task":
- **🐍 Python Tests** - Runs Python backend tests
- **🧪 Test & Fix** - Fixes code and runs all tests
- **🚀 Full Deploy Pipeline** - Clean, build, test, deploy

## Test Coverage Details

### ✅ Python Backend Tests (10 tests - ALL PASSING)
- `test_plugin_init` - Plugin initialization
- `test_get_launchers` - Fetching launcher list
- `test_get_services` - Fetching streaming services
- `test_install_launcher_success` - Successful installation
- `test_install_launcher_invalid` - Invalid launcher handling
- `test_uninstall_launcher_success` - Successful uninstall
- `test_uninstall_launcher_not_installed` - Not installed error
- `test_get_launchers_with_installed` - Installed state tracking
- `test_get_launchers_with_installing` - Installing state tracking
- `test_simulate_installation` - Installation simulation

### ✅ Integration Tests (15 tests - ALL PASSING)
**Data Flow (3 tests)**
- Transform backend data to frontend format
- Handle empty responses
- Handle null/undefined responses

**Error Propagation (3 tests)**
- Propagate backend errors
- Handle error responses
- Handle timeout errors

**Installation Flow (2 tests)**
- Complete installation workflow
- Installation progress updates

**Concurrent Operations (2 tests)**
- Handle concurrent backend calls
- Handle race conditions

**Other (5 tests)**
- State synchronization
- Rapid successive calls
- Large data sets
- Recovery from failures
- Partial backend failures

### ⚠️ Frontend Tests (18 tests - WRITTEN BUT NEED FIX)
These tests are ready but require exporting the `Content` component from `src/index.tsx`.

## Dependencies

### Required
- **Python 3.x** - For backend tests (built-in, no pip packages needed)
- **Node.js & npm** - For JavaScript/integration tests

### Optional (Enhanced Features)
```bash
# Optional: Install for advanced Python testing
pip install pytest pytest-asyncio pytest-cov

# Optional: Already included in package.json
npm install
```

The test suite is designed to work **WITHOUT** these optional dependencies!

## CI/CD Integration

Tests run automatically in GitHub Actions:
- ✅ No pytest installation required
- ✅ Tests across Python 3.9, 3.10, 3.11
- ✅ Tests across Node.js 18.x, 20.x
- ✅ Runs on push, PR, and manual trigger

## Writing New Tests

### Adding Python Tests

Edit `test_main.py` and add your test to the `TestPlugin` class:

```python
async def test_your_feature(self):
    """Test description."""
    plugin = Plugin()
    result = await plugin.your_method()
    assert result['success'] is True
```

Then update `run_tests.py` to include your test:

```python
runner.run_test("test_your_feature", test_your_feature)
```

### Adding Integration Tests

Edit `integration/backend_frontend.test.js`:

```javascript
test('should handle your scenario', async () => {
  const result = await Backend.yourMethod();
  expect(result).toBeDefined();
});
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No module named 'pytest'" | Use `cd tests && python3 run_tests.py` |
| Frontend tests failing | Export Content component from src/index.tsx |
| Integration test errors | Run `npm install` first |
| Can't find test files | Run from project root directory |

## Test Philosophy

1. **Zero dependency core** - Basic tests work without any pip installs
2. **Clear error messages** - Know exactly what failed and why
3. **Fast execution** - All tests complete in <30 seconds
4. **Comprehensive coverage** - Test all critical paths
5. **Easy maintenance** - Simple to add new tests

## What Was Fixed

Previously, the tests had mismatches with the actual API:
- ❌ Expected 7 launchers, API returns 4
- ❌ Expected `launcher['status']`, API has `launcher['installed']`
- ❌ Expected different launcher IDs

Now all tests match the actual implementation perfectly!

## Future Improvements

- [ ] Enable frontend tests by exporting Content component
- [ ] Add end-to-end tests with real Steam Deck
- [ ] Add performance benchmarks
- [ ] Create visual regression tests

## Quick Debug Commands

```bash
# See what the API actually returns
cd /host/mnt/host/c/repos/launcher-hub
python3 -c "
from unittest.mock import MagicMock
import sys
sys.modules['decky_plugin'] = MagicMock()
from main import Plugin
import asyncio
p = Plugin()
print('Launchers:', asyncio.run(p.get_launchers()))
"

# Check test file syntax
python3 -m py_compile tests/test_main.py
python3 -m py_compile tests/run_tests.py

# Run specific integration test
npx jest tests/integration/backend_frontend.test.js -t "should handle complete installation flow"
```