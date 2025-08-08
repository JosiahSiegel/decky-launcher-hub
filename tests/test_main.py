"""
Test suite for the Launcher Hub backend implementation.
Can be run with pytest OR with the simple run_tests.py runner.
"""

import asyncio
from unittest.mock import MagicMock, AsyncMock, patch
import sys
from pathlib import Path

# Add the parent directory and backend directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / 'src' / 'backend'))

# Mock decky_plugin before importing main
sys.modules['decky_plugin'] = MagicMock()
sys.modules['decky_plugin'].logger = MagicMock()

# Import the Plugin class
from main import Plugin

# Try to import pytest for advanced features, but don't require it
try:
    import pytest
    HAS_PYTEST = True
except ImportError:
    HAS_PYTEST = False
    # Create a simple decorator that does nothing if pytest isn't available
    class pytest:
        @staticmethod
        def mark(*args, **kwargs):
            def decorator(func):
                return func
            return decorator
        mark.asyncio = lambda f: f


class TestPlugin:
    """Test suite for the Plugin class."""
    
    def test_plugin_init(self):
        """Test plugin initialization."""
        plugin = Plugin()
        assert hasattr(plugin, 'installed_launchers')
        assert hasattr(plugin, 'installing_launchers')
        assert isinstance(plugin.installed_launchers, set)
        assert isinstance(plugin.installing_launchers, dict)
    
    @pytest.mark.asyncio
    async def test_get_launchers(self):
        """Test getting launchers list."""
        plugin = Plugin()
        launchers = await plugin.get_launchers()
        
        # Should return 7 gaming launchers
        assert len(launchers) == 7
        
        # Check structure
        for launcher in launchers:
            assert 'id' in launcher
            assert 'name' in launcher
            assert 'description' in launcher
            assert 'category' in launcher
            assert 'installed' in launcher
            assert launcher['category'] == 'gaming'
            assert launcher['installed'] is False  # Initially not installed
    
    @pytest.mark.asyncio
    async def test_get_services(self):
        """Test getting streaming services."""
        plugin = Plugin()
        services = await plugin.get_services()
        
        # Should return 4 streaming services
        assert len(services) == 4
        
        # Check structure
        for service in services:
            assert 'id' in service
            assert 'name' in service
            assert 'description' in service
            assert 'category' in service
            assert service['category'] == 'streaming'
            assert service['installed'] is False
    
    @pytest.mark.asyncio
    async def test_install_launcher_success(self):
        """Test successful launcher installation."""
        plugin = Plugin()
        
        # Mock the flatpak installation
        with patch('asyncio.create_subprocess_exec') as mock_subprocess:
            mock_process = AsyncMock()
            mock_process.communicate = AsyncMock(return_value=(b'', b''))
            mock_process.returncode = 0
            mock_subprocess.return_value = mock_process
            
            # Install a valid launcher
            result = await plugin.install_launcher('epic')
            assert result['success'] is True
            
            # Should be in installing state
            await asyncio.sleep(0.1)  # Let async task start
            assert 'epic' in plugin.installing_launchers
    
    @pytest.mark.asyncio
    async def test_install_launcher_invalid(self):
        """Test installing invalid launcher."""
        plugin = Plugin()
        
        result = await plugin.install_launcher('invalid_launcher')
        assert result['success'] is False
        assert result['error'] == 'Unknown launcher'
    
    @pytest.mark.asyncio
    async def test_install_launcher_already_installed(self):
        """Test installing already installed launcher."""
        plugin = Plugin()
        plugin.installed_launchers.add('epic')
        
        result = await plugin.install_launcher('epic')
        assert result['success'] is False
        assert result['error'] == 'Already installed'
    
    @pytest.mark.asyncio
    async def test_install_launcher_already_installing(self):
        """Test installing launcher that's already installing."""
        plugin = Plugin()
        plugin.installing_launchers['epic'] = {'progress': 50, 'phase': 'downloading'}
        
        result = await plugin.install_launcher('epic')
        assert result['success'] is True  # Actually returns success but doesn't restart
        # The launcher should still be in installing state
        assert 'epic' in plugin.installing_launchers
    
    @pytest.mark.asyncio
    async def test_uninstall_launcher_success(self):
        """Test successful uninstallation."""
        plugin = Plugin()
        plugin.installed_launchers.add('epic')
        
        # Mock the subprocess call
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(returncode=0, stdout='', stderr='')
            
            result = await plugin.uninstall_launcher('epic')
            assert result['success'] is True
            assert 'epic' not in plugin.installed_launchers
    
    @pytest.mark.asyncio
    async def test_uninstall_launcher_not_installed(self):
        """Test uninstalling not installed launcher."""
        plugin = Plugin()
        
        result = await plugin.uninstall_launcher('epic')
        assert result['success'] is False
        assert result['error'] == 'Not installed'
    
    @pytest.mark.asyncio
    async def test_uninstall_launcher_invalid(self):
        """Test uninstalling invalid launcher."""
        plugin = Plugin()
        
        result = await plugin.uninstall_launcher('invalid')
        assert result['success'] is False
        assert result['error'] == 'Unknown launcher'
    
    @pytest.mark.asyncio
    async def test_get_launchers_with_installed(self):
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
    
    @pytest.mark.asyncio
    async def test_get_launchers_with_installing(self):
        """Test get_launchers shows installing status."""
        plugin = Plugin()
        plugin.installing_launchers['epic'] = {'progress': 50, 'phase': 'downloading'}
        
        launchers = await plugin.get_launchers()
        
        for launcher in launchers:
            if launcher['id'] == 'epic':
                assert launcher.get('installing') is True
                assert launcher['progress'] == 50
                assert launcher['install_phase'] == 'downloading'
    
    @pytest.mark.asyncio
    async def test_simulate_installation(self):
        """Test installation simulation."""
        plugin = Plugin()
        
        with patch('asyncio.sleep', new_callable=AsyncMock):
            await plugin._simulate_installation('epic')
            
            # Should be installed after simulation
            assert 'epic' in plugin.installed_launchers
            assert 'epic' not in plugin.installing_launchers


if __name__ == "__main__":
    if HAS_PYTEST:
        pytest.main([__file__, "-v"])
    else:
        print("Run with: cd tests && python3 run_tests.py")
        print("Or install pytest: pip install pytest pytest-asyncio")