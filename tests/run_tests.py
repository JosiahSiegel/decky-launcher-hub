#!/usr/bin/env python3
"""
Test runner for the Launcher Hub backend tests.
Runs without requiring pytest installation.
This is the main test runner for Python backend tests.
"""

import sys
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch
from pathlib import Path

# Add parent directory and backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / 'src' / 'backend'))

# Mock decky_plugin module
sys.modules['decky_plugin'] = MagicMock()
sys.modules['decky_plugin'].logger = MagicMock()

# Import the Plugin class
from main import Plugin

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests_run = []
        
    def run_test(self, test_name, test_func):
        """Run a single test and track results."""
        try:
            result = test_func()
            if asyncio.iscoroutine(result):
                asyncio.run(result)
            print(f"✓ {test_name}")
            self.passed += 1
            self.tests_run.append((test_name, True))
        except AssertionError as e:
            print(f"✗ {test_name}: {e}")
            self.failed += 1
            self.tests_run.append((test_name, False))
        except Exception as e:
            print(f"✗ {test_name}: Unexpected error - {e}")
            self.failed += 1
            self.tests_run.append((test_name, False))
    
    def print_summary(self):
        """Print test results summary."""
        print("\n" + "=" * 60)
        print(f"TEST RESULTS: {self.passed} passed, {self.failed} failed")
        print("=" * 60)
        
        if self.failed > 0:
            print("\nFailed tests:")
            for name, passed in self.tests_run:
                if not passed:
                    print(f"  - {name}")

def test_plugin_init():
    """Test plugin initialization."""
    plugin = Plugin()
    assert hasattr(plugin, 'installed_launchers')
    assert hasattr(plugin, 'installing_launchers')
    assert isinstance(plugin.installed_launchers, set)
    assert isinstance(plugin.installing_launchers, dict)
    assert len(plugin.installed_launchers) == 0
    assert len(plugin.installing_launchers) == 0

async def test_get_launchers():
    """Test getting launchers list."""
    plugin = Plugin()
    launchers = await plugin.get_launchers()
    
    # Should return 7 gaming launchers
    assert len(launchers) == 7, f"Expected 7 launchers, got {len(launchers)}"
    
    # Check structure
    for launcher in launchers:
        assert 'id' in launcher
        assert 'name' in launcher
        assert 'description' in launcher
        assert 'category' in launcher
        # 'version' field not required in new implementation
        assert 'installed' in launcher
        assert launcher['category'] == 'gaming'
        assert launcher['installed'] is False

async def test_get_services():
    """Test getting streaming services."""
    plugin = Plugin()
    services = await plugin.get_services()
    
    # Should return 4 streaming services
    assert len(services) == 4, f"Expected 4 services, got {len(services)}"
    
    # Check structure
    for service in services:
        assert 'id' in service
        assert 'name' in service
        assert 'description' in service
        assert 'category' in service
        assert service['category'] == 'streaming'
        assert service['installed'] is False

async def test_install_launcher_success():
    """Test successful launcher installation."""
    plugin = Plugin()
    
    # Mock the subprocess call for flatpak installation
    with patch('asyncio.create_task') as mock_create_task:
        # Just verify the task is created
        result = await plugin.install_launcher('epic')
        assert result['success'] is True
        
        # Verify that the installation task was created
        mock_create_task.assert_called_once()

async def test_install_launcher_invalid():
    """Test installing invalid launcher."""
    plugin = Plugin()
    
    result = await plugin.install_launcher('invalid_launcher')
    assert result['success'] is False
    assert result['error'] == 'Unknown launcher'

async def test_uninstall_launcher_success():
    """Test successful uninstallation."""
    plugin = Plugin()
    plugin.installed_launchers.add('epic')
    
    # Mock the subprocess call for flatpak uninstallation
    with patch('subprocess.run') as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stdout='', stderr='')
        
        result = await plugin.uninstall_launcher('epic')
        assert result['success'] is True
        assert 'epic' not in plugin.installed_launchers

async def test_uninstall_launcher_not_installed():
    """Test uninstalling not installed launcher."""
    plugin = Plugin()
    
    result = await plugin.uninstall_launcher('epic')
    assert result['success'] is False
    assert result['error'] == 'Not installed'

async def test_get_launchers_with_installed():
    """Test get_launchers shows installed status."""
    plugin = Plugin()
    plugin.installed_launchers.add('epic')
    plugin.installed_launchers.add('gog')
    
    launchers = await plugin.get_launchers()
    
    for launcher in launchers:
        if launcher['id'] in ['epic', 'gog']:
            assert launcher['installed'] is True
        else:
            assert launcher['installed'] is False

async def test_get_launchers_with_installing():
    """Test get_launchers shows installing status."""
    plugin = Plugin()
    plugin.installing_launchers['epic'] = {'progress': 50, 'phase': 'downloading'}
    
    launchers = await plugin.get_launchers()
    
    for launcher in launchers:
        if launcher['id'] == 'epic':
            assert launcher.get('installing') is True
            assert launcher['progress'] == 50
            assert launcher['install_phase'] == 'downloading'

async def test_main_lifecycle():
    """Test plugin lifecycle methods."""
    plugin = Plugin()
    
    # Test _main
    await plugin._main()
    # Just check it doesn't raise
    
    # Test _unload
    await plugin._unload()
    # Just check it doesn't raise

def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("RUNNING PYTHON BACKEND TESTS")
    print("=" * 60 + "\n")
    
    runner = TestRunner()
    
    # Run tests
    runner.run_test("test_plugin_init", test_plugin_init)
    runner.run_test("test_get_launchers", test_get_launchers)
    runner.run_test("test_get_services", test_get_services)
    runner.run_test("test_install_launcher_success", test_install_launcher_success)
    runner.run_test("test_install_launcher_invalid", test_install_launcher_invalid)
    runner.run_test("test_uninstall_launcher_success", test_uninstall_launcher_success)
    runner.run_test("test_uninstall_launcher_not_installed", test_uninstall_launcher_not_installed)
    runner.run_test("test_get_launchers_with_installed", test_get_launchers_with_installed)
    runner.run_test("test_get_launchers_with_installing", test_get_launchers_with_installing)
    runner.run_test("test_main_lifecycle", test_main_lifecycle)
    
    runner.print_summary()
    
    return 0 if runner.failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())