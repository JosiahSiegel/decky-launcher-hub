/**
 * Backend service for communicating with the Python backend
 */

import { call } from '@decky/api';
import { cache } from './cache';

export class Backend {
  static serverAPI: any = null;

  static setServer(api: any) {
    this.serverAPI = api;
  }

  static async callMethod(method: string, ...args: any[]) {
    console.log(`[LauncherHub] Attempting to call backend method: ${method}`);
    console.log(`[LauncherHub] Args:`, args);

    try {
      // Use the new @decky/api call function
      const result = await call(method, ...args);
      console.log(`[LauncherHub] Backend call ${method} succeeded:`, result);
      return { result: result || [] };
    } catch (error) {
      console.error(`[LauncherHub] Backend error for ${method}:`, error);
      return { result: [] };
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
    const result = await this.callMethod('install_launcher', launcherId);
    // Clear cache after modification
    cache.clear();
    return result;
  }

  static async uninstallLauncher(launcherId: string) {
    const result = await this.callMethod('uninstall_launcher', launcherId);
    // Clear cache after modification
    cache.clear();
    return result;
  }

  static async launchLauncher(launcherId: string) {
    const result = await this.callMethod('launch_launcher', launcherId);
    return result;
  }
}
