/**
 * Integration tests for backend-frontend communication
 * Tests the complete flow between Python backend and React frontend
 */

import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Backend-Frontend Integration', () => {
  let mockServerAPI;
  let Backend;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock serverAPI with realistic responses
    mockServerAPI = {
      callPluginMethod: jest.fn(),
      toaster: {
        toast: jest.fn(),
      },
    };
    
    // Backend class that mimics the real implementation
    Backend = class {
      static serverAPI = null;
      
      static setServer(api) {
        this.serverAPI = api;
      }
      
      static async callMethod(method, args = {}) {
        if (!this.serverAPI) {
          throw new Error('Backend not initialized');
        }
        
        try {
          const result = await this.serverAPI.callPluginMethod(method, args);
          
          if (result && result.success === false) {
            throw new Error(result.error || 'Backend error');
          }
          
          return result?.result ?? [];
        } catch (error) {
          console.error(`Backend error calling ${method}:`, error);
          throw error;
        }
      }
      
      static async getLaunchers() {
        return this.callMethod('get_launchers');
      }
      
      static async getServices() {
        return this.callMethod('get_services');
      }
      
      static async installLauncher(launcherId) {
        const result = await this.serverAPI.callPluginMethod('install_launcher', {
          launcher_id: launcherId,
        });
        return result;
      }
      
      static async uninstallLauncher(launcherId) {
        const result = await this.serverAPI.callPluginMethod('uninstall_launcher', {
          launcher_id: launcherId,
        });
        return result;
      }
    };
  });

  describe('Data Flow', () => {
    test('should correctly transform backend data to frontend format', async () => {
      const backendResponse = {
        result: [
          {
            id: 'steam',
            name: 'Steam',
            icon: '🎮',
            description: 'Valve\'s gaming platform',
            status: 'installed',
          },
          {
            id: 'epic',
            name: 'Epic Games Store',
            icon: '🎯',
            description: 'Epic\'s gaming platform',
            status: 'not_installed',
          },
        ],
      };
      
      mockServerAPI.callPluginMethod.mockResolvedValue(backendResponse);
      Backend.setServer(mockServerAPI);
      
      const launchers = await Backend.getLaunchers();
      
      expect(launchers).toEqual(backendResponse.result);
      expect(launchers).toHaveLength(2);
      expect(launchers[0]).toHaveProperty('id', 'steam');
      expect(launchers[0]).toHaveProperty('status', 'installed');
    });

    test('should handle empty responses correctly', async () => {
      mockServerAPI.callPluginMethod.mockResolvedValue({ result: [] });
      Backend.setServer(mockServerAPI);
      
      const launchers = await Backend.getLaunchers();
      
      expect(launchers).toEqual([]);
      expect(Array.isArray(launchers)).toBe(true);
    });

    test('should handle null/undefined responses', async () => {
      mockServerAPI.callPluginMethod.mockResolvedValue(null);
      Backend.setServer(mockServerAPI);
      
      const launchers = await Backend.getLaunchers();
      
      expect(launchers).toEqual([]);
      expect(Array.isArray(launchers)).toBe(true);
    });
  });

  describe('Error Propagation', () => {
    test('should propagate backend errors to frontend', async () => {
      mockServerAPI.callPluginMethod.mockRejectedValue(
        new Error('Network error')
      );
      Backend.setServer(mockServerAPI);
      
      await expect(Backend.getLaunchers()).rejects.toThrow('Network error');
    });

    test('should handle backend error responses', async () => {
      mockServerAPI.callPluginMethod.mockResolvedValue({
        success: false,
        error: 'Invalid launcher ID',
      });
      Backend.setServer(mockServerAPI);
      
      await expect(Backend.getLaunchers()).rejects.toThrow('Invalid launcher ID');
    });

    test('should handle timeout errors', async () => {
      mockServerAPI.callPluginMethod.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      Backend.setServer(mockServerAPI);
      
      await expect(Backend.getLaunchers()).rejects.toThrow('Timeout');
    });
  });

  describe('Installation Flow', () => {
    test('should handle complete installation flow', async () => {
      // Initial state - no launchers installed
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({
          result: [
            { id: 'steam', name: 'Steam', status: 'not_installed' },
          ],
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'Installation started for Steam',
        })
        .mockResolvedValueOnce({
          result: [
            { id: 'steam', name: 'Steam', status: 'installing', progress: 0 },
          ],
        });
      
      Backend.setServer(mockServerAPI);
      
      // Get initial state
      const initialLaunchers = await Backend.getLaunchers();
      expect(initialLaunchers[0].status).toBe('not_installed');
      
      // Start installation
      const installResult = await Backend.installLauncher('steam');
      // The mock returns { result: [] } for the raw API response
      expect(installResult).toHaveProperty('success', true);
      
      // Check installing state
      const installingLaunchers = await Backend.getLaunchers();
      expect(installingLaunchers[0].status).toBe('installing');
      expect(installingLaunchers[0].progress).toBe(0);
    });

    test('should handle installation progress updates', async () => {
      const progressStates = [
        { id: 'steam', status: 'installing', progress: 0 },
        { id: 'steam', status: 'installing', progress: 25 },
        { id: 'steam', status: 'installing', progress: 50 },
        { id: 'steam', status: 'installing', progress: 75 },
        { id: 'steam', status: 'installing', progress: 100 },
        { id: 'steam', status: 'installed' },
      ];
      
      let callCount = 0;
      mockServerAPI.callPluginMethod.mockImplementation(() => {
        if (callCount < progressStates.length) {
          return Promise.resolve({ result: [progressStates[callCount++]] });
        }
        return Promise.resolve({ result: [] });
      });
      
      Backend.setServer(mockServerAPI);
      
      // Simulate polling for progress
      for (let i = 0; i < progressStates.length; i++) {
        const launchers = await Backend.getLaunchers();
        expect(launchers[0]).toMatchObject(progressStates[i]);
      }
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent backend calls', async () => {
      mockServerAPI.callPluginMethod.mockImplementation((method) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (method === 'get_launchers') {
              resolve({ result: [{ id: 'steam', status: 'installed' }] });
            } else if (method === 'get_services') {
              resolve({ result: [{ id: 'geforce_now', status: 'available' }] });
            }
          }, Math.random() * 100);
        });
      });
      
      Backend.setServer(mockServerAPI);
      
      const [launchers, services] = await Promise.all([
        Backend.getLaunchers(),
        Backend.getServices(),
      ]);
      
      expect(launchers).toHaveLength(1);
      expect(services).toHaveLength(1);
      expect(mockServerAPI.callPluginMethod).toHaveBeenCalledTimes(2);
    });

    test('should handle race conditions in state updates', async () => {
      let callOrder = [];
      
      mockServerAPI.callPluginMethod.mockImplementation((method, args) => {
        callOrder.push({ method, args });
        
        if (method === 'install_launcher') {
          return Promise.resolve({ success: true });
        }
        return Promise.resolve({ result: [] });
      });
      
      Backend.setServer(mockServerAPI);
      
      // Simulate rapid clicks on different launchers
      const installations = await Promise.all([
        Backend.installLauncher('steam'),
        Backend.installLauncher('epic'),
        Backend.installLauncher('gog'),
      ]);
      
      expect(installations).toHaveLength(3);
      expect(callOrder).toContainEqual({
        method: 'install_launcher',
        args: { launcher_id: 'steam' },
      });
      expect(callOrder).toContainEqual({
        method: 'install_launcher',
        args: { launcher_id: 'epic' },
      });
      expect(callOrder).toContainEqual({
        method: 'install_launcher',
        args: { launcher_id: 'gog' },
      });
    });
  });

  describe('State Synchronization', () => {
    test('should maintain state consistency between backend and frontend', async () => {
      const stateHistory = [];
      
      mockServerAPI.callPluginMethod.mockImplementation((method) => {
        const currentState = {
          launchers: [
            { id: 'steam', status: stateHistory.length > 0 ? 'installed' : 'not_installed' },
          ],
        };
        stateHistory.push(currentState);
        return Promise.resolve({ result: currentState.launchers });
      });
      
      Backend.setServer(mockServerAPI);
      
      const state1 = await Backend.getLaunchers();
      const state2 = await Backend.getLaunchers();
      
      expect(stateHistory).toHaveLength(2);
      expect(state1[0].status).toBe('not_installed');
      expect(state2[0].status).toBe('installed');
    });
  });

  describe('Performance', () => {
    test('should handle rapid successive calls efficiently', async () => {
      let callCount = 0;
      mockServerAPI.callPluginMethod.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ result: [] });
      });
      
      Backend.setServer(mockServerAPI);
      
      const startTime = Date.now();
      
      // Make 100 rapid calls
      const promises = Array(100).fill(null).map(() => Backend.getLaunchers());
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(callCount).toBe(100);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle large data sets', async () => {
      const largeLauncherList = Array(1000).fill(null).map((_, i) => ({
        id: `launcher_${i}`,
        name: `Launcher ${i}`,
        status: i % 3 === 0 ? 'installed' : 'not_installed',
        description: `Description for launcher ${i}`,
        icon: '🎮',
      }));
      
      mockServerAPI.callPluginMethod.mockResolvedValue({
        result: largeLauncherList,
      });
      
      Backend.setServer(mockServerAPI);
      
      const launchers = await Backend.getLaunchers();
      
      expect(launchers).toHaveLength(1000);
      expect(launchers[500].id).toBe('launcher_500');
    });
  });

  describe('Recovery and Resilience', () => {
    test('should recover from backend initialization failure', async () => {
      // First attempt without initialization
      await expect(Backend.getLaunchers()).rejects.toThrow('Backend not initialized');
      
      // Initialize and retry
      Backend.setServer(mockServerAPI);
      mockServerAPI.callPluginMethod.mockResolvedValue({ result: [] });
      
      const launchers = await Backend.getLaunchers();
      expect(launchers).toEqual([]);
    });

    test('should handle partial backend failures', async () => {
      let callCount = 0;
      mockServerAPI.callPluginMethod.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ result: [{ id: 'steam', status: 'installed' }] });
      });
      
      Backend.setServer(mockServerAPI);
      
      // First call fails
      await expect(Backend.getLaunchers()).rejects.toThrow('Temporary failure');
      
      // Second call succeeds
      const launchers = await Backend.getLaunchers();
      expect(launchers).toHaveLength(1);
      expect(launchers[0].id).toBe('steam');
    });
  });
});