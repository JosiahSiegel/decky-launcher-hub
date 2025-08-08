/**
 * Backend service for communicating with the Python backend
 */

import { cache } from './cache';

export class Backend {
  static serverAPI: any = null;

  static setServer(api: any) {
    this.serverAPI = api;
  }

  static async callMethod(method: string, args: any = {}) {
    if (!this.serverAPI) {
      console.warn('[LauncherHub] Backend not initialized');
      return { result: [] };
    }

    try {
      const result = await this.serverAPI.callPluginMethod(method, args);
      console.log(`[LauncherHub] Backend call ${method}:`, result);
      return result;
    } catch (error) {
      console.error(`[LauncherHub] Backend error for ${method}:`, error);
      throw error;
    }
  }

  static async getLaunchers() {
    // Check cache first
    const cacheKey = 'launchers';
    const cached = cache.get<any[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch from backend
    const response = await this.callMethod('get_launchers');
    const data = response?.result || [];

    // Ensure it's an array
    const safeData = Array.isArray(data) ? data : [];

    // Cache the result
    cache.set(cacheKey, safeData);
    return safeData;
  }

  static async getServices() {
    // Check cache first
    const cacheKey = 'services';
    const cached = cache.get<any[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch from backend
    const response = await this.callMethod('get_services');
    const data = response?.result || [];

    // Ensure it's an array
    const safeData = Array.isArray(data) ? data : [];

    // Cache the result
    cache.set(cacheKey, safeData);
    return safeData;
  }

  static async installLauncher(launcherId: string) {
    const result = await this.callMethod('install_launcher', { launcher_id: launcherId });
    // Clear cache after modification
    cache.clear();
    return result;
  }

  static async uninstallLauncher(launcherId: string) {
    const result = await this.callMethod('uninstall_launcher', { launcher_id: launcherId });
    // Clear cache after modification
    cache.clear();
    return result;
  }

  static async launchLauncher(launcherId: string) {
    const result = await this.callMethod('launch_launcher', { launcher_id: launcherId });
    return result;
  }
}
