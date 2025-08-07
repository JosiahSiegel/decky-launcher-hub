"""
Launcher Hub - Decky Backend
Complete implementation with launcher management
"""
import decky_plugin
import asyncio
import json
import os
from typing import Dict, List, Any

logger = decky_plugin.logger

# Mock launcher data for testing
AVAILABLE_LAUNCHERS = {
    "epic": {
        "id": "epic",
        "name": "Epic Games",
        "description": "Epic Games Store launcher",
        "category": "gaming",
        "version": "1.0.0"
    },
    "gog": {
        "id": "gog",
        "name": "GOG Galaxy",
        "description": "GOG Galaxy launcher",
        "category": "gaming",
        "version": "2.0.0"
    },
    "origin": {
        "id": "origin",
        "name": "EA Origin",
        "description": "EA Origin launcher",
        "category": "gaming",
        "version": "1.5.0"
    },
    "ubisoft": {
        "id": "ubisoft",
        "name": "Ubisoft Connect",
        "description": "Ubisoft Connect launcher",
        "category": "gaming",
        "version": "1.2.0"
    },
    "netflix": {
        "id": "netflix",
        "name": "Netflix",
        "description": "Netflix streaming service",
        "category": "streaming",
        "version": "1.0.0"
    },
    "disney": {
        "id": "disney",
        "name": "Disney+",
        "description": "Disney+ streaming service",
        "category": "streaming",
        "version": "1.0.0"
    },
    "twitch": {
        "id": "twitch",
        "name": "Twitch",
        "description": "Twitch streaming service",
        "category": "streaming",
        "version": "1.0.0"
    }
}

class Plugin:
    def __init__(self):
        self.installed_launchers = set()
        self.installing_launchers = {}
        
    async def _main(self):
        logger.info("Launcher Hub backend starting...")
        logger.info("Launcher Hub backend ready!")
        
    async def _unload(self):
        logger.info("Launcher Hub backend unloading...")
        
    async def get_launchers(self) -> List[Dict[str, Any]]:
        """Get all gaming launchers with their status"""
        logger.info("get_launchers called")
        
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
                
        logger.info(f"Returning {len(launchers)} launchers")
        return launchers
        
    async def get_services(self) -> List[Dict[str, Any]]:
        """Get all streaming services with their status"""
        logger.info("get_services called")
        
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
        
    async def install_launcher(self, launcher_id: str) -> Dict[str, Any]:
        """Install a launcher (simulated)"""
        logger.info(f"install_launcher called for {launcher_id}")
        
        if launcher_id not in AVAILABLE_LAUNCHERS:
            return {"success": False, "error": "Unknown launcher"}
            
        if launcher_id in self.installed_launchers:
            return {"success": False, "error": "Already installed"}
            
        # Start simulated installation
        asyncio.create_task(self._simulate_installation(launcher_id))
        
        return {"success": True}
        
    async def _simulate_installation(self, launcher_id: str):
        """Simulate installation progress"""
        logger.info(f"Starting simulated installation for {launcher_id}")
        
        self.installing_launchers[launcher_id] = {
            "progress": 0,
            "phase": "Downloading"
        }
        
        # Simulate download phase
        for progress in range(0, 50, 10):
            self.installing_launchers[launcher_id]["progress"] = progress
            await asyncio.sleep(1)
            
        # Simulate installation phase
        self.installing_launchers[launcher_id]["phase"] = "Installing"
        for progress in range(50, 100, 10):
            self.installing_launchers[launcher_id]["progress"] = progress
            await asyncio.sleep(1)
            
        # Mark as installed
        self.installed_launchers.add(launcher_id)
        del self.installing_launchers[launcher_id]
        
        logger.info(f"Installation complete for {launcher_id}")
        
    async def uninstall_launcher(self, launcher_id: str) -> Dict[str, Any]:
        """Uninstall a launcher"""
        logger.info(f"uninstall_launcher called for {launcher_id}")
        
        if launcher_id not in AVAILABLE_LAUNCHERS:
            return {"success": False, "error": "Unknown launcher"}
            
        if launcher_id not in self.installed_launchers:
            return {"success": False, "error": "Not installed"}
            
        # Remove from installed
        self.installed_launchers.discard(launcher_id)
        
        logger.info(f"Uninstalled {launcher_id}")
        return {"success": True}