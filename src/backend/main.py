"""
Launcher Hub - Decky Backend
Complete implementation with launcher management
"""
import decky_plugin
import asyncio
import json
import os
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

logger = decky_plugin.logger

# Launcher configurations with real paths and detection
AVAILABLE_LAUNCHERS = {
    "epic": {
        "id": "epic",
        "name": "Epic Games",
        "description": "Epic Games Store launcher",
        "category": "gaming",
        "flatpak_id": "com.epicgames.EpicGamesLauncher",
        "executable": "flatpak run com.epicgames.EpicGamesLauncher",
        "icon": "epic-games"
    },
    "gog": {
        "id": "gog",
        "name": "GOG Galaxy",
        "description": "GOG Galaxy launcher for DRM-free games",
        "category": "gaming",
        "flatpak_id": "com.gog.Galaxy",
        "executable": "flatpak run com.gog.Galaxy",
        "icon": "gog-galaxy"
    },
    "heroic": {
        "id": "heroic",
        "name": "Heroic Games",
        "description": "Open-source launcher for Epic and GOG",
        "category": "gaming",
        "flatpak_id": "com.heroicgameslauncher.hgl",
        "executable": "flatpak run com.heroicgameslauncher.hgl",
        "icon": "heroic"
    },
    "lutris": {
        "id": "lutris",
        "name": "Lutris",
        "description": "Universal gaming platform for Linux",
        "category": "gaming",
        "flatpak_id": "net.lutris.Lutris",
        "executable": "flatpak run net.lutris.Lutris",
        "icon": "lutris"
    },
    "bottles": {
        "id": "bottles",
        "name": "Bottles",
        "description": "Windows compatibility layer manager",
        "category": "gaming",
        "flatpak_id": "com.usebottles.bottles",
        "executable": "flatpak run com.usebottles.bottles",
        "icon": "bottles"
    },
    "ubisoft": {
        "id": "ubisoft",
        "name": "Ubisoft Connect",
        "description": "Ubisoft Connect launcher",
        "category": "gaming",
        "flatpak_id": "com.ubisoft.Connect",
        "executable": "flatpak run com.ubisoft.Connect",
        "icon": "ubisoft"
    },
    "minecraft": {
        "id": "minecraft",
        "name": "Minecraft",
        "description": "Minecraft launcher",
        "category": "gaming",
        "flatpak_id": "com.mojang.Minecraft",
        "executable": "flatpak run com.mojang.Minecraft",
        "icon": "minecraft"
    },
    "netflix": {
        "id": "netflix",
        "name": "Netflix",
        "description": "Netflix streaming via browser",
        "category": "streaming",
        "flatpak_id": "com.netflix.Netflix",
        "executable": "flatpak run com.netflix.Netflix",
        "icon": "netflix"
    },
    "disney": {
        "id": "disney",
        "name": "Disney+",
        "description": "Disney+ streaming service",
        "category": "streaming",
        "flatpak_id": "com.disneyplus.DisneyPlus",
        "executable": "flatpak run com.disneyplus.DisneyPlus",
        "icon": "disney-plus"
    },
    "spotify": {
        "id": "spotify",
        "name": "Spotify",
        "description": "Spotify music streaming",
        "category": "streaming",
        "flatpak_id": "com.spotify.Client",
        "executable": "flatpak run com.spotify.Client",
        "icon": "spotify"
    },
    "discord": {
        "id": "discord",
        "name": "Discord",
        "description": "Discord chat and voice",
        "category": "streaming",
        "flatpak_id": "com.discordapp.Discord",
        "executable": "flatpak run com.discordapp.Discord",
        "icon": "discord"
    }
}

class Plugin:
    def __init__(self):
        self.installed_launchers = set()
        self.installing_launchers = {}
        self.flatpak_installed_cache = None
        self.cache_time = 0
        self.cache_duration = 30  # Cache for 30 seconds
        
    async def _main(self):
        logger.info("Launcher Hub backend starting...")
        import sys
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Available methods: {[m for m in dir(self) if not m.startswith('_')]}")
        # Detect initially installed launchers
        await self._detect_installed_launchers()
        logger.info("Launcher Hub backend ready!")
        logger.info("Waiting for frontend to call methods...")
        
    async def _unload(self):
        logger.info("Launcher Hub backend unloading...")
    
    async def test_connection(self) -> str:
        """Simple test method to verify backend is responding"""
        logger.info("test_connection called!")
        logger.info("Called at: " + str(__import__('datetime').datetime.now()))
        return "Backend is working!"
    
    async def log_frontend_error(self, error_data: dict = None, **kwargs) -> dict:
        """Log frontend errors to the backend"""
        # Handle both old dict format and new direct argument format
        if error_data is None and 'error_data' in kwargs:
            error_data = kwargs['error_data']
        logger.error("="*50)
        logger.error("FRONTEND ERROR RECEIVED")
        logger.error(f"Error data: {error_data}")
        logger.error("="*50)
        return {"success": True}
        
    async def _detect_installed_launchers(self):
        """Detect which launchers are currently installed via flatpak"""
        try:
            import time
            current_time = time.time()
            
            # Use cache if it's still valid
            if self.flatpak_installed_cache and (current_time - self.cache_time) < self.cache_duration:
                logger.info(f"Using cached launcher list: {self.flatpak_installed_cache}")
                return self.flatpak_installed_cache
            
            logger.info("Detecting installed flatpaks...")
            
            # Try to use flatpak command with shell to avoid library conflicts
            try:
                # Use shell=True and full path to avoid library conflicts
                result = subprocess.run(
                    "LD_LIBRARY_PATH= /usr/bin/flatpak list --app --columns=application 2>/dev/null",
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0 and result.stdout:
                    installed_apps = result.stdout.strip().split('\n') if result.stdout.strip() else []
                    logger.info(f"Found {len(installed_apps)} installed flatpak apps")
                    self.installed_launchers = set()
                    
                    # Check which of our launchers are installed
                    for launcher_id, launcher_data in AVAILABLE_LAUNCHERS.items():
                        if "flatpak_id" in launcher_data:
                            if launcher_data["flatpak_id"] in installed_apps:
                                self.installed_launchers.add(launcher_id)
                                logger.info(f"Found installed launcher: {launcher_id} ({launcher_data['flatpak_id']})")
                                
                    logger.info(f"Detected installed launchers: {self.installed_launchers}")
                    
                    # Update cache
                    self.flatpak_installed_cache = self.installed_launchers.copy()
                    self.cache_time = current_time
                else:
                    # Fallback: check if flatpak directories exist
                    logger.info("Flatpak command failed, checking directories...")
                    self.installed_launchers = set()
                    
                    flatpak_dirs = [
                        "/var/lib/flatpak/app/",
                        "/home/deck/.local/share/flatpak/app/"
                    ]
                    
                    for launcher_id, launcher_data in AVAILABLE_LAUNCHERS.items():
                        if "flatpak_id" in launcher_data:
                            for flatpak_dir in flatpak_dirs:
                                app_dir = os.path.join(flatpak_dir, launcher_data["flatpak_id"])
                                if os.path.exists(app_dir):
                                    self.installed_launchers.add(launcher_id)
                                    logger.info(f"Found installed launcher (by directory): {launcher_id}")
                                    break
                    
                    logger.info(f"Detected installed launchers (fallback): {self.installed_launchers}")
                    self.flatpak_installed_cache = self.installed_launchers.copy()
                    self.cache_time = current_time
                    
            except subprocess.TimeoutExpired:
                logger.error("Flatpak command timed out")
                logger.info("Continuing without flatpak detection")
            except Exception as e:
                logger.error(f"Error running flatpak command: {e}")
                logger.info("Continuing without flatpak detection")
                
        except Exception as e:
            logger.error(f"Error detecting installed launchers: {e}")
            logger.info("Continuing without flatpak detection")
        
    async def get_launchers(self) -> List[Dict[str, Any]]:
        """Get all gaming launchers with their status"""
        logger.info("="*50)
        logger.info("get_launchers called at: " + str(__import__('datetime').datetime.now()))
        logger.info(f"Available launchers in config: {list(AVAILABLE_LAUNCHERS.keys())}")
        
        # Refresh detection
        await self._detect_installed_launchers()
        
        launchers = []
        for launcher_id, launcher_data in AVAILABLE_LAUNCHERS.items():
            if launcher_data["category"] == "gaming":
                launcher = launcher_data.copy()
                launcher["installed"] = launcher_id in self.installed_launchers
                
                # Check if currently installing
                if launcher_id in self.installing_launchers:
                    launcher["installing"] = True
                    launcher["progress"] = self.installing_launchers[launcher_id]["progress"]
                    launcher["install_phase"] = self.installing_launchers[launcher_id]["phase"]
                    
                launchers.append(launcher)
                logger.info(f"Added launcher: {launcher['name']} (installed: {launcher['installed']})")
                
        logger.info(f"Returning {len(launchers)} launchers: {[l['name'] for l in launchers]}")
        return launchers
        
    async def get_services(self) -> List[Dict[str, Any]]:
        """Get all streaming services with their status"""
        logger.info("="*50)
        logger.info("get_services called at: " + str(__import__('datetime').datetime.now()))
        
        # Refresh detection
        await self._detect_installed_launchers()
        
        services = []
        for launcher_id, launcher_data in AVAILABLE_LAUNCHERS.items():
            if launcher_data["category"] == "streaming":
                service = launcher_data.copy()
                service["installed"] = launcher_id in self.installed_launchers
                
                # Check if currently installing
                if launcher_id in self.installing_launchers:
                    service["installing"] = True
                    service["progress"] = self.installing_launchers[launcher_id]["progress"]
                    service["install_phase"] = self.installing_launchers[launcher_id]["phase"]
                    
                services.append(service)
                
        logger.info(f"Returning {len(services)} services")
        return services
        
    async def install_launcher(self, launcher_id: str = None, **kwargs) -> Dict[str, Any]:
        """Install a launcher via flatpak"""
        # Handle both old dict format and new direct argument format
        if launcher_id is None and 'launcher_id' in kwargs:
            launcher_id = kwargs['launcher_id']
        logger.info(f"install_launcher called for {launcher_id}")
        
        if launcher_id not in AVAILABLE_LAUNCHERS:
            return {"success": False, "error": "Unknown launcher"}
            
        if launcher_id in self.installed_launchers:
            return {"success": False, "error": "Already installed"}
            
        launcher_data = AVAILABLE_LAUNCHERS[launcher_id]
        if "flatpak_id" not in launcher_data:
            return {"success": False, "error": "No flatpak ID configured"}
            
        # Start real installation
        asyncio.create_task(self._install_flatpak(launcher_id, launcher_data["flatpak_id"]))
        
        return {"success": True}
        
    async def _install_flatpak(self, launcher_id: str, flatpak_id: str):
        """Install a flatpak application"""
        logger.info(f"Starting flatpak installation for {launcher_id} ({flatpak_id})")
        
        self.installing_launchers[launcher_id] = {
            "progress": 0,
            "phase": "Preparing"
        }
        
        try:
            # First, try to install from flathub
            self.installing_launchers[launcher_id]["phase"] = "Installing"
            self.installing_launchers[launcher_id]["progress"] = 20
            
            # Run flatpak install command in isolated environment to avoid library conflicts
            # Use env -i to start with clean environment, then set minimal PATH
            cmd = f"env -i PATH=/usr/bin:/bin /usr/bin/flatpak install -y --noninteractive flathub {flatpak_id}"
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={"PATH": "/usr/bin:/bin", "HOME": os.environ.get("HOME", "/home/deck")}
            )
            
            # Monitor installation progress (simplified)
            self.installing_launchers[launcher_id]["progress"] = 50
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                self.installing_launchers[launcher_id]["progress"] = 100
                self.installed_launchers.add(launcher_id)
                logger.info(f"Successfully installed {flatpak_id}")
                
                # Clear cache to force refresh
                self.flatpak_installed_cache = None
            else:
                logger.error(f"Failed to install {flatpak_id}: {stderr.decode()}")
                
        except Exception as e:
            logger.error(f"Error installing {flatpak_id}: {e}")
            
        finally:
            # Remove from installing list
            if launcher_id in self.installing_launchers:
                del self.installing_launchers[launcher_id]
        
    async def uninstall_launcher(self, launcher_id: str = None, **kwargs) -> Dict[str, Any]:
        """Uninstall a launcher via flatpak"""
        # Handle both old dict format and new direct argument format
        if launcher_id is None and 'launcher_id' in kwargs:
            launcher_id = kwargs['launcher_id']
        logger.info(f"uninstall_launcher called for {launcher_id}")
        
        if launcher_id not in AVAILABLE_LAUNCHERS:
            return {"success": False, "error": "Unknown launcher"}
            
        if launcher_id not in self.installed_launchers:
            return {"success": False, "error": "Not installed"}
            
        launcher_data = AVAILABLE_LAUNCHERS[launcher_id]
        if "flatpak_id" not in launcher_data:
            return {"success": False, "error": "No flatpak ID configured"}
            
        try:
            # Run flatpak uninstall command in isolated environment to avoid library conflicts
            # Use env -i to start with clean environment, then set minimal PATH
            cmd = f"env -i PATH=/usr/bin:/bin /usr/bin/flatpak uninstall -y --noninteractive {launcher_data['flatpak_id']}"
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                env={"PATH": "/usr/bin:/bin", "HOME": os.environ.get("HOME", "/home/deck")}
            )
            
            if result.returncode == 0:
                self.installed_launchers.discard(launcher_id)
                # Clear cache to force refresh
                self.flatpak_installed_cache = None
                logger.info(f"Successfully uninstalled {launcher_id}")
                return {"success": True}
            else:
                logger.error(f"Failed to uninstall {launcher_id}: {result.stderr}")
                return {"success": False, "error": f"Uninstall failed: {result.stderr}"}
                
        except Exception as e:
            logger.error(f"Error uninstalling {launcher_id}: {e}")
            return {"success": False, "error": str(e)}
            
    async def launch_launcher(self, launcher_id: str = None, **kwargs) -> Dict[str, Any]:
        """Launch an installed launcher"""
        # Handle both old dict format and new direct argument format
        if launcher_id is None and 'launcher_id' in kwargs:
            launcher_id = kwargs['launcher_id']
        logger.info(f"launch_launcher called for {launcher_id}")
        
        if launcher_id not in AVAILABLE_LAUNCHERS:
            return {"success": False, "error": "Unknown launcher"}
            
        if launcher_id not in self.installed_launchers:
            return {"success": False, "error": "Not installed"}
            
        launcher_data = AVAILABLE_LAUNCHERS[launcher_id]
        
        try:
            # Launch the application in the background
            if "executable" in launcher_data:
                # Use subprocess.Popen to launch without waiting
                subprocess.Popen(
                    launcher_data["executable"].split(),
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
                logger.info(f"Successfully launched {launcher_id}")
                return {"success": True}
            else:
                return {"success": False, "error": "No executable configured"}
                
        except Exception as e:
            logger.error(f"Error launching {launcher_id}: {e}")
            return {"success": False, "error": str(e)}