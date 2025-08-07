/**
 * Comprehensive test suite for Launcher Hub frontend
 * Tests the main React component and all its functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Decky environment
const mockServerAPI = {
  callPluginMethod: jest.fn(),
  toaster: {
    toast: jest.fn(),
  },
};

// Import the actual Content component and Backend class
const { Content } = require('../../src/components/Content.tsx');
const { Backend } = require('../../src/services/Backend.ts');
const { cache } = require('../../src/services/cache.ts');

describe('Launcher Hub Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset the Backend serverAPI
    Backend.serverAPI = null;
    
    // Clear cache before each test
    cache.clear();
  });

  describe('Component Initialization', () => {
    test('should initialize with default state', () => {
      const { container, getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      // Should show loading initially
      expect(getByText('Loading...')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
    });

    test('should set Backend server on mount', () => {
      render(<Content serverAPI={mockServerAPI} />);
      
      expect(Backend.serverAPI).toBe(mockServerAPI);
    });

    test('should load data on mount', async () => {
      const mockLaunchers = [
        { id: 'steam', name: 'Steam', installed: true },
        { id: 'epic', name: 'Epic Games', installed: false },
      ];
      
      const mockServices = [
        { id: 'geforce_now', name: 'GeForce NOW', installed: false },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: mockServices });
      
      render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(mockServerAPI.callPluginMethod).toHaveBeenCalledWith('get_launchers', {});
        expect(mockServerAPI.callPluginMethod).toHaveBeenCalledWith('get_services', {});
      });
    });
  });

  describe('Error Handling', () => {
    test('should display error when backend call fails', async () => {
      mockServerAPI.callPluginMethod.mockRejectedValue(new Error('Backend error'));
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText(/Error: Backend error/i)).toBeInTheDocument();
      });
    });

    test('should store errors in localStorage', () => {
      // Import and initialize error handler to ensure it's set up
      const { initializeErrorHandler } = require('../../src/utils/errorHandler.ts');
      initializeErrorHandler();
      
      const testError = new Error('Test error');
      testError.stack = 'Error stack trace';
      
      // Trigger the global error handler
      const errorEvent = new ErrorEvent('error', {
        message: 'Test error',
        filename: 'file.js',
        lineno: 10,
        colno: 20,
        error: testError
      });
      window.dispatchEvent(errorEvent);
      
      const storedErrors = JSON.parse(localStorage.getItem('LauncherHubErrors') || '[]');
      expect(storedErrors).toHaveLength(1);
      expect(storedErrors[0]).toMatchObject({
        message: 'Test error',
        filename: 'file.js',
        lineno: 10,
        colno: 20,
      });
    });

    test('should have retry button on error', async () => {
      mockServerAPI.callPluginMethod
        .mockRejectedValueOnce(new Error('Backend error'))
        .mockRejectedValueOnce(new Error('Backend error'))
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Retry')).toBeInTheDocument();
      });
      
      // Clear cache before retry since errors clear cache
      cache.clear();
      
      fireEvent.click(getByText('Retry'));
      
      await waitFor(() => {
        expect(mockServerAPI.callPluginMethod).toHaveBeenCalledTimes(4); // 2 initial fail + 2 retry success
      });
    });
  });

  describe('Launcher Management', () => {
    test('should display launchers list', async () => {
      const mockLaunchers = [
        { id: 'steam', name: 'Steam', installed: true },
        { id: 'epic', name: 'Epic Games', installed: false },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Steam')).toBeInTheDocument();
        expect(getByText('Epic Games')).toBeInTheDocument();
      });
    });

    test('should handle launcher installation', async () => {
      const mockLaunchers = [
        { id: 'epic', name: 'Epic Games', installed: false },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ result: [{...mockLaunchers[0], installed: true}] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Epic Games')).toBeInTheDocument();
      });
      
      // Click on the Epic Games button (which shows "Not Installed")
      const epicButton = getByText('Epic Games').closest('button');
      fireEvent.click(epicButton);
      
      await waitFor(() => {
        expect(mockServerAPI.callPluginMethod).toHaveBeenCalledWith(
          'install_launcher',
          { launcher_id: 'epic' }
        );
      });
    });

    test('should handle launcher uninstallation', async () => {
      const mockLaunchers = [
        { id: 'steam', name: 'Steam', installed: true },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ result: [{...mockLaunchers[0], installed: false}] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Steam')).toBeInTheDocument();
      });
      
      // Click on the Steam button (which shows "Installed")
      const steamButton = getByText('Steam').closest('button');
      fireEvent.click(steamButton);
      
      await waitFor(() => {
        expect(mockServerAPI.callPluginMethod).toHaveBeenCalledWith(
          'uninstall_launcher',
          { launcher_id: 'steam' }
        );
      });
    });

    test('should show installation progress', async () => {
      const mockLaunchers = [
        { 
          id: 'epic', 
          name: 'Epic Games', 
          installed: false,
          installing: true,
          progress: 45,
          install_phase: 'Downloading'
        },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText(/Installing.*45%/)).toBeInTheDocument();
      });
    });
  });

  describe('Service Display', () => {
    test('should display streaming services', async () => {
      const mockServices = [
        { id: 'geforce_now', name: 'GeForce NOW', installed: false },
        { id: 'xbox_cloud', name: 'Xbox Cloud Gaming', installed: true },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: mockServices });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('GeForce NOW')).toBeInTheDocument();
        expect(getByText('Xbox Cloud Gaming')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('should show loading indicator initially', () => {
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      expect(getByText(/loading/i)).toBeInTheDocument();
    });

    test('should hide loading indicator after data loads', async () => {
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { queryByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Debug Interface', () => {
    test('should toggle debug info visibility', async () => {
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText, queryByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Show Debug Info')).toBeInTheDocument();
      });
      
      // Debug info should be hidden initially
      expect(queryByText('Clear All Errors')).not.toBeInTheDocument();
      
      // Click to show debug info
      fireEvent.click(getByText('Show Debug Info'));
      expect(getByText('Clear All Errors')).toBeInTheDocument();
      
      // Click to hide debug info
      fireEvent.click(getByText('Hide Debug Info'));
      expect(queryByText('Clear All Errors')).not.toBeInTheDocument();
    });

    test('should clear errors from debug interface', async () => {
      localStorage.setItem('LauncherHubErrors', JSON.stringify([{ error: 'test' }]));
      localStorage.setItem('LauncherHubLastError', JSON.stringify({ error: 'test' }));
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Show Debug Info')).toBeInTheDocument();
      });
      
      // Open debug section
      fireEvent.click(getByText('Show Debug Info'));
      
      // Clear errors
      fireEvent.click(getByText('Clear All Errors'));
      
      expect(localStorage.getItem('LauncherHubErrors')).toBeNull();
      expect(localStorage.getItem('LauncherHubLastError')).toBeNull();
    });
  });

  describe('Toast Notifications', () => {
    test('should show toast on successful installation', async () => {
      const mockLaunchers = [
        { id: 'epic', name: 'Epic Games', installed: false },
      ];
      
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: mockLaunchers })
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('Epic Games')).toBeInTheDocument();
      });
      
      const epicButton = getByText('Epic Games').closest('button');
      fireEvent.click(epicButton);
      
      await waitFor(() => {
        expect(mockServerAPI.toaster.toast).toHaveBeenCalledWith('Installing epic...');
      });
    });
  });

  describe('Empty States', () => {
    test('should show empty state for launchers', async () => {
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('No launchers available')).toBeInTheDocument();
      });
    });

    test('should show empty state for services', async () => {
      mockServerAPI.callPluginMethod
        .mockResolvedValueOnce({ result: [] })
        .mockResolvedValueOnce({ result: [] });
      
      const { getByText } = render(<Content serverAPI={mockServerAPI} />);
      
      await waitFor(() => {
        expect(getByText('No services available')).toBeInTheDocument();
      });
    });
  });
});